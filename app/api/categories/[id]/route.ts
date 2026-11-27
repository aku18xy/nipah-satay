import { NextResponse } from 'next/server';
import { updateDbCategory, deleteDbCategory } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updates: any = {};
    if (body.label !== undefined) updates.label = String(body.label).trim();
    if (body.icon !== undefined) updates.icon = body.icon;
    if (body.subcategories !== undefined) updates.subcategories = body.subcategories;
    if (body.sortOrder !== undefined) updates.sortOrder = Number(body.sortOrder);

    const updated = await updateDbCategory(id, updates);

    return NextResponse.json({
      success: true,
      category: updated,
      message: 'Kategori berjaya dikemas kini!',
    });
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengemas kini kategori' },
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

    // Protection: Do not allow deletion of root 'all' category
    if (id === 'all') {
      return NextResponse.json(
        { success: false, error: 'Kategori utama "Semua" tidak boleh dipadamkan.' },
        { status: 400 }
      );
    }

    await deleteDbCategory(id);

    return NextResponse.json({
      success: true,
      message: 'Kategori berjaya dipadamkan!',
    });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memadam kategori' },
      { status: 500 }
    );
  }
}
