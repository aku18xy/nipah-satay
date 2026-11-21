import { NextRequest, NextResponse } from 'next/server';
import { updateDbOrderDetails } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const ok = await updateDbOrderDetails(id, body);
    return NextResponse.json({ success: ok, orderId: id });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update order', detail: error.message },
      { status: 500 }
    );
  }
}
