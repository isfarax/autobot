import { NextRequest, NextResponse } from 'next/server';
import {
  getAllProviders,
  upsertProvider,
  removeProvider,
  setActiveProvider,
  getActiveProvider,
} from '@/src/services/llm';

export async function GET() {
  const providers = await getAllProviders();
  const active = await getActiveProvider();
  return NextResponse.json({ providers, activeProviderId: active?.id || null });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'upsert') {
      await upsertProvider(body.config);
      return NextResponse.json({ success: true });
    }

    if (action === 'remove') {
      await removeProvider(body.id);
      return NextResponse.json({ success: true });
    }

    if (action === 'set-active') {
      await setActiveProvider(body.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
