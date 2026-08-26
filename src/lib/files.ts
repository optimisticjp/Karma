/**
 * Brief-upload constraints (audit fixes): signature checks, not just
 * extension; svg/eps removed (script/PostScript risk); explicit totals.
 * Modern .ai files are PDF-compatible, so they must pass the %PDF check.
 */
export const MAX_FILES = 3;
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 20 * 1024 * 1024;
export const ALLOWED_EXT = /\.(png|jpe?g|webp|pdf|ai|zip)$/i;
export const ACCEPT_ATTR = ".png,.jpg,.jpeg,.webp,.pdf,.ai,.zip";

function startsWith(bytes: Uint8Array, sig: number[], offset = 0) {
  return sig.every((b, i) => bytes[offset + i] === b);
}

/** Validates real content signature of the first bytes. */
export async function hasValidSignature(file: File): Promise<boolean> {
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (head.length < 4) return false;
  const isPng = startsWith(head, [0x89, 0x50, 0x4e, 0x47]);
  const isJpg = startsWith(head, [0xff, 0xd8, 0xff]);
  const isWebp =
    startsWith(head, [0x52, 0x49, 0x46, 0x46]) && startsWith(head, [0x57, 0x45, 0x42, 0x50], 8);
  const isPdf = startsWith(head, [0x25, 0x50, 0x44, 0x46]); // %PDF (also modern .ai)
  const isZip = startsWith(head, [0x50, 0x4b, 0x03, 0x04]) || startsWith(head, [0x50, 0x4b, 0x05, 0x06]);
  const name = file.name.toLowerCase();
  if (name.endsWith(".png")) return isPng;
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return isJpg;
  if (name.endsWith(".webp")) return isWebp;
  if (name.endsWith(".pdf") || name.endsWith(".ai")) return isPdf;
  if (name.endsWith(".zip")) return isZip;
  return false;
}
