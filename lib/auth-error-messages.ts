/** Maps common raw Supabase Auth error messages to localized, actionable text.
 * Falls back to the raw message if nothing matches — better than nothing, but
 * every case we know we'll hit in practice should be listed here. */
export function mapSupabaseAuthError(message: string, locale: "en" | "ro"): string {
  const m = message.toLowerCase();

  if (m.includes("rate limit") || m.includes("too many requests")) {
    return locale === "ro"
      ? "Prea multe încercări. Așteaptă puțin și încearcă din nou."
      : "Too many attempts. Please wait a moment and try again.";
  }
  if (m.includes("email not confirmed")) {
    return locale === "ro"
      ? "Emailul nu a fost confirmat încă. Verifică inboxul sau retrimite emailul de confirmare."
      : "Email not confirmed yet. Check your inbox, or resend the confirmation email.";
  }
  if (m.includes("already registered") || m.includes("already exists") || m.includes("user already registered")) {
    return locale === "ro"
      ? "Există deja un cont cu acest email. Încearcă să te conectezi."
      : "An account with this email already exists. Try signing in instead.";
  }
  if (m.includes("invalid login credentials") || m.includes("invalid email or password")) {
    return locale === "ro"
      ? "Email sau parolă incorectă."
      : "Incorrect email or password.";
  }
  if (m.includes("password should be at least") || m.includes("password is too short")) {
    return locale === "ro"
      ? "Parola trebuie să aibă cel puțin 6 caractere."
      : "Password must be at least 6 characters.";
  }
  if (m.includes("failed to fetch") || m.includes("network")) {
    return locale === "ro"
      ? "Nu s-a putut contacta serverul. Verifică conexiunea la internet și încearcă din nou."
      : "Couldn't reach the server. Check your connection and try again.";
  }

  return message;
}
