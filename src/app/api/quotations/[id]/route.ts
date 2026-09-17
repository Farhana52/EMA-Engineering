import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { QuotationItem } from '@/types/invoice';
import { numberToWordsTaka } from '@/lib/number-to-words';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();
    const quotation = await db.collection('quotations').findOne({ _id: new ObjectId(id) });

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    return NextResponse.json(quotation);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { db } = await connectToDatabase();

    const items: QuotationItem[] = (body.items || []).map((item: {
      particulars?: string;
      listUnitPrice?: number;
      discountPrice?: number;
      qty?: number;
      unit?: string;
    }, idx: number) => {
      const slNo = (idx + 1).toString().padStart(2, '0');
      const listUnitPrice = Number(item.listUnitPrice) || 0;
      const discountPrice = Number(item.discountPrice) || listUnitPrice;
      const qty = Number(item.qty) || 1;
      const unit = item.unit || 'pc';
      const amount = discountPrice * qty;

      return {
        slNo,
        particulars: item.particulars || '',
        listUnitPrice,
        discountPrice,
        qty,
        unit,
        amount
      };
    });

    const totalQty = items.reduce((acc, curr) => acc + curr.qty, 0);
    const totalAmount = items.reduce((acc, curr) => acc + curr.amount, 0);
    const inWords = numberToWordsTaka(totalAmount);

    const updateDoc = {
      quoteNumber: body.quoteNumber,
      docType: body.docType || 'Quotation',
      date: body.date,
      clientName: body.clientName || '',
      clientDesignation: body.clientDesignation || '',
      clientCompany: body.clientCompany || '',
      clientAddress: body.clientAddress || '',
      subject: body.subject || '',
      salutation: body.salutation || 'Dear Sir,',
      openingText: body.openingText || '',
      items,
      totalQty,
      totalAmount,
      inWords,
      terms: Array.isArray(body.terms) ? body.terms : [],
      showTerms: body.showTerms !== false,
      companyAddress: body.companyAddress || '',
      companyNameColor: body.companyNameColor || '#dc2626',
      status: body.status || 'Draft',
      updatedAt: new Date().toISOString()
    };

    await db.collection('quotations').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    return NextResponse.json({ success: true, quotation: { ...updateDoc, _id: id } });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();
    await db.collection('quotations').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
