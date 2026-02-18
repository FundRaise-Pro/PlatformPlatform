export async function readImageFile(file?: File): Promise<string | undefined> {
  if (!file) {
    return undefined;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : undefined);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
