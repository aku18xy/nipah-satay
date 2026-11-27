import { NextResponse } from 'next/server';
import { getDbCategories, createDbCategory } from '@/lib/db';
import { MenuCategory } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await getDbCategories();
    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memuatkan senarai kategori' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.label) {
      return NextResponse.json(
        { success: false, error: 'Sila masukkan nama kategori.' },
        { status: 400 }
      );
    }

    const label = String(body.label).trim();
    // Generate clean slug id from label if not provided
    const id = body.id
      ? String(body.id).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '')
      : label.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');

    const newCategory: MenuCategory = {
      id: id || `cat_${Date.now()}`,
      label,
      icon: body.icon || '🍽️',
      subcategories: Array.isArray(body.subcategories) ? body.subcategories : [],
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : 10,
    };

    const saved = await createDbCategory(newCategory);

    return NextResponse.json({
      success: true,
      category: saved,
      message: `Kategori "${saved.label}" berjaya ditambah!`,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menambah kategori' },
      { status: 500 }
    );
  }
}
