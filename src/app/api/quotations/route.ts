import { NextResponse } from 'next/server';
import { Filter, Document } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { QuotationItem } from '@/types/invoice';
import { numberToWordsTaka } from '@/lib/number-to-words';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const query: Filter<Document> = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { quoteNumber: { $regex: search, $options: 'i' } },
        { clientCompany: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const { db } = await connectToDatabase();
    const quotations = await db
      .collection('quotations')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(quotations);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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

    const quoteCount = await db.collection('quotations').countDocuments();
    const generatedQuoteNumber = body.quoteNumber || `QT-${new Date().getFullYear()}-${(quoteCount + 1).toString().padStart(3, '0')}`;

    const newQuotation = {
      quoteNumber: generatedQuoteNumber,
      docType: body.docType || 'Quotation',
      date: body.date || new Date().toISOString().split('T')[0],
      clientName: body.clientName || '',
      clientDesignation: body.clientDesignation || '',
      clientCompany: body.clientCompany || '',
      clientAddress: body.clientAddress || '',
      subject: body.subject || '',
      salutation: body.salutation || 'Dear Sir,',
      openingText: body.openingText || 'Thank you for your requirement. We have the great pleasure to quote you our best prices as follows:',
      items,
      totalQty,
      totalAmount,
      inWords,
      terms: Array.isArray(body.terms) ? body.terms : [],
      showTerms: body.showTerms !== false,
      companyAddress: body.companyAddress || '',
      status: body.status || 'Draft',
      createdAt: new Date().toISOString()
    };

    const result = await db.collection('quotations').insertOne(newQuotation);

    return NextResponse.json({ ...newQuotation, _id: result.insertedId.toString() });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
