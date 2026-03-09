import fs from "fs";
import path from "path";

const unlinkFile = (filePath: string | null | undefined): void => {
  if (!filePath) return;

  // Leading slash remove করো
  const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;

  const fullPath = path.join(process.cwd(), "uploads", cleanPath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    console.log(`🗑️ Deleted: ${fullPath}`);
  } else {
    console.warn(`⚠️ File not found (skip): ${fullPath}`);
  }
};

// ── Multiple files একসাথে delete ─────────────────────────────
export const unlinkMultipleFiles = (filePaths: (string | null | undefined)[]): void => {
  filePaths.forEach((p) => unlinkFile(p));
};

export default unlinkFile;
