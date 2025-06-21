import { Injectable } from "@nestjs/common";

@Injectable()
export class FileTypeService {
  private textTypes = new Set([
    'text/plain',
    'text/markdown',
    'application/json'
  ]);

  private previewableTypes = new Set([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg'
  ]);

  isTextType(fileType: string): boolean {
    return this.textTypes.has(fileType);
  }

  isPreviewable(fileType: string): boolean {
    return this.previewableTypes.has(fileType);
  }
}