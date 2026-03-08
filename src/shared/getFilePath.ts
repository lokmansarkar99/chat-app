// fieldname (form-data key) → actual folder on disk
const FIELD_TO_FOLDER: Record<string, string> = {
  profileImage: 'user',
  productImage: 'product',
  image:        'image',
  media:        'media',
  doc:          'doc',
};

export type IFolderName =
  | 'profileImage'
  | 'productImage'
  | 'image'
  | 'media'
  | 'doc'
  | 'license'
  | 'banner'
  | 'logo'
  | 'others';

// ── Single file path ──────────────────────────────
export const getSingleFilePath = (
  files: any,
  fieldName: IFolderName
): string | undefined => {
  const fileField = files?.[fieldName];
  if (Array.isArray(fileField) && fileField.length > 0) {
    const folder = FIELD_TO_FOLDER[fieldName] ?? fieldName;
    return `/${folder}/${fileField[0].filename}`;
  }
  return undefined;
};

// ── Multiple file paths ───────────────────────────
export const getMultipleFilesPath = (
  files: any,
  fieldName: IFolderName
): string[] | undefined => {
  const fileField = files?.[fieldName];
  if (Array.isArray(fileField) && fileField.length > 0) {
    const folder = FIELD_TO_FOLDER[fieldName] ?? fieldName;
    return fileField.map((f: any) => `/${folder}/${f.filename}`);
  }
  return undefined;
};
