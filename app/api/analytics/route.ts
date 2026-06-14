import { NextResponse } from 'next/server';
import { getQueryStats } from '@/src/services/analytics';

export async function GET() {
  try {
    const stats = await getQueryStats();
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ totalQueries: 0, uniqueSessions: 0 });
  }
}
