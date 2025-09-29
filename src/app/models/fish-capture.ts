export interface FishCapture {
  id: number;
  captureData: string;   // se puede convertir a Date en TS si quieres
  createdAt?: string;    // opcional, como LocalDateTime
  fishType: string;
  location?: string;
  weight: number;
  userId: number;        // solo guardamos la referencia al id del usuario
}
