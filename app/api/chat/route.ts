import { NextRequest, NextResponse } from 'next/server';
import { agenticAnswer } from '@/src/services/agents';
import { addMessage, createSession, listSessions, getSession, getMessages, deleteSession } from '@/src/services/conversations-db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationId, files } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let sessionId = conversationId;
    if (!sessionId) {
      sessionId = await createSession();
    }

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    await addMessage(sessionId, 'user', message, files || null);

    const result = await agenticAnswer(message);

    return NextResponse.json({
      reply: result.answer,
      sources: result.sources || [],
      conversationId: sessionId,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    const sessions = await listSessions();
    return NextResponse.json({ conversations: sessions });
  }

  const session = await getSession(conversationId);
  if (!session) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  const messages = await getMessages(conversationId);
  return NextResponse.json({ conversation: session, messages });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json({ error: 'conversationId required' }, { status: 400 });
  }

  await deleteSession(conversationId);
  return NextResponse.json({ success: true });
}
