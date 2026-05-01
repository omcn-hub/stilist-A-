export const FormData = globalThis.FormData;
export const Blob = globalThis.Blob;
export const File = globalThis.File;
export const formDataToBlob = async (f) => new Response(f).blob();
