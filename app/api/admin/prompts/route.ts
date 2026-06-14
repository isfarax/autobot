import { NextRequest, NextResponse } from 'next/server';
import { listPrompts, getPrompt, createPrompt, updatePrompt, deletePrompt } from '@/src/services/agent-prompts';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const prompt = await getPrompt(Number(id));
    if (!prompt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(prompt);
  }

  const prompts = await listPrompts();
  return NextResponse.json(prompts);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'create') {
      const prompt = await createPrompt(body.data);
      return NextResponse.json(prompt);
    }

    if (action === 'update') {
      const prompt = await updatePrompt(body.id, body.data);
      return NextResponse.json(prompt);
    }

    if (action === 'delete') {
      await deletePrompt(body.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Prompts API error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
