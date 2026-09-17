import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const products = await db
      .collection('products')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(products);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    const newProduct = {
      name: body.name,
      description: body.description || '',
      defaultUnitPrice: Number(body.defaultUnitPrice) || 0,
      unit: body.unit || 'pc',
      createdAt: new Date().toISOString()
    };

    const { db } = await connectToDatabase();
    const result = await db.collection('products').insertOne(newProduct);

    return NextResponse.json({ ...newProduct, _id: result.insertedId.toString() });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
