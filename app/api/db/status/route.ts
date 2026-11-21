import { NextResponse } from 'next/server';
import { initDatabase, isDbConnected, getConnectionString } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const connected = isDbConnected();
  const initResult = await initDatabase();
  
  return NextResponse.json({
    status: 'ok',
    neonPostgresConfigured: connected,
    dbMode: initResult.mode,
    detail: initResult.message || initResult.error,
    timestamp: new Date().toISOString(),
  });
}
