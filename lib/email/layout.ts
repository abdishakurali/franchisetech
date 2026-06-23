// Server-side only — shared HTML email shell

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://franchisetech.ro";
const LOGO_URL = `${BASE_URL}/franchise-tech-logo.png`;

export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function emailLayout(params: {
  lang: "ro" | "en";
  headerColor?: string;
  title: string;
  bodyHtml: string;
  footerHtml: string;
}): string {
  const headerColor = params.headerColor ?? "#1d4ed8";
  return `<!DOCTYPE html>
<html lang="${params.lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;max-width:600px;width:100%;">
        <tr><td style="background:${headerColor};padding:20px 24px;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:12px;vertical-align:middle;">
              <img src="${LOGO_URL}" alt="franchisetech" width="36" height="36" style="display:block;border-radius:8px;" />
            </td>
            <td style="vertical-align:middle;">
              <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">franchisetech</p>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:28px 24px;">
          <h1 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 16px;">${esc(params.title)}</h1>
          ${params.bodyHtml}
        </td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid #e2e8f0;background:#f8fafc;">
          <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">${params.footerHtml}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function appUrl(path: string): string {
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
