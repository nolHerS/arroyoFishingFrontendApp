export interface CaptureImage {
    id: number,
    originalUrl: string;
    thumbnailUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    width: number;
    height: number;
    uploadedAt: string; // ISO 8601 date string
}

export interface ImageUploadResponse {
  captureId: number;
  uploadedImages: CaptureImage[];
  totalImages: number;
  message: string;
}

export interface ImageDeleteResponse {
  imageId: number;
  captureId: number;
  deleted: boolean;
  message: string;
}

export interface ImageErrorResponse {
  timestamp: string;
  status: number;
  message: string;
  errors: string[];
  path: string;
}