import { NextRequest, NextResponse } from 'next/server';
import { getDbOrders, createDbOrder, isDbConnected } from '@/lib/db';
import { Order } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await getDbOrders();
    return NextResponse.json({
      orders,
      isDbConnected: isDbConnected(),
      total: orders.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve orders', detail: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newOrder: Order = {
      ...body,
      id: body.id || `ord-${Date.now()}`,
      createdAt: body.createdAt || new Date().toISOString(),
      status: body.status || 'pending',
      stationStatus: body.stationStatus || {
        grill: body.items?.some((i: any) => i.station === 'grill') ? 'pending' : 'done',
        wok: body.items?.some((i: any) => i.station === 'wok') ? 'pending' : 'done',
        prep_bar: body.items?.some((i: any) => i.station === 'prep_bar') ? 'pending' : 'done',
      },
    };

    const saved = await createDbOrder(newOrder);
    return NextResponse.json({ success: true, order: saved });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create order', detail: error.message },
      { status: 500 }
    );
  }
}
