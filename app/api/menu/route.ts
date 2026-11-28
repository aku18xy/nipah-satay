import { NextResponse } from 'next/server';
import { getDbMenuItems, getDbCategories, getDbStations, createDbMenuItem } from '@/lib/db';
import { MenuItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [items, categories, stations] = await Promise.all([
      getDbMenuItems(),
      getDbCategories(),
      getDbStations(),
    ]);

    return NextResponse.json({
      success: true,
      items,
      categories,
      stations,
    });
  } catch (error: any) {
    console.error('Error fetching menu & categories:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memuatkan data menu' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.name || !body.category || body.price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Sila lengkapkan nama, kategori dan harga menu.' },
        { status: 400 }
      );
    }

    const newItem: MenuItem = {
      id: body.id || `menu-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: String(body.name).trim(),
      category: body.category,
      price: Number(body.price),
      unit: body.unit || 'hidangan',
      minOrder: body.minOrder ? Number(body.minOrder) : 1,
      image: body.image || '',
      description: body.description || '',
      station: body.station || (body.category === 'sate' ? 'grill' : body.category === 'minuman' ? 'prep_bar' : 'wok'),
      available: body.available !== false,
      costEstimate: body.costEstimate ? Number(body.costEstimate) : 0,
    };

    const saved = await createDbMenuItem(newItem);

    return NextResponse.json({
      success: true,
      item: saved,
      message: `Menu "${saved.name}" berjaya ditambah!`,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menambah menu' },
      { status: 500 }
    );
  }
}
