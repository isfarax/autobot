import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatFiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const fileId = parseInt(id, 10);
    if (isNaN(fileId)) {
      return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
    }

    const rows = await db.select().from(chatFiles).where(eq(chatFiles.id, fileId)).limit(1);
    if (!rows[0]) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const file = rows[0];
    return new NextResponse(new Uint8Array(file.fileData), {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `inline; filename="${file.originalName}"`,
        'Content-Length': String(file.fileSize),
      },
    });
  } catch (error) {
    console.error('Chat file serve error:', error);
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}
