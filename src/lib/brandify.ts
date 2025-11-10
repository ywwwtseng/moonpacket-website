export function escapeHtml(input: string): string {
  return input
    .replaceAll(/&/g, "&amp;")
    .replaceAll(/</g, "&lt;")
    .replaceAll(/>/g, "&gt;")
    .replaceAll(/"/g, "&quot;")
    .replaceAll(/'/g, "&#39;");
}

// Replace case-insensitively, preserve original casing in text content by always rendering lower-case visually.
export function brandify(input?: string): string {
  const s = (input ?? "").toString();
  const esc = escapeHtml(s);
  // Replace all occurrences of "moonpacket" (case-insensitive) with brand-mark span.
  let result = esc.replace(/moonpacket/gi, '<span class="brand-mark">moonpacket</span>');
  // Replace all occurrences of "moonini" (case-insensitive) with brand-mark span.
  result = result.replace(/moonini/gi, '<span class="brand-mark">moonini</span>');
  return result;
}
