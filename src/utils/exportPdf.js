import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generatePdfReport(data, filters = {}) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const totalEvaluations = data.length;
  const avgScore = totalEvaluations > 0 
    ? (data.reduce((acc, curr) => acc + (Number(curr.nilai) || 0), 0) / totalEvaluations).toFixed(1)
    : 0;

  const countA = data.filter(d => d.huruf === 'A').length;
  const countB = data.filter(d => d.huruf === 'B').length;
  const countC = data.filter(d => d.huruf === 'C').length;
  const countD = data.filter(d => d.huruf === 'D').length;

  // Title Banner
  doc.setFillColor(15, 23, 42); // Navy-900
  doc.rect(0, 0, 297, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('WERKUDARA GROUP', 14, 12);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Laporan Evaluasi & Performa Vendor', 14, 19);

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  doc.setFontSize(9);
  doc.text(`Tanggal Cetak: ${todayStr}`, 283, 19, { align: 'right' });

  // Filter & KPI Summary Card Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 30, 269, 20, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('RINGKASAN PERFORMA:', 18, 37);

  doc.setFont('helvetica', 'normal');
  doc.text(`Total Evaluasi: ${totalEvaluations} data`, 18, 44);
  doc.text(`Rata-rata Skor: ${avgScore} / 100`, 75, 44);
  doc.text(`Grade A: ${countA}  |  Grade B: ${countB}  |  Grade C: ${countC}  |  Grade D: ${countD}`, 145, 44);

  // Table Columns & Rows
  const tableHeaders = [
    'No',
    'Nama Event',
    'Bulan',
    'Tgl Event',
    'Nama Vendor',
    'Barang / Jasa',
    'Alamat',
    'Nilai',
    'Grade',
    'Rekomendasi'
  ];

  const tableRows = data.map((item, index) => [
    item.eventNo || index + 1,
    item.event || '-',
    item.bulan || '-',
    item.tglEvent || '-',
    item.vendor || '-',
    item.category || '-',
    item.alamat || '-',
    item.nilai !== undefined ? Number(item.nilai).toFixed(0) : '-',
    item.huruf || 'C',
    item.rekomendasi || '-'
  ]);

  autoTable(doc, {
    startY: 54,
    head: [tableHeaders],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // Slate-800
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' }, // No
      1: { cellWidth: 44 }, // Event
      2: { cellWidth: 22 }, // Bulan
      3: { cellWidth: 26 }, // Tgl
      4: { cellWidth: 34, fontStyle: 'bold' }, // Vendor
      5: { cellWidth: 26 }, // Category
      6: { cellWidth: 20 }, // Alamat
      7: { cellWidth: 14, halign: 'center', fontStyle: 'bold' }, // Nilai
      8: { cellWidth: 14, halign: 'center', fontStyle: 'bold' }, // Grade
      9: { cellWidth: 59 }  // Rekomendasi
    },
    didParseCell: (dataCell) => {
      if (dataCell.section === 'body' && dataCell.column.index === 8) {
        const val = String(dataCell.cell.raw);
        if (val === 'A') {
          dataCell.cell.styles.textColor = [22, 163, 74];
          dataCell.cell.styles.fontStyle = 'bold';
        } else if (val === 'B') {
          dataCell.cell.styles.textColor = [37, 99, 235];
          dataCell.cell.styles.fontStyle = 'bold';
        } else if (val === 'C') {
          dataCell.cell.styles.textColor = [217, 119, 6];
          dataCell.cell.styles.fontStyle = 'bold';
        } else if (val === 'D') {
          dataCell.cell.styles.textColor = [220, 38, 38];
          dataCell.cell.styles.fontStyle = 'bold';
        }
      }
    },
    didDrawPage: (pageData) => {
      // Footer page numbering
      const totalPages = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Halaman ${pageData.pageNumber} dari ${totalPages}`,
        283,
        202,
        { align: 'right' }
      );
      doc.text(
        'Werkudara Group — Vendor Performance Monitoring System',
        14,
        202
      );
    }
  });

  doc.save(`Laporan_Evaluasi_Vendor_Werkudara_${new Date().toISOString().slice(0, 10)}.pdf`);
}
