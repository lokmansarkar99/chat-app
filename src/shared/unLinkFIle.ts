import fs from "fs";
import path from "path";
import { de } from "zod/locales";

 const unlinkFile = (filePath: string) => {

  if (!filePath) return;

  // remove leading slash if exists
  const cleanPath = filePath.startsWith("/")
    ? filePath.slice(1)
    : filePath;

  const fullPath = path.join(process.cwd(), "uploads", cleanPath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    console.log("Deleted:", fullPath);
  } else {
    console.log("File not found:", fullPath);
  }
};

export default unlinkFile;