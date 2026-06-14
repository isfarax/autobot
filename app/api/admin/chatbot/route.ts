import { NextRequest, NextResponse } from 'next/server';
import { getConfig, updateConfig } from '@/src/services/chatbot-config';

export async function GET() {
  const config = await getConfig();
  return NextResponse.json(config);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const config = await updateConfig(body);
    return NextResponse.json(config);
  } catch (error) {
    console.error('Chatbot config error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
