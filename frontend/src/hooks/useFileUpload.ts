"use client";

import { useState } from "react";

import { uploadFile } from "@/services/upload";
import { uploadImage } from "@/services/uploadImage";

export interface UploadedFile {
  name: string;
  text?: string;
  isImage: boolean;
  mime_type?: string;
  base64?: string;
  preview?: string;
}

export function useFileUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  async function upload(selectedFiles: FileList | File[]) {
    for (const file of Array.from(selectedFiles)) {
      try {
        if (file.type.startsWith("image/")) {
          const result = await uploadImage(file);
          setFiles((prev) => [
            ...prev,
            {
              name: result.filename,
              isImage: true,
              mime_type: result.mime_type,
              base64: result.base64,
              preview: `data:${result.mime_type};base64,${result.base64}`,
            },
          ]);
        } else {
          const result = await uploadFile(file);
          setFiles((prev) => [
            ...prev,
            {
              name: result.filename,
              text: result.text,
              isImage: false,
            },
          ]);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  function remove(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function clear() {
    setFiles([]);
  }

  return {
    files,
    upload,
    remove,
    clear,
  };
}