/** HTML checkboxes submit "on" when checked; hidden fields may send "true"/"false". */
export function formCheckboxEnabled(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  if (value === "false") return false;
  return value === "on" || value === "true";
}
