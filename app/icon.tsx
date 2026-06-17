import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 7,
          background: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Thermometer shape using box elements */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Stem */}
          <div
            style={{
              position: "absolute",
              top: -11,
              left: -2.5,
              width: 5,
              height: 16,
              borderRadius: 3,
              background: "white",
            }}
          />
          {/* Mercury in stem */}
          <div
            style={{
              position: "absolute",
              top: -5,
              left: -1,
              width: 2,
              height: 9,
              borderRadius: 2,
              background: "#93c5fd",
            }}
          />
          {/* Bulb outer */}
          <div
            style={{
              position: "absolute",
              top: 4,
              left: -5,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "white",
            }}
          />
          {/* Bulb fill */}
          <div
            style={{
              position: "absolute",
              top: 6,
              left: -3,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#60a5fa",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
