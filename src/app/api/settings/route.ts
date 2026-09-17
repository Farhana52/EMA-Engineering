import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CompanySettings } from '@/types/invoice';

const DEFAULT_SETTINGS: CompanySettings = {
  name: 'EMA Engineering',
  tagline: 'The power you can trust!',
  address: 'Dhaka, Bangladesh',
  phone: '+880 1700-000000',
  email: '',
  website: '',
  showPhone: true,
  showEmail: false,
  showWebsite: false,
  showAddress: true,
  defaultTerms: [
    '01) Our offer will remain valid for a period of 15 days from the date of this offer.',
    '02) 100% cash/PO/Cheque as an advance before delivery.',
    '03) VAT encluded the above-mentioned price value and AIT as per Govt. rule.'
  ]
};

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const settings = await db.collection('company_settings').findOne({});
    if (!settings) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }
    // Ensure visibility toggle defaults if missing in DB
    const resolved: CompanySettings = {
      ...DEFAULT_SETTINGS,
      ...settings,
      _id: settings._id?.toString(),
      showPhone: settings.showPhone !== undefined ? settings.showPhone : true,
      showEmail: settings.showEmail !== undefined ? settings.showEmail : true,
      showWebsite: settings.showWebsite !== undefined ? settings.showWebsite : true,
      showAddress: settings.showAddress !== undefined ? settings.showAddress : true,
    };
    return NextResponse.json(resolved);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { db } = await connectToDatabase();
    const updateData: CompanySettings = {
      name: body.name || DEFAULT_SETTINGS.name,
      tagline: body.tagline || DEFAULT_SETTINGS.tagline,
      address: body.address || '',
      phone: body.phone || '',
      email: body.email || '',
      website: body.website || '',
      showPhone: typeof body.showPhone === 'boolean' ? body.showPhone : true,
      showEmail: typeof body.showEmail === 'boolean' ? body.showEmail : true,
      showWebsite: typeof body.showWebsite === 'boolean' ? body.showWebsite : true,
      showAddress: typeof body.showAddress === 'boolean' ? body.showAddress : true,
      defaultTerms: Array.isArray(body.defaultTerms) ? body.defaultTerms : DEFAULT_SETTINGS.defaultTerms,
      updatedAt: new Date().toISOString()
    };

    await db.collection('company_settings').updateOne(
      {},
      { $set: updateData },
      { upsert: true }
    );

    return NextResponse.json({ success: true, settings: updateData });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
