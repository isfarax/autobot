import { NextRequest, NextResponse } from 'next/server';
import { indexDocument } from '@/src/services/chat';
import { db } from '@/db';
import { ragDocuments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import path from 'path';
import fs from 'fs/promises';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_SIZE = 100 * 1024 * 1024;

const TEXT_EXTENSIONS = /\.(pdf|docx|txt|md|csv|html|xml|json|log|yaml|yml|ts|tsx|js|jsx|py|java|c|cpp|h|hpp|rb|go|rs|php|css|scss|sql|sh|bat|ps1|mdx|rst|tex|conf|cfg|ini|toml)$/i;
const AUDIO_EXTENSIONS = /\.(mp3|wav|ogg|flac|aac|m4a|wma|opus)$/i;
const VIDEO_EXTENSIONS = /\.(mp4|webm|avi|mov|mkv|flv|wmv|m4v)$/i;
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff|tif|ico)$/i;

function getFileCategory(filename: string): 'text' | 'audio' | 'video' | 'image' | null {
  if (TEXT_EXTENSIONS.test(filename)) return 'text';
  if (AUDIO_EXTENSIONS.test(filename)) return 'audio';
  if (VIDEO_EXTENSIONS.test(filename)) return 'video';
  if (IMAGE_EXTENSIONS.test(filename)) return 'image';
  return null;
}

function getMimeType(filename: string, detectedType: string): string {
  if (detectedType && detectedType !== 'application/octet-stream') return detectedType;
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    md: 'text/markdown', mdx: 'text/markdown',
    txt: 'text/plain', log: 'text/plain', yaml: 'text/plain', yml: 'text/plain',
    ts: 'text/plain', tsx: 'text/plain', js: 'text/plain', jsx: 'text/plain',
    py: 'text/plain', java: 'text/plain', c: 'text/plain', cpp: 'text/plain',
    h: 'text/plain', hpp: 'text/plain', rb: 'text/plain', go: 'text/plain',
    rs: 'text/plain', php: 'text/plain', css: 'text/plain', scss: 'text/plain',
    sql: 'text/plain', sh: 'text/plain', bat: 'text/plain', ps1: 'text/plain',
    rst: 'text/plain', tex: 'text/plain', conf: 'text/plain', cfg: 'text/plain',
    ini: 'text/plain', toml: 'text/plain',
    csv: 'text/csv', html: 'text/html', xml: 'text/xml',
    json: 'application/json', pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', flac: 'audio/flac',
    mp4: 'video/mp4', webm: 'video/webm', avi: 'video/x-msvideo',
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
    webp: 'image/webp', svg: 'image/svg+xml',
  };
  return ext && mimeMap[ext] ? mimeMap[ext] : 'application/octet-stream';
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const category = getFileCategory(file.name);
    if (!category) {
      return NextResponse.json({ error: `Unsupported file type: ${file.name}` }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 100MB)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(UPLOAD_DIR, filename);
    await fs.writeFile(filePath, buffer);

    const mimeType = getMimeType(file.name, file.type);
    const indexResult = await indexDocument(filePath, mimeType, filename, file.name, category);

    return NextResponse.json({
      success: true,
      filename: file.name,
      storedAs: filename,
      size: file.size,
      chunkCount: indexResult.chunkCount,
      totalChars: indexResult.totalChars,
      indexed: indexResult.indexed,
    });
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Failed to process document';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const docs = await db.select().from(ragDocuments).orderBy(ragDocuments.uploadedAt);
    return NextResponse.json({ files: docs });
  } catch (error) {
    console.error('List error:', error);
    return NextResponse.json({ files: [] });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'No ID provided' }, { status: 400 });

    const docId = parseInt(id, 10);
    const rows = await db.select().from(ragDocuments).where(eq(ragDocuments.id, docId));
    if (!rows[0]) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    const storedPath = path.join(UPLOAD_DIR, rows[0].filename);
    try { await fs.unlink(storedPath); } catch { /* file may not exist */ }

    await db.delete(ragDocuments).where(eq(ragDocuments.id, docId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, includedInRag } = body;
    if (id === undefined || includedInRag === undefined) {
      return NextResponse.json({ error: 'Missing id or includedInRag' }, { status: 400 });
    }

    await db.update(ragDocuments)
      .set({ includedInRag: !!includedInRag })
      .where(eq(ragDocuments.id, parseInt(id, 10)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Toggle error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
