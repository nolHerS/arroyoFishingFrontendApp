export interface ImageValidationConfig {
  maxFileSize: number;        // en bytes
  maxImagesPerCapture: number;
  allowedTypes: string[];
  maxWidth?: number;
  maxHeight?: number;
}

export const IMAGE_CONFIG: ImageValidationConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxImagesPerCapture: 5,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxWidth: 4000,
  maxHeight: 4000
};