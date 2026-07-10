import axios from "axios";
import { API_URL } from "@/config/api";

export interface UploadedImage {
  filename: string;
  mime_type: string;
  base64: string;
}

export async function uploadImage(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await axios.post<UploadedImage>(
    `${API_URL}/upload-image`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}