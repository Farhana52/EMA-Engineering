export interface CompanySettings {
  _id?: string;
  name: string;
  tagline: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  showPhone?: boolean;
  showEmail?: boolean;
  showWebsite?: boolean;
  showAddress?: boolean;
  defaultTerms: string[];
  updatedAt?: string;
}

export interface Product {
  _id?: string;
  name: string;
  description?: string;
  defaultUnitPrice: number;
  unit: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuotationItem {
  slNo: string;
  particulars: string;
  listUnitPrice: number;
  discountPrice: number;
  qty: number;
  unit: string;
  amount: number;
}

export interface Quotation {
  _id?: string;
  quoteNumber: string;
  docType: 'Quotation' | 'Invoice';
  date: string;
  clientName?: string;
  clientDesignation?: string;
  clientCompany: string;
  clientAddress?: string;
  subject: string;
  salutation: string;
  openingText: string;
  items: QuotationItem[];
  totalQty: number;
  totalAmount: number;
  inWords: string;
  terms: string[];
  showTerms?: boolean;
  companyAddress?: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined';
  createdAt?: string;
  updatedAt?: string;
}
