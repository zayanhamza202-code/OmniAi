"use client";

import { useState } from "react";
import { uploadImage } from "@/services/uploadImage";

export interface UploadedImage {
  filename: string;
  mime_type: string;
  base64: string;
}

export function useImageUpload() {
  const [images, setImages] = useState<UploadedImage[]>([]);

  async function upload(
    selectedFiles: FileList | File[]
  ) {
    for (const file of Array.from(selectedFiles)) {
      try {
        const result = await uploadImage(file);

        setImages((prev) => [
          ...prev,
          result,
        ]);
      } catch (err) {
        console.error(err);
      }
    }
  }

  function remove(index: number) {
    setImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  function clear() {
    setImages([]);
  }

  return {
    images,
    upload,
    remove,
    clear,
  };
}