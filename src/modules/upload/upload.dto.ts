export interface UploadFileDto {
  file: File | Blob
  userId: string
  bucket?: string
  folder?: string
}

export interface UploadResponse {
  message: string
  url: string
  path: string
}

export interface DeleteFileDto {
  path: string
  bucket?: string
}

export interface DeleteResponse {
  message: string
}

export interface GetPublicUrlDto {
  path: string
  bucket?: string
}


