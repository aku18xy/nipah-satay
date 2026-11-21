import { NextRequest, NextResponse } from 'next/server';
import { 
  getDbProductionData, 
  addDbMeatIntake, 
  addDbSkewerLog, 
  updateDbStorage,
  isDbConnected 
} from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getDbProductionData();
    return NextResponse.json({
      ...data,
      isDbConnected: isDbConnected(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve production data', detail: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, data } = body;

    if (action === 'intake') {
      const saved = await addDbMeatIntake(data);
      return NextResponse.json({ success: true, record: saved });
    } else if (action === 'skewer_log') {
      const saved = await addDbSkewerLog(data);
      return NextResponse.json({ success: true, log: saved });
    } else if (action === 'storage') {
      const saved = await updateDbStorage(data);
      return NextResponse.json({ success: true, storage: saved });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to process production update', detail: error.message },
      { status: 500 }
    );
  }
}
