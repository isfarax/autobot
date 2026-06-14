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
  bufferSize: number,
  category: 'audio' | 'video' | 'image',
  originalName: string,
): Promise<ProcessedDocument> {
  const ext = originalName.split('.').pop()?.toLowerCase() || '';
  const sizeMB = (bufferSize / (1024 * 1024)).toFixed(2);

  const text = `File: ${originalName}\nType: ${category}\nFormat: ${ext.toUpperCase()}\nSize: ${sizeMB} MB\n\nNote: This is a ${category} file. Text extraction is not supported for ${category} files. To make this content searchable, provide a text description or transcript.`;

  return { text, metadata: { filename: originalName } };
}

export async function processDocument(
  buffer: Buffer,
  mimeType: string,
  originalName: string = '',
  category: 'text' | 'audio' | 'video' | 'image' = 'text',
): Promise<ProcessedDocument> {
  if (category === 'audio' || category === 'video' || category === 'image') {
    return processMediaFile(buffer.length, category, originalName);
  }

  if (mimeType.includes('pdf')) {
    return processPdf(buffer, originalName);
  }
  if (mimeType.includes('openxmlformats') || mimeType.includes('word')) {
    return processDocx(buffer, originalName);
  }
  return processTxt(buffer, originalName);
}
