import { NextResponse } from 'next/server';
import { updateDbStation, deleteDbStation } from '@/lib/db';

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
    if (body.label !== undefined) updates.label = String(body.label).trim();
    if (body.icon !== undefined) updates.icon = body.icon;
    if (body.description !== undefined) updates.description = String(body.description).trim();
    if (body.sortOrder !== undefined) updates.sortOrder = Number(body.sortOrder);

    const updated = await updateDbStation(id, updates);

    return NextResponse.json({
      success: true,
      station: updated,
      message: 'Stesen dapur berjaya dikemas kini!',
    });
  } catch (error: any) {
    console.error('Error updating station:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengemas kini stesen' },
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

    // Protection: Keep at least one default station or prevent deletion of primary grill
    if (id === 'grill' || id === 'wok') {
      return NextResponse.json(
        { success: false, error: `Stesen utama "${id}" adalah stesen teras sistem dan tidak boleh dipadamkan.` },
        { status: 400 }
      );
    }

    await deleteDbStation(id);

    return NextResponse.json({
      success: true,
      message: 'Stesen dapur berjaya dipadamkan!',
    });
  } catch (error: any) {
    console.error('Error deleting station:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memadam stesen dapur' },
      { status: 500 }
    );
  }
}
