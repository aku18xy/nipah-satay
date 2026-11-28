import { NextResponse } from 'next/server';
import { getDbStations, createDbStation } from '@/lib/db';
import { KitchenStation } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stations = await getDbStations();
    return NextResponse.json({
      success: true,
      stations,
    });
  } catch (error: any) {
    console.error('Error fetching stations:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memuatkan stesen dapur' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Sila masukkan nama stesen dapur.' },
        { status: 400 }
      );
    }

    const name = String(body.name).trim();
    // Generate clean slug ID from name or custom id
    const id = body.id
      ? String(body.id).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '')
      : name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');

    const newStation: KitchenStation = {
      id: id || `station_${Date.now()}`,
      name,
      label: body.label ? String(body.label).trim() : `${name} (${id})`,
      icon: body.icon || '🍳',
      description: body.description ? String(body.description).trim() : '',
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : 10,
    };

    const saved = await createDbStation(newStation);

    return NextResponse.json({
      success: true,
      station: saved,
      message: `Stesen "${saved.name}" berjaya ditambah!`,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating station:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menambah stesen dapur' },
      { status: 500 }
    );
  }
}
