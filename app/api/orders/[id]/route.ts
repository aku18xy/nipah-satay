import { NextRequest, NextResponse } from 'next/server';
import { updateDbOrderStatus } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, stationStatus } = body;

    const ok = await updateDbOrderStatus(id, status, stationStatus);
    return NextResponse.json({ success: ok, orderId: id });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update order status', detail: error.message },
      { status: 500 }
    );
  }
}
