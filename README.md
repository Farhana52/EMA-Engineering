# EMA Engineering - Quotation & Invoice Management System

A Next.js & MongoDB application for generating, managing, and printing industrial quotations and invoices with standard commercial formatting.

## Features

- **Company Settings:** Configure company details, branding, address, phone numbers, and default terms & conditions.
- **Product Catalog:** Manage products and services with specifications, capacities, and default pricing.
- **Quotation Generator:** Create itemized quotes with automatic serial numbers, discounts, item quantities, total calculation, and "In Word Taka" conversion.
- **Print & PDF Templates:** Classic and Formal printable document templates designed for pixel-perfect printing and client submission.
- **MongoDB Atlas Integration:** Persistent storage with serverless connection pooling.

---

## Getting Started Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/Farhana52/EMA-Engineering.git
   cd EMA-Engineering
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env.local` and fill in your MongoDB connection details:
   ```bash
   cp .env.example .env.local
   ```
   Add your MongoDB Atlas URI:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB_NAME=invoice_pro_db
   ```

4. Run development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Deploying on Vercel

1. Push this repository to GitHub.
2. Import the repository into **[Vercel](https://vercel.com/new)**.
3. In the Vercel project configuration, under **Environment Variables**, add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `MONGODB_DB_NAME`: `invoice_pro_db` (or your preferred database name).
4. Deploy! Vercel will automatically build and host the Next.js serverless application.

