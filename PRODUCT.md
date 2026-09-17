# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Small business owners, engineering firms, service contractors, and quotation/billing managers needing to generate formal business quotations and invoices for clients.

## Product Purpose
An intuitive quotation and invoice generation software system. Allows managing company settings (name, tagline, default terms & conditions), drafting itemized quotations with detailed particulars, discounts, and quantities, persisting data in MongoDB, and generating pixel-perfect printable/downloadable PDFs matching standard commercial quotation formats (such as the reference EMA Engineering quotation).

## Positioning
Specialized for industrial, engineering, and service quotation workflows with multi-line specification particulars, list price vs discounted pricing, quantity units (e.g. pc, set), automatic number-to-words currency conversion (e.g., Taka / BDT), and custom contractual terms.

## Operating Context
Web application connected to a cloud MongoDB database. Users create and manage quotations/invoices, configure company profile once, add/edit products and service items, and print or export standard commercial PDF documents.

## Capabilities and Constraints
- **Company Profile Settings:** One-time configuration for company name, tagline, contact details, and default terms & conditions.
- **Product & Quotation Management:** Create, list, edit, and delete quotations with client details (recipient, address, subject, date, reference).
- **Line Items Structure:** Serial number, detailed particulars (specs, parts list), list unit price, after-discount price, quantity with unit, and line total calculation.
- **Summary & Word Conversion:** Automatic subtotal, total quantity, total amount calculation, and "In Word Taka" automatic conversion.
- **Terms & Conditions:** Customizable multi-point terms & conditions.
- **PDF Export / Print:** Clean, print-ready document styling matching commercial format.
- **Database:** MongoDB Atlas via environment variables (`MONGODB_URI` and `MONGODB_DB_NAME`).

## Brand Commitments
- Reference format: Industrial/commercial engineering quotation (`Lam.docx.pdf`).
- Header styling: Prominent company name branding with tagline and clear document type heading.

## Evidence on Hand
- Reference quotation document: `/Users/farhananasrin/Downloads/invoice/Lam.docx.pdf` (EMA Engineering quotation layout).
- MongoDB Atlas connection credentials provided by user.

## Product Principles
- **Accuracy First:** Calculations (discount, subtotal, total, and word conversion) must be exact and mathematically consistent.
- **Zero Clutter Workflow:** Streamlined entry from company setup to item entry to single-click PDF export.
- **Faithful Document Rendering:** The exported/printable document must mirror professional commercial quotation standards.
