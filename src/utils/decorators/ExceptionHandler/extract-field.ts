export function extractFieldNameFromDetail(detail: string): string | null {
  const match = detail.match(/Key \((.*?)\)=/);
  return match ? match[1] : null;
}
