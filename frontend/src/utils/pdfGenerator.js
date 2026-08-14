/**
 * Utility for generating and downloading official Municipal Final Repair Bills in PDF format.
 */

export const generateFinalBillPDF = (billData) => {
  const {
    work_order_id = "WO-2026-0000",
    report_id = "REP-000",
    title = "Infrastructure Repair Work Order",
    department = "PWD - Road & Drainage",
    engineer_name = "Er. Field Engineer Crew",
    admin_name = "Municipal Works Officer (Admin)",
    approved_by = "Approval Authority Chair",
    approved_budget = 50000,
    material_cost = 27500,
    labor_cost = 12500,
    equipment_cost = 6000,
    contingency_cost = 4000,
    delay_discount_applied = false,
    final_bill_amount = 50000,
    notes = "Work completed satisfactorily on site with photographic verification.",
    created_at = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
    repaired_photo_url = ""
  } = billData;

  const invoiceNo = `TAX-INV-MUNI-${work_order_id.replace("WO-", "")}`;
  const totalOriginal = (material_cost || 0) + (labor_cost || 0) + (equipment_cost || 0) + (contingency_cost || 0) || approved_budget;
  const discountAmount = delay_discount_applied ? Math.round(totalOriginal * 0.10) : 0;
  const subtotalBeforeTax = totalOriginal - discountAmount;

  // 18% Statutory GST Calculation (9% CGST + 9% SGST)
  const cgstAmount = Math.round(subtotalBeforeTax * 0.09);
  const sgstAmount = Math.round(subtotalBeforeTax * 0.09);
  const totalGst = cgstAmount + sgstAmount;
  const grandTotalWithGst = subtotalBeforeTax + totalGst;

  // Format currency
  const fmt = (amt) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt || 0);

  const printHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Official Municipal GST Tax Invoice - ${work_order_id}</title>
  <style>
    @media print {
      body { margin: 0; padding: 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0f172a; background: #fff; }
      .no-print { display: none !important; }
    }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 40px; color: #0f172a; background: #f8fafc; }
    .invoice-card { max-width: 820px; margin: 0 auto; background: #fff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 40px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 24px; }
    .govt-seal { display: flex; align-items: center; gap: 12px; }
    .govt-seal-logo { width: 52px; height: 52px; background: #0f172a; color: #38bdf8; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; }
    .title-block h1 { margin: 0; font-size: 22px; color: #0f172a; font-weight: 800; letter-spacing: -0.5px; }
    .title-block p { margin: 4px 0 0 0; color: #0284c7; font-size: 13px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
    .inv-meta { text-align: right; }
    .inv-number { font-size: 18px; font-weight: 800; color: #0284c7; }
    .gstin-tag { font-size: 11px; font-weight: 700; color: #475569; margin-top: 2px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; display: inline-block; }
    .inv-date { font-size: 13px; color: #64748b; margin-top: 4px; }
    .status-stamp { display: inline-block; padding: 4px 12px; background: #dcfce7; color: #15803d; border: 1px solid #86efac; border-radius: 20px; font-weight: 800; font-size: 11px; text-transform: uppercase; margin-top: 8px; }
    
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
    .info-group label { display: block; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-group span { display: block; font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 3px; }
    
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    th { background: #0f172a; color: #fff; text-align: left; padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; color: #334155; }
    tr:nth-child(even) { background: #f8fafc; }
    
    .gst-table { width: 360px; margin-left: auto; margin-bottom: 30px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .gst-table td { padding: 8px 14px; border-bottom: 1px solid #f1f5f9; }
    .gst-table tr.grand-total td { font-size: 16px; font-weight: 800; color: #0f172a; border-top: 2px solid #0284c7; background: #eff6ff; }
    
    .penalty-banner { background: #fff1f2; border: 1px solid #fecdd3; color: #9f1239; padding: 12px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; margin-bottom: 24px; display: flex; align-items: center; gap: 8px; }
    
    .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 24px; text-align: center; }
    .sig-box { border-top: 1px dashed #cbd5e1; padding-top: 8px; font-size: 12px; color: #64748b; }
    .sig-box strong { display: block; color: #0f172a; font-size: 13px; }
    
    .actions-bar { max-width: 820px; margin: 0 auto 20px auto; display: flex; justify-content: space-between; align-items: center; }
    .btn-print { background: #0284c7; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(2,132,199,0.3); }
    .btn-close { background: #64748b; color: #fff; border: none; padding: 10px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; }
  </style>
</head>
<body>
  <div class="actions-bar no-print">
    <button class="btn-close" onclick="window.close()">← Close Preview</button>
    <button class="btn-print" onclick="window.print()">📥 Download GST Tax Invoice PDF</button>
  </div>

  <div class="invoice-card">
    <div class="header">
      <div class="govt-seal">
        <div class="govt-seal-logo">🏛️</div>
        <div class="title-block">
          <h1>MUNICIPAL INFRASTRUCTURE CARE</h1>
          <p>Official Statutory GST Tax Invoice & Settlement</p>
        </div>
      </div>
      <div class="inv-meta">
        <div class="inv-number">${invoiceNo}</div>
        <div class="gstin-tag">GSTIN: 29AAACM9876F1Z5</div>
        <div class="inv-date">Date: ${created_at}</div>
        <div class="status-stamp">✓ SANCTIONED & APPROVED</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="info-group">
        <label>Work Order Ref ID</label>
        <span>${work_order_id}</span>
      </div>
      <div class="info-group">
        <label>Complaint / Project Title</label>
        <span>${title}</span>
      </div>
      <div class="info-group">
        <label>Department / Cell</label>
        <span>${department}</span>
      </div>
      <div class="info-group">
        <label>Submitted by Field Engineer</label>
        <span>${engineer_name}</span>
      </div>
      <div class="info-group">
        <label>Audited by Works Officer (Admin)</label>
        <span>${admin_name}</span>
      </div>
      <div class="info-group">
        <label>Financial Sanctioning Authority</label>
        <span>${approved_by}</span>
      </div>
    </div>

    ${delay_discount_applied ? `
      <div class="penalty-banner">
        ⚠️ <strong>SLA Completion Penalty Applied:</strong> Repair work exceeded targeted completion window. A 10% discount penalty (${fmt(discountAmount)}) was deducted prior to GST calculation.
      </div>
    ` : ''}

    <h3>Itemized Works & Tax Distribution</h3>
    <table>
      <thead>
        <tr>
          <th>S.No</th>
          <th>Works & Supply Description</th>
          <th>HSN/SAC Code</th>
          <th>Taxable Category</th>
          <th style="text-align: right;">Base Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Raw Repair Materials, Concrete/Asphalt/Cables & Hardware</td>
          <td>995412</td>
          <td>Material Supply (18% GST)</td>
          <td style="text-align: right; font-weight: bold;">${fmt(material_cost)}</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Field Labor Crews, Technical Wages & Supervisors</td>
          <td>995419</td>
          <td>Labor Contract (18% GST)</td>
          <td style="text-align: right; font-weight: bold;">${fmt(labor_cost)}</td>
        </tr>
        <tr>
          <td>3</td>
          <td>Heavy Equipment Rental (Roller/Paver/Bucket Truck)</td>
          <td>997314</td>
          <td>Machinery Hire (18% GST)</td>
          <td style="text-align: right; font-weight: bold;">${fmt(equipment_cost)}</td>
        </tr>
        <tr>
          <td>4</td>
          <td>Emergency Testing, Inspection & Safety Contingency</td>
          <td>995429</td>
          <td>Contingency (18% GST)</td>
          <td style="text-align: right; font-weight: bold;">${fmt(contingency_cost)}</td>
        </tr>
      </tbody>
    </table>

    <table class="gst-table">
      <tr>
        <td>Gross Subtotal (Excl. Tax):</td>
        <td style="text-align: right; font-weight: bold;">${fmt(totalOriginal)}</td>
      </tr>
      ${delay_discount_applied ? `
      <tr style="color: #dc2626;">
        <td>Less: 10% SLA Delay Penalty:</td>
        <td style="text-align: right; font-weight: bold;">-${fmt(discountAmount)}</td>
      </tr>
      ` : ''}
      <tr style="background: #f8fafc;">
        <td><strong>Net Taxable Base Value:</strong></td>
        <td style="text-align: right; font-weight: bold; color: #0284c7;">${fmt(subtotalBeforeTax)}</td>
      </tr>
      <tr>
        <td>Add: Central GST (CGST @ 9%):</td>
        <td style="text-align: right; font-weight: bold;">+${fmt(cgstAmount)}</td>
      </tr>
      <tr>
        <td>Add: State GST (SGST @ 9%):</td>
        <td style="text-align: right; font-weight: bold;">+${fmt(sgstAmount)}</td>
      </tr>
      <tr style="background: #f1f5f9;">
        <td><strong>Total GST Liability (18%):</strong></td>
        <td style="text-align: right; font-weight: bold; color: #16a34a;">+${fmt(totalGst)}</td>
      </tr>
      <tr class="grand-total">
        <td>Grand Total Bill (Incl. GST):</td>
        <td style="text-align: right; color: #0f172a;">${fmt(grandTotalWithGst || final_bill_amount)}</td>
      </tr>
    </table>

    <div style="background: #f1f5f9; padding: 14px; border-radius: 8px; margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: bold; color: #475569; text-transform: uppercase; margin-bottom: 4px;">Engineer Site Audit & Tax Declaration:</div>
      <div style="font-size: 13px; color: #1e293b; font-style: italic;">"${notes}"</div>
    </div>

    <div class="signatures">
      <div class="sig-box">
        <strong>${engineer_name}</strong>
        Submitted by Field Engineer
      </div>
      <div class="sig-box">
        <strong>${admin_name}</strong>
        Audited by Works Officer
      </div>
      <div class="sig-box">
        <strong>${approved_by}</strong>
        Sanctioned by Financial Authority
      </div>
    </div>
  </div>
</body>
</html>
  `;



  // Open printable window and automatically trigger print to PDF download
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(printHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  }
};
