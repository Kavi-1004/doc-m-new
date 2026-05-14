/**
 * Seed API Route — POST /api/seed
 * Populates the PostgreSQL database with demo data via Prisma.
 * Idempotent: skips seeding if companies already exist (unless ?reset=1).
 */
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse } from '@/lib/api-helpers'
import { hashPassword } from '@/lib/auth'

const DEMO_PASSWORD = hashPassword('password123')

export async function POST(request: NextRequest) {
  try {
    const reset = request.nextUrl.searchParams.get('reset') === '1'

    if (reset) {
      await prisma.$transaction([
        prisma.auditLog.deleteMany(),
        prisma.expense.deleteMany(),
        prisma.invoice.deleteMany(),
        prisma.deliveryOrder.deleteMany(),
        prisma.purchaseOrder.deleteMany(),
        prisma.supplierQuote.deleteMany(),
        prisma.quotation.deleteMany(),
        prisma.supplier.deleteMany(),
        prisma.customer.deleteMany(),
        prisma.user.deleteMany(),
        prisma.setting.deleteMany(),
        prisma.company.deleteMany(),
      ])
    } else {
      const existing = await prisma.company.count()
      if (existing > 0) return jsonResponse({ message: 'Database already seeded', seeded: false })
    }

    /* ── Companies ─────────────────────────────────────────────── */
    await prisma.company.createMany({
      data: [
        { code: 'AB', name: 'Al Bashir Trading LLC', logo: 'AB', currency: 'AED', regNo: 'DED-123456', taxNo: 'TRN-100234567800003', address: 'Office 301, Al Quoz, Dubai, UAE', phone: '+971 4 234 5678', email: 'info@albashir.ae', bank: 'Emirates NBD – AE12 0260 0012 3456 7890 123' },
        { code: 'JV', name: 'Al Bashir JV Projects', logo: 'JV', currency: 'AED', regNo: 'DED-789012', taxNo: 'TRN-100234567800004', address: 'P.O. Box 12345, JAFZA, Dubai', phone: '+971 4 876 5432', email: 'jv@albashir.ae', bank: 'ADCB – AE98 0030 0012 3456 7890 123' },
        { code: 'KW', name: 'Al Bashir Kuwait Branch', logo: 'KW', currency: 'KWD', regNo: 'KW-2024-0042', taxNo: '—', address: 'Sharq, Kuwait City', phone: '+965 2234 5678', email: 'kw@albashir.ae', bank: 'NBK – KW81NBOK0000000000001234567890' },
        { code: 'LK', name: 'NexusERP Lanka (Pvt) Ltd', logo: 'LK', currency: 'LKR', regNo: 'PV-88421', taxNo: 'TIN-123456789', address: '42 Galle Road, Colombo 03, Sri Lanka', phone: '+94 11 234 5678', email: 'info@nexuslk.lk', bank: 'Commercial Bank – LK62 COMB 0000 1234 5678 9012' },
      ],
    })

    /* ── Users (all demo passwords: password123) ───────────────── */
    await prisma.user.createMany({
      data: [
        { name: 'Ahmed Al Bashir', email: 'ahmed@albashir.ae', password: DEMO_PASSWORD, role: 'SUPER_ADMIN', company: 'Al Bashir Trading LLC', status: 'Active', lastLogin: '2024-03-15 09:30' },
        { name: 'Sara Khan', email: 'sara@albashir.ae', password: DEMO_PASSWORD, role: 'ADMIN', company: 'Al Bashir Trading LLC', status: 'Active', lastLogin: '2024-03-15 08:45' },
        { name: 'Omar Farouk', email: 'omar@albashir.ae', password: DEMO_PASSWORD, role: 'SALES', company: 'Al Bashir Trading LLC', status: 'Active', lastLogin: '2024-03-14 16:20' },
        { name: 'Fatima Noor', email: 'fatima@albashir.ae', password: DEMO_PASSWORD, role: 'PROCUREMENT', company: 'Al Bashir JV Projects', status: 'Active', lastLogin: '2024-03-14 14:10' },
        { name: 'Hassan Raza', email: 'hassan@albashir.ae', password: DEMO_PASSWORD, role: 'ACCOUNTANT', company: 'Al Bashir Trading LLC', status: 'Active', lastLogin: '2024-03-13 11:00' },
        { name: 'Layla Abbas', email: 'layla@albashir.ae', password: DEMO_PASSWORD, role: 'VIEWER', company: 'Al Bashir Kuwait Branch', status: 'Inactive', lastLogin: '2024-02-28 09:00' },
        { name: 'Kavindu Perera', email: 'kavindu@nexuslk.lk', password: DEMO_PASSWORD, role: 'ADMIN', company: 'NexusERP Lanka (Pvt) Ltd', status: 'Active', lastLogin: '2024-03-15 10:00' },
        { name: 'Nimal Silva', email: 'nimal@nexuslk.lk', password: DEMO_PASSWORD, role: 'SALES', company: 'NexusERP Lanka (Pvt) Ltd', status: 'Active', lastLogin: '2024-03-14 09:15' },
      ],
    })

    /* ── Customers ─────────────────────────────────────────────── */
    await prisma.customer.createMany({
      data: [
        { code: 'CUST-001', company: 'Dubai Marina Developers', contact: 'Rashid Al Maktoum', email: 'rashid@dmdev.ae', phone: '+971 4 555 0001', tax: 'TRN-300000000000001', terms: 'Net 30', credit: 500000, billing: 'P.O. Box 500, Dubai Marina', shipping: 'Plot 7, Dubai Marina' },
        { code: 'CUST-002', company: 'Abu Dhabi Infrastructure Co', contact: 'Khalid Al Nahyan', email: 'khalid@adic.ae', phone: '+971 2 555 0002', tax: 'TRN-300000000000002', terms: 'Net 45', credit: 1000000, billing: 'ADNOC Tower, Abu Dhabi', shipping: 'Mussafah Industrial, Abu Dhabi' },
        { code: 'CUST-003', company: 'Sharjah Construction LLC', contact: 'Nasser Al Qasimi', email: 'nasser@shconst.ae', phone: '+971 6 555 0003', tax: 'TRN-300000000000003', terms: 'Net 30', credit: 300000 },
        { code: 'CUST-004', company: 'Ras Al Khaimah Cement', contact: 'Saud Al Nuaimi', email: 'saud@rakcem.ae', phone: '+971 7 555 0004', tax: 'TRN-300000000000004', terms: 'Net 60', credit: 750000 },
        { code: 'CUST-005', company: 'Ajman Free Zone Authority', contact: 'Mohammed Al Mualla', email: 'mohammed@afza.ae', phone: '+971 6 555 0005', tax: 'TRN-300000000000005', terms: 'Net 30', credit: 200000 },
        { code: 'CUST-006', company: 'Lanka Construction Group', contact: 'Priyantha Fernando', email: 'priyantha@lcg.lk', phone: '+94 11 777 1234', tax: 'TIN-600000001', terms: 'Net 30', credit: 15000000, billing: '88 Bauddhaloka Mawatha, Colombo 04', shipping: 'Site Office, Rajagiriya' },
        { code: 'CUST-007', company: 'Colombo Port City Dev', contact: 'Samantha Jayasinghe', email: 'samantha@cpcd.lk', phone: '+94 11 777 5678', tax: 'TIN-600000002', terms: 'Net 45', credit: 25000000 },
      ],
    })

    /* ── Suppliers ──────────────────────────────────────────────── */
    await prisma.supplier.createMany({
      data: [
        { code: 'SUP-001', company: 'Emirates Steel Industries', contact: 'Ali Hassan', email: 'ali@emsteel.ae', phone: '+971 2 666 0001', tax: 'TRN-400000000000001', terms: 'Net 30', address: 'Mussafah, Abu Dhabi', bank: 'FAB – AE12 0350 0000 0012 3456 789' },
        { code: 'SUP-002', company: 'Gulf Pipes Manufacturing', contact: 'Tariq Mahmoud', email: 'tariq@gulfpipes.ae', phone: '+971 4 666 0002', tax: 'TRN-400000000000002', terms: 'Net 45', address: 'JAFZA South, Dubai', bank: 'DIB – AE34 0240 0000 0012 3456 789' },
        { code: 'SUP-003', company: 'National Cement Company', contact: 'Youssef Darwish', email: 'youssef@natcem.ae', phone: '+971 7 666 0003', tax: 'TRN-400000000000003', terms: 'Net 30' },
        { code: 'SUP-004', company: 'Al Futtaim Logistics', contact: 'Rania Saleh', email: 'rania@alfuttaim.ae', phone: '+971 4 666 0004', tax: 'TRN-400000000000004', terms: 'Net 15' },
        { code: 'SUP-005', company: 'Bin Dasmal Readymix', contact: 'Khaled Omar', email: 'khaled@bindasmal.ae', phone: '+971 4 666 0005', tax: 'TRN-400000000000005', terms: 'Net 30' },
        { code: 'SUP-006', company: 'Tokyo Steel Trading Co.', contact: 'Hiroshi Tanaka', email: 'hiroshi@tokyosteel.jp', phone: '+81 3 5555 0001', tax: 'JP-1234567890', terms: 'Net 60', address: 'Chiyoda-ku, Tokyo', bank: 'MUFG – JP12 0005 0000 1234 5678' },
        { code: 'SUP-007', company: 'Lanka Hardware Suppliers', contact: 'Suresh Bandara', email: 'suresh@lankahw.lk', phone: '+94 11 888 9012', tax: 'TIN-700000001', terms: 'Net 30', address: '22 Dam Street, Colombo 12', bank: 'HNB – LK89 7083 0000 1234 5678 9012' },
      ],
    })

    /* ── Quotations ─────────────────────────────────────────────── */
    await prisma.quotation.createMany({
      data: [
        { number: 'AB-Q-2024-0001', rev: 2, customer: 'Dubai Marina Developers', project: 'Marina Gate Tower – Structural Steel', date: '2024-02-15', validity: '2024-03-15', status: 'APPROVED', total: 245000, currency: 'AED', items: JSON.stringify([{ description: 'Structural Steel Beams H200', qty: 50, unit: 'Ton', rate: 3200, amount: 160000 }, { description: 'Steel Plates 20mm', qty: 25, unit: 'Ton', rate: 3400, amount: 85000 }]), terms: 'Ex-works, delivery within 4 weeks of PO confirmation.' },
        { number: 'AB-Q-2024-0002', rev: 0, customer: 'Abu Dhabi Infrastructure Co', project: 'Highway Bridge Expansion', date: '2024-02-20', validity: '2024-03-20', status: 'SENT', total: 892000, currency: 'AED', items: JSON.stringify([{ description: 'Pre-stressed Concrete Beams', qty: 120, unit: 'Pcs', rate: 4500, amount: 540000 }, { description: 'Bridge Bearings', qty: 32, unit: 'Pcs', rate: 11000, amount: 352000 }]) },
        { number: 'AB-Q-2024-0003', rev: 1, customer: 'Sharjah Construction LLC', project: 'University Campus Phase 2', date: '2024-03-01', validity: '2024-03-31', status: 'DRAFT', total: 156000, currency: 'AED', items: JSON.stringify([{ description: 'Reinforcement Bar 16mm', qty: 30, unit: 'Ton', rate: 2800, amount: 84000 }, { description: 'Cement OPC 53 Grade', qty: 2400, unit: 'Bag', rate: 30, amount: 72000 }]) },
        { number: 'AB-Q-2024-0004', rev: 0, customer: 'Ras Al Khaimah Cement', project: 'Kiln Maintenance Parts', date: '2024-03-05', validity: '2024-04-05', status: 'REJECTED', total: 78000, currency: 'AED', items: JSON.stringify([{ description: 'Kiln Roller Assembly', qty: 2, unit: 'Set', rate: 35000, amount: 70000 }, { description: 'Seal Ring Set', qty: 4, unit: 'Pcs', rate: 2000, amount: 8000 }]) },
        { number: 'AB-Q-2024-0005', rev: 0, customer: 'Dubai Marina Developers', project: 'Facade Cladding Supply', date: '2024-03-10', validity: '2024-04-10', status: 'APPROVED', total: 320000, currency: 'AED', items: JSON.stringify([{ description: 'Aluminium Composite Panel 4mm', qty: 2000, unit: 'SQM', rate: 120, amount: 240000 }, { description: 'Structural Silicone Sealant', qty: 800, unit: 'Tube', rate: 100, amount: 80000 }]) },
        { number: 'AB-Q-2024-0006', rev: 0, customer: 'Ajman Free Zone Authority', project: 'Warehouse Shelving System', date: '2024-03-12', validity: '2024-04-12', status: 'SENT', total: 45000, currency: 'AED', items: JSON.stringify([{ description: 'Heavy Duty Pallet Racking', qty: 50, unit: 'Bay', rate: 900, amount: 45000 }]) },
        { number: 'AB-Q-2024-0007', rev: 0, customer: 'Abu Dhabi Infrastructure Co', project: 'Pipe Supply – Water Network', date: '2024-03-14', validity: '2024-04-14', status: 'DRAFT', total: 534000, currency: 'AED', items: JSON.stringify([{ description: 'DI Pipe DN600', qty: 3000, unit: 'MTR', rate: 178, amount: 534000 }]) },
        { number: 'LK-Q-2024-0001', rev: 0, customer: 'Lanka Construction Group', project: 'Rajagiriya Office Tower – Steel Frame', date: '2024-03-01', validity: '2024-04-01', status: 'APPROVED', total: 8500000, currency: 'LKR', items: JSON.stringify([{ description: 'Structural Steel I-Beams', qty: 40, unit: 'Ton', rate: 150000, amount: 6000000 }, { description: 'Bolts & Nuts Assorted', qty: 5000, unit: 'Pcs', rate: 500, amount: 2500000 }]), terms: 'Delivery: 6 weeks from PO. Payment: 50% advance, 50% on delivery.' },
        { number: 'LK-Q-2024-0002', rev: 0, customer: 'Colombo Port City Dev', project: 'Port City Marina Piling', date: '2024-03-08', validity: '2024-04-08', status: 'SENT', total: 18200000, currency: 'LKR', items: JSON.stringify([{ description: 'Steel Sheet Piles 12m', qty: 200, unit: 'Pcs', rate: 85000, amount: 17000000 }, { description: 'Welding Electrodes 3.15mm', qty: 2400, unit: 'Kg', rate: 500, amount: 1200000 }]) },
      ],
    })

    /* ── Supplier Quotes ───────────────────────────────────────── */
    await prisma.supplierQuote.createMany({
      data: [
        { number: 'AB-SQ-2024-0001', supplier: 'Emirates Steel Industries', linkedQuote: 'AB-Q-2024-0001', date: '2024-02-18', amount: 195000, status: 'ACCEPTED', items: JSON.stringify([{ description: 'Structural Steel Beams H200', qty: 50, unit: 'Ton', rate: 2600, amount: 130000 }, { description: 'Steel Plates 20mm', qty: 25, unit: 'Ton', rate: 2600, amount: 65000 }]), notes: 'Best price for Q1 2024 order' },
        { number: 'AB-SQ-2024-0002', supplier: 'Gulf Pipes Manufacturing', linkedQuote: 'AB-Q-2024-0007', date: '2024-03-16', amount: 420000, status: 'PENDING', items: JSON.stringify([{ description: 'DI Pipe DN600', qty: 3000, unit: 'MTR', rate: 140, amount: 420000 }]) },
        { number: 'AB-SQ-2024-0003', supplier: 'National Cement Company', linkedQuote: 'AB-Q-2024-0003', date: '2024-03-02', amount: 62400, status: 'ACCEPTED', items: JSON.stringify([{ description: 'Cement OPC 53 Grade', qty: 2400, unit: 'Bag', rate: 26, amount: 62400 }]) },
        { number: 'AB-SQ-2024-0004', supplier: 'Al Futtaim Logistics', linkedQuote: 'AB-Q-2024-0005', date: '2024-03-11', amount: 18000, status: 'ACCEPTED', items: JSON.stringify([{ description: 'Freight & Logistics – Facade Materials', qty: 1, unit: 'Lot', rate: 18000, amount: 18000 }]) },
        { number: 'AB-SQ-2024-0005', supplier: 'Bin Dasmal Readymix', linkedQuote: '', date: '2024-03-13', amount: 96000, status: 'REJECTED', items: JSON.stringify([{ description: 'Readymix Concrete G40', qty: 400, unit: 'CUM', rate: 240, amount: 96000 }]), notes: 'Price too high — alternative sourced' },
        { number: 'AB-SQ-2024-0006', supplier: 'Tokyo Steel Trading Co.', linkedQuote: 'AB-Q-2024-0002', date: '2024-02-22', amount: 510000, status: 'PENDING', items: JSON.stringify([{ description: 'Pre-stressed Concrete Beams (Import)', qty: 120, unit: 'Pcs', rate: 4250, amount: 510000 }]), notes: 'FOB Tokyo, 8-week lead time' },
        { number: 'LK-SQ-2024-0001', supplier: 'Lanka Hardware Suppliers', linkedQuote: 'LK-Q-2024-0001', date: '2024-03-03', amount: 5800000, status: 'ACCEPTED', items: JSON.stringify([{ description: 'Structural Steel I-Beams', qty: 40, unit: 'Ton', rate: 120000, amount: 4800000 }, { description: 'Bolts & Nuts Assorted', qty: 5000, unit: 'Pcs', rate: 200, amount: 1000000 }]) },
      ],
    })

    /* ── Purchase Orders ───────────────────────────────────────── */
    await prisma.purchaseOrder.createMany({
      data: [
        { number: 'AB-PO-2024-0001', supplier: 'Emirates Steel Industries', linkedQuote: 'AB-SQ-2024-0001', date: '2024-02-20', amount: 195000, status: 'RECEIVED', items: JSON.stringify([{ description: 'Structural Steel Beams H200', qty: 50, unit: 'Ton', rate: 2600, amount: 130000 }, { description: 'Steel Plates 20mm', qty: 25, unit: 'Ton', rate: 2600, amount: 65000 }]), expectedDelivery: '2024-03-20', notes: 'Delivered on time – QC passed' },
        { number: 'AB-PO-2024-0002', supplier: 'National Cement Company', linkedQuote: 'AB-SQ-2024-0003', date: '2024-03-05', amount: 62400, status: 'SENT', items: JSON.stringify([{ description: 'Cement OPC 53 Grade', qty: 2400, unit: 'Bag', rate: 26, amount: 62400 }]), expectedDelivery: '2024-03-25' },
        { number: 'AB-PO-2024-0003', supplier: 'Al Futtaim Logistics', linkedQuote: 'AB-SQ-2024-0004', date: '2024-03-12', amount: 18000, status: 'SENT', items: JSON.stringify([{ description: 'Freight & Logistics – Facade Materials', qty: 1, unit: 'Lot', rate: 18000, amount: 18000 }]), expectedDelivery: '2024-03-22' },
        { number: 'AB-PO-2024-0004', supplier: 'Emirates Steel Industries', linkedQuote: '', date: '2024-03-14', amount: 45000, status: 'DRAFT', items: JSON.stringify([{ description: 'Misc Steel Plates', qty: 15, unit: 'Ton', rate: 3000, amount: 45000 }]), expectedDelivery: '2024-04-10' },
        { number: 'AB-PO-2024-0005', supplier: 'Tokyo Steel Trading Co.', linkedQuote: 'AB-SQ-2024-0006', date: '2024-03-18', amount: 510000, status: 'SENT', items: JSON.stringify([{ description: 'Pre-stressed Concrete Beams (Import)', qty: 120, unit: 'Pcs', rate: 4250, amount: 510000 }]), expectedDelivery: '2024-05-15', notes: 'International shipment – CIF Dubai' },
        { number: 'LK-PO-2024-0001', supplier: 'Lanka Hardware Suppliers', linkedQuote: 'LK-SQ-2024-0001', date: '2024-03-05', amount: 5800000, status: 'SENT', items: JSON.stringify([{ description: 'Structural Steel I-Beams', qty: 40, unit: 'Ton', rate: 120000, amount: 4800000 }, { description: 'Bolts & Nuts Assorted', qty: 5000, unit: 'Pcs', rate: 200, amount: 1000000 }]), expectedDelivery: '2024-04-15' },
      ],
    })

    /* ── Delivery Orders ───────────────────────────────────────── */
    await prisma.deliveryOrder.createMany({
      data: [
        { number: 'AB-DO-2024-0001', customer: 'Dubai Marina Developers', linkedQuote: 'AB-Q-2024-0001', date: '2024-03-10', items: 2, status: 'DELIVERED', lineItems: JSON.stringify([{ description: 'Structural Steel Beams H200', qty: 50, unit: 'Ton' }, { description: 'Steel Plates 20mm', qty: 25, unit: 'Ton' }]), shippingAddress: 'Plot 7, Dubai Marina' },
        { number: 'AB-DO-2024-0002', customer: 'Dubai Marina Developers', linkedQuote: 'AB-Q-2024-0005', date: '2024-03-18', items: 1, status: 'DISPATCHED', lineItems: JSON.stringify([{ description: 'Aluminium Composite Panel 4mm (Batch 1)', qty: 1000, unit: 'SQM' }]), shippingAddress: 'Plot 7, Dubai Marina' },
        { number: 'AB-DO-2024-0003', customer: 'Sharjah Construction LLC', linkedQuote: 'AB-Q-2024-0003', date: '2024-03-20', items: 1, status: 'PENDING', lineItems: JSON.stringify([{ description: 'Cement OPC 53 Grade', qty: 2400, unit: 'Bag' }]), shippingAddress: 'University City, Sharjah' },
        { number: 'AB-DO-2024-0004', customer: 'Abu Dhabi Infrastructure Co', linkedQuote: 'AB-Q-2024-0002', date: '2024-03-25', items: 1, status: 'DISPATCHED', lineItems: JSON.stringify([{ description: 'Pre-stressed Concrete Beams (Batch 1)', qty: 60, unit: 'Pcs' }]), shippingAddress: 'Mussafah Industrial, Abu Dhabi' },
        { number: 'LK-DO-2024-0001', customer: 'Lanka Construction Group', linkedQuote: 'LK-Q-2024-0001', date: '2024-03-20', items: 2, status: 'DISPATCHED', lineItems: JSON.stringify([{ description: 'Structural Steel I-Beams', qty: 20, unit: 'Ton' }, { description: 'Bolts & Nuts Assorted', qty: 2500, unit: 'Pcs' }]), shippingAddress: 'Site Office, Rajagiriya' },
      ],
    })

    /* ── Invoices ───────────────────────────────────────────────── */
    await prisma.invoice.createMany({
      data: [
        { number: 'AB-INV-2024-0001', customer: 'Dubai Marina Developers', linkedQuote: 'AB-Q-2024-0001', date: '2024-03-10', due: '2024-04-09', total: 245000, paid: 245000, status: 'PAID', items: JSON.stringify([{ description: 'Structural Steel Supply – Marina Gate Tower', qty: 1, unit: 'Lot', rate: 245000, amount: 245000 }]) },
        { number: 'AB-INV-2024-0002', customer: 'Abu Dhabi Infrastructure Co', linkedQuote: 'AB-Q-2024-0002', date: '2024-03-01', due: '2024-04-15', total: 892000, paid: 0, status: 'UNPAID', items: JSON.stringify([{ description: 'Highway Bridge Materials', qty: 1, unit: 'Lot', rate: 892000, amount: 892000 }]) },
        { number: 'AB-INV-2024-0003', customer: 'Dubai Marina Developers', linkedQuote: 'AB-Q-2024-0005', date: '2024-03-18', due: '2024-04-17', total: 160000, paid: 80000, status: 'PARTIAL', progressPct: 50, projectTotal: 320000, billedToDate: 160000, items: JSON.stringify([{ description: 'Facade Cladding – Progress 50%', qty: 1, unit: 'Lot', rate: 160000, amount: 160000 }]), notes: 'Progress billing – Batch 1 delivered' },
        { number: 'AB-INV-2024-0004', customer: 'Sharjah Construction LLC', linkedQuote: 'AB-Q-2024-0003', date: '2024-02-01', due: '2024-03-02', total: 156000, paid: 0, status: 'OVERDUE', items: JSON.stringify([{ description: 'University Campus Materials', qty: 1, unit: 'Lot', rate: 156000, amount: 156000 }]) },
        { number: 'AB-INV-2024-0005', customer: 'Ras Al Khaimah Cement', linkedQuote: 'AB-Q-2024-0004', date: '2024-03-05', due: '2024-05-04', total: 78000, paid: 78000, status: 'VOID', items: JSON.stringify([{ description: 'Kiln Parts (Cancelled)', qty: 1, unit: 'Lot', rate: 78000, amount: 78000 }]), notes: 'Voided – quotation rejected by client' },
        { number: 'AB-INV-2024-0006', customer: 'Ajman Free Zone Authority', linkedQuote: 'AB-Q-2024-0006', date: '2024-03-20', due: '2024-04-19', total: 45000, paid: 45000, status: 'PAID', items: JSON.stringify([{ description: 'Warehouse Shelving System', qty: 50, unit: 'Bay', rate: 900, amount: 45000 }]) },
        { number: 'LK-INV-2024-0001', customer: 'Lanka Construction Group', linkedQuote: 'LK-Q-2024-0001', date: '2024-03-22', due: '2024-04-22', total: 4250000, paid: 4250000, status: 'PAID', progressPct: 50, projectTotal: 8500000, billedToDate: 4250000, items: JSON.stringify([{ description: 'Steel Frame Supply – 50% Advance', qty: 1, unit: 'Lot', rate: 4250000, amount: 4250000 }]), notes: '50% advance per quotation terms' },
      ],
    })

    /* ── Expenses (categories match CAT_COLORS) ────────────────── */
    await prisma.expense.createMany({
      data: [
        { number: 'AB-EXP-2024-0001', project: 'Marina Gate Tower', supplier: 'Dubai Crane Services', category: 'TRANSPORT', amount: 3200, date: '2024-03-08', notes: 'Crane mobilisation to site' },
        { number: 'AB-EXP-2024-0002', project: 'Highway Bridge', supplier: 'Dubai Municipality', category: 'ADMIN', amount: 12500, date: '2024-02-25', notes: 'Road occupation permit Q1' },
        { number: 'AB-EXP-2024-0003', project: '', supplier: '', category: 'ADMIN', amount: 35000, date: '2024-03-01', notes: 'Al Quoz office rent – March 2024' },
        { number: 'AB-EXP-2024-0004', project: '', supplier: 'Etisalat', category: 'ADMIN', amount: 2800, date: '2024-03-05', notes: 'Internet & phone – March' },
        { number: 'AB-EXP-2024-0005', project: 'Facade Cladding', supplier: 'Al Futtaim Logistics', category: 'TRANSPORT', amount: 18000, date: '2024-03-12', notes: 'Freight for ACP panels' },
        { number: 'AB-EXP-2024-0006', project: '', supplier: '', category: 'LABOR', amount: 145000, date: '2024-02-28', notes: 'Staff salaries – Feb 2024' },
        { number: 'AB-EXP-2024-0007', project: 'University Campus', supplier: 'National Cement Company', category: 'MATERIAL', amount: 62400, date: '2024-03-06', notes: 'Cement purchase per PO-0002' },
        { number: 'AB-EXP-2024-0008', project: 'Marina Gate Tower', supplier: 'Quality Testing Lab', category: 'SUBCONTRACT', amount: 8500, date: '2024-03-09', notes: 'Steel testing & certification' },
        { number: 'AB-EXP-2024-0009', project: 'Highway Bridge', supplier: '', category: 'SITE_VISIT', amount: 1200, date: '2024-03-11', notes: 'Site visit – Ahmed + Sara' },
        { number: 'AB-EXP-2024-0010', project: 'Facade Cladding', supplier: 'Desert Steel Fabrication', category: 'SUBCONTRACT', amount: 42000, date: '2024-03-14', notes: 'Panel cutting & fabrication' },
        { number: 'LK-EXP-2024-0001', project: 'Rajagiriya Office Tower', supplier: 'Lanka Hardware Suppliers', category: 'MATERIAL', amount: 2400000, date: '2024-03-10', notes: 'Steel purchase per LK-PO-2024-0001 (partial)' },
        { number: 'LK-EXP-2024-0002', project: 'Rajagiriya Office Tower', supplier: 'Kandy Welders Co', category: 'LABOR', amount: 350000, date: '2024-03-15', notes: 'Welding labour for steel frame erection' },
      ],
    })

    /* ── Audit Logs ─────────────────────────────────────────────── */
    await prisma.auditLog.createMany({
      data: [
        { user: 'Ahmed Al Bashir', module: 'Auth', action: 'LOGIN', target: '—', ip: '192.168.1.100', time: '2024-03-15 09:30' },
        { user: 'Sara Khan', module: 'Quotation', action: 'CREATED', target: 'AB-Q-2024-0007', ip: '192.168.1.101', time: '2024-03-14 16:45' },
        { user: 'Omar Farouk', module: 'Quotation', action: 'REVISED', target: 'AB-Q-2024-0003 Rev 1', ip: '192.168.1.102', time: '2024-03-14 14:20' },
        { user: 'Fatima Noor', module: 'PurchaseOrder', action: 'CREATED', target: 'AB-PO-2024-0004', ip: '192.168.1.103', time: '2024-03-14 11:30' },
        { user: 'Hassan Raza', module: 'Invoice', action: 'CREATED', target: 'AB-INV-2024-0003', ip: '192.168.1.104', time: '2024-03-13 15:00' },
        { user: 'Sara Khan', module: 'Customer', action: 'UPDATED', target: 'CUST-002', ip: '192.168.1.101', time: '2024-03-13 10:15' },
        { user: 'Ahmed Al Bashir', module: 'Settings', action: 'UPDATED', target: 'app_settings', ip: '192.168.1.100', time: '2024-03-12 09:00' },
        { user: 'Kavindu Perera', module: 'Quotation', action: 'CREATED', target: 'LK-Q-2024-0001', ip: '10.0.0.50', time: '2024-03-01 10:30' },
        { user: 'Kavindu Perera', module: 'PurchaseOrder', action: 'CREATED', target: 'LK-PO-2024-0001', ip: '10.0.0.50', time: '2024-03-05 11:00' },
        { user: 'Nimal Silva', module: 'Invoice', action: 'CREATED', target: 'LK-INV-2024-0001', ip: '10.0.0.51', time: '2024-03-22 14:30' },
        { user: 'System', module: 'Seed', action: 'SEEDED', target: 'All modules', ip: '127.0.0.1', time: new Date().toISOString().replace('T', ' ').slice(0, 16) },
      ],
    })

    /* ── Settings ───────────────────────────────────────────────── */
    await prisma.setting.upsert({
      where: { type: 'app_settings' },
      update: {},
      create: { type: 'app_settings' },
    })

    const counts = {
      companies: 4, users: 8, customers: 7, suppliers: 7,
      quotations: 9, supplierQuotes: 7, purchaseOrders: 6,
      deliveryOrders: 5, invoices: 7, expenses: 12, auditLogs: 11,
    }

    return jsonResponse({ message: 'Database seeded successfully', seeded: true, counts })
  } catch (err) {
    return errorResponse('Seed failed', 500, { details: (err as Error).message })
  }
}
