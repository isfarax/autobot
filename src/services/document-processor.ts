import fs from 'fs/promises';
import path from 'path';

export interface ProcessedDocument {
  text: string;
  metadata: {
    filename: string;
  };
}

export async function processPdf(buffer: Buffer, filename: string = ''): Promise<ProcessedDocument> {
  const { PDFParse } = await import('pdf-parse');
  const parser = new (PDFParse as any)({});
  await parser.load(buffer);
  const text = await parser.getText();
  return { text, metadata: { filename } };
}

export async function processDocx(buffer: Buffer, filename: string = ''): Promise<ProcessedDocument> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return { text: result.value, metadata: { filename } };
}

export async function processTxt(buffer: Buffer, filename: string = ''): Promise<ProcessedDocument> {
  return { text: buffer.toString('utf-8'), metadata: { filename } };
}

export async function processMediaFile(
  filePath: string,
  category: 'audio' | 'video' | 'image',
  originalName: string,
): Promise<ProcessedDocument> {
  const stats = await fs.stat(filePath);
  const ext = path.extname(originalName).toLowerCase();
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  const text = `File: ${originalName}\nType: ${category}\nFormat: ${ext.slice(1).toUpperCase()}\nSize: ${sizeMB} MB\n\nNote: This is a ${category} file. Text extraction is not supported for ${category} files. To make this content searchable, provide a text description or transcript.`;

  return { text, metadata: { filename: originalName } };
}

export async function processDocument(
  filePath: string,
  mimeType: string,
  originalName: string = '',
  category: 'text' | 'audio' | 'video' | 'image' = 'text',
): Promise<ProcessedDocument> {
  const buffer = await fs.readFile(filePath);

  if (category === 'audio' || category === 'video' || category === 'image') {
    return processMediaFile(filePath, category, originalName);
  }

  if (mimeType.includes('pdf')) {
    return processPdf(buffer, originalName);
  }
  if (mimeType.includes('openxmlformats') || mimeType.includes('word')) {
    return processDocx(buffer, originalName);
  }
  return processTxt(buffer, originalName);
}
