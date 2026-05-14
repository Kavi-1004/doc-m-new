'use client'

import { useRef, useCallback } from 'react'
import { Printer, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Company } from '@/types'

interface Column {
  label: string
  key: string
  align?: 'left' | 'right' | 'center'
  format?: (v: unknown) => string
}

interface DocumentPreviewProps {
  title: string
  docNumber: string
  company: Company
  currency: string
  headerFields: { label: string; value: string }[]
  columns: Column[]
  items: Record<string, any>[]
  total?: number
  notes?: string
  terms?: string
  footer?: string
  attnName?: string
  attnEmail?: string
  salesPerson?: string
  poNumber?: string
  project?: string
  customerName?: string
  customerAddress?: string
  showSignature?: boolean
  discount?: number
  tax?: number
}

export function DocumentPreview({
  title, docNumber, company, currency, headerFields,
  columns, items, total, notes, terms, footer,
  attnName, attnEmail, salesPerson, poNumber, project,
  customerName, customerAddress, showSignature = true,
  discount = 0, tax = 0
}: DocumentPreviewProps) {
  const ref = useRef<HTMLDivElement>(null)

  const printStyles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 0; color: #000; font-size: 11px; line-height: 1.4; }
    .page { padding: 40px; background: white; min-height: 297mm; position: relative; }
    
    /* Header */
    .header-table { width: 100%; margin-bottom: 20px; }
    .logo-cell { width: 80px; }
    .logo-img { width: 70px; height: 70px; object-fit: contain; }
    .company-info { text-align: center; }
    .company-name { font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
    .company-addr { font-size: 10px; margin-top: 2px; }
    .reg-no { font-size: 10px; text-align: right; vertical-align: bottom; }

    .separator { border-top: 2px solid #000; margin-bottom: 15px; }

    /* Info Section */
    .info-container { display: flex; justify-content: space-between; margin-bottom: 20px; align-items: flex-start; }
    .to-section { width: 50%; }
    .grid { display: grid; }
    .grid-cols-\[45px_1fr\] { grid-template-columns: 45px 1fr; }
    .gap-x-2 { column-gap: 8px; }

    .doc-box { width: 45%; border: 1.5px solid #004d99; border-radius: 2px; overflow: hidden; }
    .doc-header { background: #fff; border-bottom: 1.5px solid #004d99; padding: 5px; text-align: center; font-weight: bold; font-size: 12px; color: #000; }
    .doc-body { padding: 8px; }
    .doc-row { display: flex; margin-bottom: 3px; }
    .doc-key { width: 90px; font-weight: bold; text-transform: uppercase; font-size: 9px; }
    .doc-val { flex: 1; font-size: 9px; }

    /* Subject */
    .subject-line { font-weight: bold; text-decoration: underline; text-transform: uppercase; margin-bottom: 20px; text-align: center; font-size: 12px; }

    /* Table */
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1.5px solid #000; table-layout: fixed; }
    .items-table th { border: 1px solid #000; padding: 6px; background: #fff; font-weight: bold; text-transform: uppercase; font-size: 10px; }
    .items-table td { border: 1px solid #000; padding: 6px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; }
    
    .sn-col { width: 40px; text-align: center; }
    .qty-col { width: 60px; text-align: center; }
    .price-col { width: 90px; text-align: right; }
    .total-col { width: 90px; text-align: right; }

    .item-name { font-weight: bold; text-transform: uppercase; margin-bottom: 4px; }
    .comp-list { list-style: none; padding-left: 15px; }
    .comp-item { display: flex; gap: 6px; margin-bottom: 2px; font-size: 9.5px; line-height: 1.3; }
    .comp-dot { font-weight: bold; }

    .total-row { font-weight: bold; }
    .total-label { text-align: right; padding-right: 10px; }

    /* Signatures */
    .sig-container { display: flex; justify-content: space-between; margin-top: 50px; }
    .sig-box { width: 45%; text-align: center; }
    .sig-line { border-top: 1px dashed #000; margin-bottom: 5px; width: 80%; margin-left: auto; margin-right: auto; }
    .sig-text { font-size: 10px; font-weight: bold; }

    /* Footer */
    .footer-line { border-top: 2px solid #000; margin-top: 40px; margin-bottom: 5px; }
    .footer-links { text-align: center; color: #ff0000; font-size: 10px; font-weight: bold; }
    .footer-links a { color: #ff0000; text-decoration: none; }

    @media print {
      body { padding: 0; }
      .page { border: none; box-shadow: none; padding: 20mm; }
      .no-print { display: none; }
    }
  `

  const handlePrint = () => {
    if (!ref.current) return
    const w = window.open('', '_blank', 'width=800,height=600')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><title>${title} - ${docNumber}</title><style>${printStyles}</style></head><body>${ref.current.innerHTML}</body></html>`)
    w.document.close()
    setTimeout(() => { w.print(); w.close() }, 250)
  }

  const handleDownloadPdf = useCallback(async () => {
    if (!ref.current) return
    const html2canvas = (await import('html2canvas')).default
    const { jsPDF } = await import('jspdf')

    const canvas = await html2canvas(ref.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${docNumber || title}.pdf`)
  }, [docNumber, title])

  const fmtAmount = (n: unknown) => {
    const num = Number(n) || 0
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div>
      <div className="flex justify-end gap-2 mb-3 no-print">
        <Button variant="outline" size="sm" onClick={handleDownloadPdf} className="gap-2">
          <Download className="h-4 w-4" /> PDF
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" /> Print
        </Button>
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden overflow-x-auto">
        <style>{printStyles}</style>
        <div ref={ref} className="page mx-auto" style={{ width: '210mm' }}>
          {/* Header */}
          <table className="header-table">
            <tbody>
              <tr>
                <td className="logo-cell">
                  {company.logo ? (
                    <img src={company.logo} alt="logo" className="logo-img" />
                  ) : (
                    <div className="w-[70px] h-[70px] bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 border border-dashed rounded">LOGO</div>
                  )}
                </td>
                <td className="company-info">
                  <div className="company-name">{company.name}</div>
                  <div className="company-addr">
                    {company.address}<br />
                    {company.phone && `TEL: ${company.phone}`} {company.email && `EMAIL: ${company.email}`}
                  </div>
                </td>
                <td className="reg-no">
                  REG NO : {company.regNo || company.taxNo || '—'}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="separator" />

          {/* Info Section */}
          <div className="info-container">
            <div className="to-section">
              <div className="grid grid-cols-[45px_1fr] gap-x-2">
                <span className="font-bold">TO:</span>
                <div>
                  <div className="font-bold uppercase">{customerName || headerFields.find(f => f.label === 'Customer')?.value || '—'}</div>
                  <div className="whitespace-pre-wrap text-[10px] mt-1 text-slate-700">{customerAddress || '—'}</div>
                </div>
                
                <span className="font-bold mt-3">ATTN:</span>
                <div className="mt-3">
                  <div className="font-bold uppercase">{attnName || '—'}</div>
                  <div className="text-[9px] text-slate-600">{attnEmail || '—'}</div>
                </div>
              </div>
            </div>

            <div className="doc-box">
              <div className="doc-header">{title.toUpperCase()}</div>
              <div className="doc-body">
                <div className="doc-row">
                  <span className="doc-key">{title} NO:</span>
                  <span className="doc-val">{docNumber || 'DRAFT'}</span>
                </div>
                {poNumber && (
                  <div className="doc-row">
                    <span className="doc-key">PO NO:</span>
                    <span className="doc-val">{poNumber}</span>
                  </div>
                )}
                <div className="doc-row">
                  <span className="doc-key">DATE:</span>
                  <span className="doc-val">{headerFields.find(f => f.label === 'Date')?.value || '—'}</span>
                </div>
                {title === 'Quotation' && (
                  <div className="doc-row">
                    <span className="doc-key">VALIDITY:</span>
                    <span className="doc-val">{headerFields.find(f => f.label === 'Validity')?.value || '—'}</span>
                  </div>
                )}
                {terms && (
                  <div className="doc-row">
                    <span className="doc-key">TERMS:</span>
                    <span className="doc-val">{terms}</span>
                  </div>
                )}
                <div className="doc-row">
                  <span className="doc-key">SALES:</span>
                  <span className="doc-val">{salesPerson || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Project/Subject */}
          <div className="subject-line">
            {title === 'Quotation' ? 'QUOTATION FOR ' : 'PROJECT / SERVICE: '}
            {project || headerFields.find(f => f.label === 'Project')?.value || '—'}
          </div>

          {/* Items Table */}
          <table className="items-table">
            <thead>
              <tr>
                <th className="sn-col">SN</th>
                <th>ITEM / DESCRIPTION</th>
                {columns.some(c => c.key === 'r') && <th className="price-col">UNIT PRICE ({currency})</th>}
                <th className="qty-col">QTY</th>
                {columns.some(c => c.key === 't') && <th className="total-col">SUB TOTAL ({currency})</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="sn-col">{i + 1}</td>
                  <td className="description-cell">
                    <div className="item-name">{item.d}</div>
                    {item.components && item.components.length > 0 && (
                      <div className="comp-list">
                        {item.components.map((comp: string, ci: number) => (
                          <div key={ci} className="comp-item">
                            <span className="comp-dot">•</span>
                            <span>{comp}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {(!item.components || item.components.length === 0) && item.description && (
                       <div className="text-[10px] whitespace-pre-wrap">{item.description}</div>
                    )}
                  </td>
                  {columns.some(c => c.key === 'r') && <td className="price-col">{fmtAmount(item.r || item.rate || 0)}</td>}
                  <td className="qty-col">{item.q || item.qty || 1}</td>
                  {columns.some(c => c.key === 't') && <td className="total-col">{fmtAmount(item.t || item.total || 0)}</td>}
                </tr>
              ))}
              {total !== undefined && (
                <tr className="total-row">
                  <td colSpan={columns.some(c => c.key === 'r') ? 4 : 3} className="total-label">SUB TOTAL ({currency})</td>
                  <td className="total-col">{fmtAmount(total)}</td>
                </tr>
              )}
              {discount > 0 && (
                <tr className="total-row">
                  <td colSpan={columns.some(c => c.key === 'r') ? 4 : 3} className="total-label text-red-600">DISCOUNT ({currency})</td>
                  <td className="total-col text-red-600">-{fmtAmount(discount)}</td>
                </tr>
              )}
              {tax > 0 && (
                <tr className="total-row">
                  <td colSpan={columns.some(c => c.key === 'r') ? 4 : 3} className="total-label">TAX ({currency})</td>
                  <td className="total-col">{fmtAmount(tax)}</td>
                </tr>
              )}
              {total !== undefined && (
                <tr className="total-row" style={{ fontSize: '13px', background: '#f8fafc' }}>
                  <td colSpan={columns.some(c => c.key === 'r') ? 4 : 3} className="total-label text-[#004d99]">NET TOTAL ({currency})</td>
                  <td className="total-col text-[#004d99]">{fmtAmount(total - discount + tax)}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Payment Info for Invoice */}
          {title === 'Invoice' && company.bank && (
            <div className="mt-4 text-[9px]">
              <div className="font-bold mb-1">1. ALL CHEQUE SHOULD BE CROSSED AND MAKE PAYABLE TO : {company.name}</div>
              <div className="font-bold">2. FOR T/T, PLEASE SEND TO :</div>
              <div className="pl-4 whitespace-pre-wrap mt-1">{company.bank}</div>
            </div>
          )}

          {/* Notes/Terms */}
          {notes && (
            <div className="mt-4">
              <div className="font-bold text-[10px] underline mb-1">NOTES:</div>
              <div className="text-[9px] whitespace-pre-wrap">{notes}</div>
            </div>
          )}

          {/* Signatures or Computer Generated Message */}
          {showSignature ? (
            <div className="sig-container">
              {title === 'Quotation' ? (
                <div className="sig-box">
                  <div className="sig-line" />
                  <div className="sig-text">QUOTATION ACCEPTED BY:</div>
                  <div className="text-[9px] mt-1">NAME / SIGNATURE</div>
                </div>
              ) : (
                <div className="sig-box">
                  <div className="sig-line" />
                  <div className="sig-text">APPROVED SIGNATURE</div>
                  <div className="text-[9px] mt-1">({customerName || '—'})</div>
                </div>
              )}
              <div className="sig-box">
                <div className="sig-line" />
                <div className="sig-text">AUTHORISED SIGNATURE</div>
                <div className="text-[9px] mt-1">(FOR {company.name})</div>
              </div>
            </div>
          ) : (
            <div className="mt-10 pt-5 text-center italic text-[10px] text-slate-500 border-t border-dashed border-slate-200">
              This is a computer generated document and does not require a signature.
            </div>
          )}

          {/* Footer */}
          <div className="footer-line" />
          <div className="footer-links">
             WWW.{company.name.split(' ')[0].toLowerCase()}.COM | ADMIN@{company.name.split(' ')[0].toLowerCase()}.COM
          </div>
        </div>
      </div>
    </div>
  )
}
