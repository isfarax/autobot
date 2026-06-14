import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatFiles } from '@/db/schema';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `chat_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    const rows = await db.insert(chatFiles).values({
      filename,
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
      fileData: buffer,
    }).returning({ id: chatFiles.id });

    return NextResponse.json({
      success: true,
      filename,
      originalName: file.name,
      size: file.size,
      url: `/api/chat-files/${rows[0].id}`,
    });
  } catch (error) {
    console.error('Chat file upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
