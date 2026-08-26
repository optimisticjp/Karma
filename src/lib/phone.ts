/** Single source of truth for Indian mobile normalization (audit: was duplicated). */
export function cleanIndianMobile(input: string): string {
  return input.replace(/[^\d]/g, "").replace(/^91(?=\d{10}$)/, "");
}

export function isIndianMobile(input: string): boolean {
  return /^[6-9]\d{9}$/.test(cleanIndianMobile(input));
}
