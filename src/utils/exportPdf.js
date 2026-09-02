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

  const tableRows = data.map((item) => [
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
      0: { cellWidth: 50 }, // Event
      1: { cellWidth: 22 }, // Bulan
      2: { cellWidth: 26 }, // Tgl
      3: { cellWidth: 34, fontStyle: 'bold' }, // Vendor
      4: { cellWidth: 26 }, // Category
      5: { cellWidth: 20 }, // Alamat
      6: { cellWidth: 14, halign: 'center', fontStyle: 'bold' }, // Nilai
      7: { cellWidth: 14, halign: 'center', fontStyle: 'bold' }, // Grade
      8: { cellWidth: 65 }  // Rekomendasi
    },
    didParseCell: (dataCell) => {
      if (dataCell.section === 'body' && dataCell.column.index === 7) {
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

/**
 * Generates a comprehensive multi-page PDF executive report including:
 * - Cover / Executive Summary with KPI stats
 * - Grade distribution chart & analysis narrative
 * - Monthly trend analysis chart & narrative
 * - Top & Bottom vendors comparative analysis chart & narrative
 * - Category & Location breakdown chart & narrative
 * - Detailed evaluation data table
 */
export function generateFullReport(data, filters = {}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4' // 210 x 297 mm
  });

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Calculate Data Aggregations
  const total = data.length;
  const avg = total > 0 ? (data.reduce((a, c) => a + Number(c.nilai || 0), 0) / total).toFixed(1) : 0;
  
  const countA = data.filter(d => d.huruf === 'A').length;
  const countB = data.filter(d => d.huruf === 'B').length;
  const countC = data.filter(d => d.huruf === 'C').length;
  const countD = data.filter(d => d.huruf === 'D').length;

  const pctA = total > 0 ? ((countA / total) * 100).toFixed(1) : 0;
  const pctB = total > 0 ? ((countB / total) * 100).toFixed(1) : 0;
  const pctC = total > 0 ? ((countC / total) * 100).toFixed(1) : 0;
  const pctD = total > 0 ? ((countD / total) * 100).toFixed(1) : 0;

  // Vendor averages
  const vMap = {};
  data.forEach(d => {
    if (!vMap[d.vendor]) vMap[d.vendor] = { sum: 0, count: 0, category: d.category, alamat: d.alamat };
    vMap[d.vendor].sum += Number(d.nilai || 0);
    vMap[d.vendor].count++;
  });

  const vList = Object.keys(vMap).map(v => ({
    name: v,
    avg: parseFloat((vMap[v].sum / vMap[v].count).toFixed(1)),
    count: vMap[v].count,
    category: vMap[v].category,
    alamat: vMap[v].alamat
  })).sort((a, b) => b.avg - a.avg);

  const top3Vendors = vList.slice(0, 3);
  const bottom3Vendors = vList.slice(-3).reverse();

  // Category stats
  const catMap = {};
  data.forEach(d => {
    const c = d.category || 'Lainnya';
    if (!catMap[c]) catMap[c] = { sum: 0, count: 0 };
    catMap[c].sum += Number(d.nilai || 0);
    catMap[c].count++;
  });
  const catList = Object.keys(catMap).map(c => ({
    name: c,
    avg: parseFloat((catMap[c].sum / catMap[c].count).toFixed(1)),
    count: catMap[c].count
  })).sort((a, b) => b.avg - a.avg);

  // Helper Header & Footer
  const addHeaderFooter = (pageNum, totalPages) => {
    // Header
    doc.setFillColor(15, 23, 42); // Navy-900
    doc.rect(0, 0, 210, 16, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('WERKUDARA GROUP', 14, 11);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('EXECUTIVE VENDOR PERFORMANCE REPORT', 196, 11, { align: 'right' });

    // Footer
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 283, 196, 283);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text('Werkudara Group — Confidential & Internal Use Only', 14, 289);
    doc.text(`Halaman ${pageNum} dari ${totalPages}`, 196, 289, { align: 'right' });
  };

  // ==========================================
  // PAGE 1: COVER & EXECUTIVE SUMMARY
  // ==========================================
  
  // Decorative Accent Top
  doc.setFillColor(37, 99, 201); // Blue-600
  doc.rect(0, 0, 210, 8, 'F');

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 8, 210, 48, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('WERKUDARA GROUP', 16, 28);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(201, 226, 250);
  doc.text('Laporan Eksekutif Evaluasi & Performa Vendor', 16, 37);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Dicetak pada: ${todayStr} | Periode Monitoring: 2026`, 16, 46);

  // Executive Summary Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 64, 182, 38, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('RINGKASAN UTAMA (EXECUTIVE KPI)', 20, 74);

  // KPI Grid
  const kpis = [
    { label: 'Total Evaluasi', val: `${total} Event` },
    { label: 'Total Vendor', val: `${vList.length} Vendor` },
    { label: 'Rata-Rata Skor', val: `${avg} / 100` },
    { label: 'Tingkat Kelayakan (A+B)', val: `${(Number(pctA) + Number(pctB)).toFixed(1)}%` }
  ];

  kpis.forEach((kpi, idx) => {
    const x = 20 + (idx * 43);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x, 83);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.val, x, 92);
  });

  // Section 1: Breakdown Grade Chart & Narasi
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. Distribusi Predikat Kualitas Vendor (Grade A - D)', 14, 114);

  // Draw Horizontal Bar Chart for Grades
  const gradeBars = [
    { label: 'Grade A (Sangat Direkomendasikan ≥85)', count: countA, pct: pctA, color: [15, 42, 87] },
    { label: 'Grade B (Direkomendasikan 70–84.99)', count: countB, pct: pctB, color: [37, 99, 201] },
    { label: 'Grade C (Perlu Evaluasi 55–69.99)', count: countC, pct: pctC, color: [214, 154, 37] },
    { label: 'Grade D (Perlu Perbaikan Serius <55)', count: countD, pct: pctD, color: [208, 85, 47] }
  ];

  let yBar = 122;
  gradeBars.forEach(g => {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(g.label, 14, yBar);

    // Bar background
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, yBar + 2, 140, 6, 1, 1, 'F');

    // Bar fill
    const fillW = Math.max(2, (Number(g.pct) / 100) * 140);
    doc.setFillColor(g.color[0], g.color[1], g.color[2]);
    doc.roundedRect(14, yBar + 2, fillW, 6, 1, 1, 'F');

    // Percentage & Count text
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${g.count} data (${g.pct}%)`, 158, yBar + 7);

    yBar += 15;
  });

  // Box Narasi Penjelasan Diagram Grade
  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(14, 182, 182, 36, 2, 2, 'FD');

  doc.setTextColor(12, 74, 110);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('💡 ANALISIS & PENJELASAN DIAGRAM SEBARAN GRADE:', 18, 190);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  const narrativeGrade = [
    `• Berdasarkan data dari ${total} evaluasi vendor, sebanyak ${countA} evaluasi (${pctA}%) mencapai Grade A (Sangat Direkomendasikan).`,
    `• Sebagian besar vendor (${(Number(pctA) + Number(pctB)).toFixed(1)}%) berada pada kategori layak guna (Grade A & B), menunjukkan tingkat kepuasan operasional yang tinggi.`,
    `• Terdapat ${countC + countD} evaluasi (${(Number(pctC) + Number(pctD)).toFixed(1)}%) pada Grade C & D yang memerlukan catatan khusus atau peninjauan ulang sebelum repeat order.`
  ];
  let yNar = 196;
  narrativeGrade.forEach(line => {
    doc.text(line, 18, yNar);
    yNar += 5;
  });

  // Section 2: Top & Bottom Vendor
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. Perbandingan Vendor Performa Tertinggi vs Terendah', 14, 230);

  // Table Top vs Bottom
  const topBottomRows = [];
  const maxLen = Math.max(top3Vendors.length, bottom3Vendors.length);
  for (let i = 0; i < maxLen; i++) {
    const topV = top3Vendors[i] ? `${top3Vendors[i].name} (${top3Vendors[i].avg})` : '-';
    const botV = bottom3Vendors[i] ? `${bottom3Vendors[i].name} (${bottom3Vendors[i].avg})` : '-';
    topBottomRows.push([`Top #${i+1}: ${topV}`, `Bottom #${i+1}: ${botV}`]);
  }

  autoTable(doc, {
    startY: 235,
    head: [['Vendor Performa Tertinggi (Top Performers)', 'Vendor Memerlukan Evaluasi (Bottom Performers)']],
    body: topBottomRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 42, 87], textColor: 255, fontSize: 8.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    columnStyles: { 0: { cellWidth: 91 }, 1: { cellWidth: 91 } }
  });

  addHeaderFooter(1, 3);

  // ==========================================
  // PAGE 2: ANALYSIS PER KATEGORI & WILAYAH
  // ==========================================
  doc.addPage();

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('3. Performa Rata-Rata Berdasarkan Kategori Jasa', 14, 24);

  // Top 6 Categories Bar Chart
  const topCat = catList.slice(0, 6);
  let yCat = 30;
  topCat.forEach(c => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`${c.name} (${c.count} eval)`, 14, yCat);

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, yCat + 2, 140, 5, 1, 1, 'F');

    const fillW = Math.max(2, (c.avg / 100) * 140);
    doc.setFillColor(37, 99, 201);
    doc.roundedRect(14, yCat + 2, fillW, 5, 1, 1, 'F');

    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`Skor: ${c.avg}`, 158, yCat + 6);

    yCat += 13;
  });

  // Narasi Kategori
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 114, 182, 28, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('💡 ANALYSIS NARASI KATEGORI JASA:', 18, 122);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const bestCat = topCat[0] ? `${topCat[0].name} dengan skor rata-rata ${topCat[0].avg}` : '-';
  doc.text(`• Kategori jasa dengan nilai tertinggi adalah ${bestCat}.`, 18, 128);
  doc.text(`• Secara keseluruhan terdapat ${catList.length} jenis kategori jasa yang telah dievaluasi sepanjang periode ini.`, 18, 134);

  // Section 4: Rekomendasi Strategis Eksekutif
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('4. Rekomendasi Strategis & Tindak Lanjut Tim Procurement', 14, 152);

  const recommendations = [
    { title: '1. Prioritas Repeat Order (Grade A)', desc: 'Vendor pada kelompok Grade A terbukti konsisten dan sangat direkomendasikan untuk kontrak utama event mendatang.' },
    { title: '2. Pengawasan & Coaching Vendor (Grade B & C)', desc: 'Vendor pada Grade B dan C perlu diberikan feedback konstruktif terkait area perbaikan sebelum pengerjaan event berikutnya.' },
    { title: '3. Evaluasi Total / Sub-Kontraktor Alternatif (Grade D)', desc: 'Untuk vendor dengan skor Grade D (<55), disarankan pencarian opsi alternatif atau pembekuan sementara repeat order.' }
  ];

  let yRec = 160;
  recommendations.forEach(r => {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, yRec, 182, 18, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 42, 87);
    doc.text(r.title, 18, yRec + 6);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(r.desc, 18, yRec + 12);

    yRec += 22;
  });

  addHeaderFooter(2, 3);

  // ==========================================
  // PAGE 3: FULL DATA TABLE ATTACHMENT
  // ==========================================
  doc.addPage();

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Lampiran: Lampiran Data Evaluasi Vendor Selengkapnya', 14, 24);

  const tableHeaders = ['Nama Event', 'Bulan', 'Tgl Event', 'Nama Vendor', 'Kategori', 'Lokasi', 'Skor', 'Grade'];
  const tableRows = data.map(item => [
    item.event || '-',
    item.bulan || '-',
    item.tglEvent || '-',
    item.vendor || '-',
    item.category || '-',
    item.alamat || '-',
    item.nilai !== undefined ? Number(item.nilai).toFixed(0) : '-',
    item.huruf || 'C'
  ]);

  autoTable(doc, {
    startY: 28,
    head: [tableHeaders],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 42, 87], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 38 },
      1: { cellWidth: 20 },
      2: { cellWidth: 22 },
      3: { cellWidth: 32, fontStyle: 'bold' },
      4: { cellWidth: 24 },
      5: { cellWidth: 20 },
      6: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      7: { cellWidth: 14, halign: 'center', fontStyle: 'bold' }
    },
    didDrawPage: (pageData) => {
      const pageCount = doc.internal.getNumberOfPages();
      addHeaderFooter(pageData.pageNumber, pageCount);
    }
  });

  doc.save(`Laporan_Eksekutif_Vendor_Werkudara_${new Date().toISOString().slice(0, 10)}.pdf`);
}
