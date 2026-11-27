import { NextResponse } from 'next/server';
import { updateDbMenuItem, deleteDbMenuItem } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updates: any = {};
    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.category !== undefined) updates.category = body.category;
    if (body.price !== undefined) updates.price = Number(body.price);
    if (body.unit !== undefined) updates.unit = body.unit;
    if (body.minOrder !== undefined) updates.minOrder = Number(body.minOrder);
    if (body.image !== undefined) updates.image = body.image;
    if (body.description !== undefined) updates.description = body.description;
    if (body.station !== undefined) updates.station = body.station;
    if (body.available !== undefined) updates.available = Boolean(body.available);
    if (body.costEstimate !== undefined) updates.costEstimate = Number(body.costEstimate);

    const updated = await updateDbMenuItem(id, updates);

    return NextResponse.json({
      success: true,
      item: updated,
      message: 'Menu berjaya dikemas kini!',
    });
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengemas kini menu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteDbMenuItem(id);

    return NextResponse.json({
      success: true,
      message: 'Menu berjaya dipadamkan!',
    });
  } catch (error: any) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memadam menu' },
      { status: 500 }
    );
  }
}
