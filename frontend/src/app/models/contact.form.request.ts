export interface ContactFormRequest {
  description: string;
  mailAddress: string;
  attachmentData: string[] | null;
  attachmentFileName: string[] | null;
  attachmentContentType: string[] | null;
  mailType: string;
}
