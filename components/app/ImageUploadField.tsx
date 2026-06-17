"use client";

import { useRef, useState } from "react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

interface ImageUploadFieldProps {
  currentImageUrl?: string | null;
  inputName?: string;
  productName?: string;
}

export function ImageUploadField({
  currentImageUrl,
  inputName = "image_file",
  productName = "Product",
}: ImageUploadFieldProps) {
  // Named input — the only input submitted with the form
  const galleryRef = useRef<HTMLInputElement>(null);
  // Camera-only input — no name, triggered via .click(), never submitted
  const cameraRef  = useRef<HTMLInputElement>(null);

  const [preview,  setPreview]  = useState<string | null>(currentImageUrl ?? null);
  const [error,    setError]    = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleFile(file: File | null | undefined) {
    setError(null);
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please use a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_SIZE_MB} MB. This file is ${(file.size / 1024 / 1024).toFixed(1)} MB.`);
      return;
    }
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
    // Sync to the named gallery input so the form submits it
    const dt = new DataTransfer();
    dt.items.add(file);
    if (galleryRef.current) galleryRef.current.files = dt.files;
  }

  function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0]);
  }

  function handleCameraChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFile(file);
    // Reset so the same photo can be retaken if needed
    e.target.value = "";
  }

  // Opens the camera input directly — button click, NOT a label,
  // so it cannot accidentally trigger the gallery input
  function openCamera() {
    cameraRef.current?.click();
  }

  function remove() {
    setPreview(null);
    setFileName(null);
    setError(null);
    if (galleryRef.current) {
      galleryRef.current.value = "";
      galleryRef.current.files = new DataTransfer().files;
    }
  }

  return (
    <div className="space-y-3">
      {/* Hero preview square */}
      <div
        className="relative w-full aspect-square max-w-[200px] mx-auto rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden"
        aria-label="Product image preview"
      >
        {preview ? (
          <>
            <img src={preview} alt={productName} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={remove}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors"
              aria-label="Remove image"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium">No image</span>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-2 flex-wrap">
        {/* Gallery — label wraps the NAMED input */}
        <label className="cursor-pointer inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors font-medium">
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {preview ? "Change" : "Choose image"}
          <input
            ref={galleryRef}
            name={inputName}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleGalleryChange}
            className="sr-only"
          />
        </label>

        {/* Camera — plain button, triggers input via .click(), NOT a label */}
        <button
          type="button"
          onClick={openCamera}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors font-medium"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Take photo
        </button>

        {/* Camera input: no name (never in FormData), no label wrapping, purely .click()-triggered */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraChange}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      {fileName && !error && (
        <p className="text-center text-xs text-slate-500">{fileName}</p>
      )}
      {!preview && (
        <p className="text-center text-xs text-slate-400">
          JPG, PNG or WebP &middot; max {MAX_SIZE_MB}&nbsp;MB &middot; Square images work best
        </p>
      )}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-2 text-center">{error}</p>
      )}

      {/* Tell the server action to clear an existing image when preview was removed */}
      {!preview && currentImageUrl && (
        <input type="hidden" name="clear_image" value="1" />
      )}
    </div>
  );
}
