/** Open a full HTML report in a new window and trigger Save as PDF. */
export function openReportForPdf(html: string): void {
  const win = window.open("", "_blank", "width=1100,height=800,menubar=no,toolbar=yes,scrollbars=yes");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    win.focus();
    win.print();
  };
}
