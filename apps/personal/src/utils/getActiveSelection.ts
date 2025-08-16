// Works for textarea/input, contenteditable, and iframes (PDF excluded)
export function getActiveSelection(): string {
  const active = document.activeElement;

  // If inside an iframe, try its document
  if (active && active.tagName === "IFRAME") {
    try {
      const sel = (active as HTMLIFrameElement).contentWindow?.getSelection();
      return sel?.toString() || "";
    } catch {
      return "";
    }
  }

  // Textarea / Input
  if (active && (active.tagName === "TEXTAREA" || (active.tagName === "INPUT" && (active as HTMLInputElement).type === "text"))) {
    const start = (active as HTMLInputElement | HTMLTextAreaElement).selectionStart ?? 0;
    const end = (active as HTMLInputElement | HTMLTextAreaElement).selectionEnd ?? 0;
    return ((active as HTMLInputElement | HTMLTextAreaElement).value || "").slice(start, end);
  }

  // Contenteditable or general DOM selection
  const sel = window.getSelection && window.getSelection();
  return sel?.toString() || "";
}
