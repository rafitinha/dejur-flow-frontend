export type UploadItemStatus =
  | 'existing'
  | 'pending_upload'
  | 'pending_delete'
  | 'uploading'
  | 'deleting'
  | 'success'
  | 'error';

export type ExistingDocument = {
  documentId?: string;
  name?: string;
  type?: string;
  size?: number;
  uploadedAt?: string;
  downloadUrl?: string;
};

export type UploadItem = {
  id: string;
  documentId?: string;
  file?: File;
  name: string;
  type?: string;
  size?: number;
  uploadedAt?: string;
  downloadUrl?: string;
  status: UploadItemStatus;
  error?: string;
};
