import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Exports an array of objects to an Excel (.xlsx) file and triggers download.
 */
export function exportToExcel(data: Record<string, any>[], filename: string, sheetName: string = 'Sheet1') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length, ...data.map((row) => String(row[key] || '').length)).valueOf(),
  }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Exports an array of objects to a PDF file and triggers download.
 */
export function exportToPDF(data: Record<string, any>[], filename: string, title: string = 'Report') {
  if (!data || data.length === 0) return;

  const doc = new jsPDF();
  const headers = Object.keys(data[0]);
  const body = data.map((row) => headers.map((header) => String(row[header] || '')));

  // Title and Date
  doc.setFontSize(16);
  doc.text(title, 14, 15);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 22);

  // Table
  autoTable(doc, {
    head: [headers],
    body: body,
    startY: 28,
    theme: 'grid',
    headStyles: { fillColor: [99, 102, 241] }, // Indigo 500
  });

  doc.save(`${filename}.pdf`);
}
