import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

/**
 * Standard Landscape Table PDF Export
 */
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

  // Header Banner
  doc.setFillColor(15, 23, 42); // Navy-900
  doc.rect(0, 0, 297, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('WERKUDARA GROUP', 14, 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Laporan Evaluasi & Performa Vendor', 14, 19);

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  doc.setFontSize(9);
  doc.text(`Tanggal Cetak: ${todayStr}`, 283, 19, { align: 'right' });

  // KPI Card Box
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
      0: { cellWidth: 50 },
      1: { cellWidth: 22 },
      2: { cellWidth: 26 },
      3: { cellWidth: 34, fontStyle: 'bold' },
      4: { cellWidth: 26 },
      5: { cellWidth: 20 },
      6: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
      7: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
      8: { cellWidth: 65 }
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
        'Werkudara Group - Vendor Performance Monitoring System',
        14,
        202
      );
    }
  });

  doc.save(`Laporan_Evaluasi_Vendor_Werkudara_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Capture HTML element to PNG data URL
 */
async function captureElement(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return null;
  try {
    const canvas = await html2canvas(el, {
      scale: 2, // High resolution
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Gagal mengambil tampilan elemen:', elementId, err);
    return null;
  }
}

/**
 * Helper to draw captured image onto jsPDF maintaining aspect ratio
 */
function drawImageToPdf(doc, imgData, x, y, maxW, maxH) {
  if (!imgData) return y;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let w = maxW;
      let h = (img.height / img.width) * w;
      if (h > maxH) {
        h = maxH;
        w = (img.width / img.height) * h;
      }
      doc.addImage(imgData, 'PNG', x, y, w, h);
      resolve(y + h);
    };
    img.onerror = () => resolve(y);
    img.src = imgData;
  });
}

/**
 * Executive Multi-page PDF Report capturing EXACT Web Dashboard UI elements & active filters
 */
export async function generateFullReport(data, filters = {}) {
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

  // Active Filter Summary string
  const activeFilters = [];
  if (filters.bulan) activeFilters.push(`Bulan: ${filters.bulan}`);
  if (filters.vendor) activeFilters.push(`Vendor: ${filters.vendor}`);
  if (filters.event) activeFilters.push(`Event: ${filters.event}`);
  if (filters.category) activeFilters.push(`Kategori: ${filters.category}`);
  if (filters.location) activeFilters.push(`Wilayah: ${filters.location}`);
  if (filters.grade) activeFilters.push(`Grade: ${filters.grade}`);
  if (filters.search) activeFilters.push(`Cari: "${filters.search}"`);

  const filterSummaryText = activeFilters.length > 0
    ? `Filter Aktif Dashboard: ${activeFilters.join(' | ')}`
    : 'Filter Dashboard: Semua Data (Tanpa Filter)';

  // Aggregations based on active filtered dataset
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

  // CAPTURE ACTUAL DASHBOARD UI CARDS & CHARTS
  const [
    kpiImg,
    overviewImg,
    trendImg,
    donutImg,
    repeatImg,
    catImg,
    locImg
  ] = await Promise.all([
    captureElement('kpi-cards-row'),
    captureElement('chart-card-overview'),
    captureElement('chart-card-trend'),
    captureElement('chart-card-donut'),
    captureElement('chart-card-repeat'),
    captureElement('chart-card-category'),
    captureElement('chart-card-location')
  ]);

  // Helper Header & Footer
  const addHeaderFooter = (pageNum, totalPages) => {
    // Header
    doc.setFillColor(15, 23, 42); // Navy-900
    doc.rect(0, 0, 210, 14, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text('WERKUDARA GROUP', 14, 9.5);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('EXECUTIVE VENDOR PERFORMANCE REPORT', 196, 9.5, { align: 'right' });

    // Footer line & text
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 283, 196, 283);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text('Werkudara Group - Dokumen Rahasia & Internal Operasional', 14, 289);
    doc.text(`Halaman ${pageNum} dari ${totalPages}`, 196, 289, { align: 'right' });
  };

  // ==========================================
  // PAGE 1: EXECUTIVE SUMMARY & DASHBOARD CHARTS (OVERVIEW, DONUT, TREND)
  // ==========================================
  
  // Decorative Banner Top
  doc.setFillColor(37, 99, 201); // Blue-600
  doc.rect(0, 0, 210, 5, 'F');

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 5, 210, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('WERKUDARA GROUP', 14, 20);

  doc.setFontSize(11.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(201, 226, 250);
  doc.text('Laporan Eksekutif Evaluasi & Performa Vendor', 14, 28);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Tanggal Cetak: ${todayStr}  |  Periode: 2026`, 14, 35);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(201, 226, 250);
  doc.text(filterSummaryText, 14, 42);

  let currentY = 51;

  // 1. KPI CARDS CAPTURED IMAGE
  if (kpiImg) {
    currentY = await drawImageToPdf(doc, kpiImg, 14, currentY, 182, 30);
    currentY += 4;
  } else {
    // Fallback KPI Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, currentY, 182, 28, 2, 2, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text('RINGKASAN UTAMA (EXECUTIVE KPI)', 18, currentY + 8);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Total Evaluasi: ${total} Event`, 18, currentY + 16);
    doc.text(`Rata-Rata Skor: ${avg} / 100`, 75, currentY + 16);
    doc.text(`Kelayakan (A+B): ${(Number(pctA) + Number(pctB)).toFixed(1)}%`, 135, currentY + 16);
    currentY += 32;
  }

  // 2. OVERVIEW CHART CAPTURED IMAGE (Tampilan Web)
  if (overviewImg) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Grafik Ringkasan Performa Vendor (Tampilan Web Dashboard):', 14, currentY + 2);
    currentY += 5;
    currentY = await drawImageToPdf(doc, overviewImg, 14, currentY, 182, 70);
    currentY += 4;
  }

  // 3. DONUT & TREND CHARTS CAPTURED IMAGES (Side-by-side or stacked)
  if (trendImg || donutImg) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Grafik Tren Performa & Distribusi Predikat (Tampilan Web Dashboard):', 14, currentY + 2);
    currentY += 5;

    if (trendImg && donutImg) {
      // Draw side-by-side
      const p1 = drawImageToPdf(doc, trendImg, 14, currentY, 89, 72);
      const p2 = drawImageToPdf(doc, donutImg, 107, currentY, 89, 72);
      const [y1, y2] = await Promise.all([p1, p2]);
      currentY = Math.max(y1, y2) + 4;
    } else if (trendImg) {
      currentY = await drawImageToPdf(doc, trendImg, 14, currentY, 182, 70);
      currentY += 4;
    } else if (donutImg) {
      currentY = await drawImageToPdf(doc, donutImg, 14, currentY, 182, 70);
      currentY += 4;
    }
  }

  addHeaderFooter(1, 3);

  // ==========================================
  // PAGE 2: REPEAT VENDOR, KATEGORI & LOKASI CHARTS
  // ==========================================
  doc.addPage();
  currentY = 20;

  // 4. REPEAT VENDOR CHART CAPTURED IMAGE
  if (repeatImg) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Grafik Performa Vendor Berulang / Repeat Order (Tampilan Web Dashboard):', 14, currentY);
    currentY += 4;
    currentY = await drawImageToPdf(doc, repeatImg, 14, currentY, 182, 75);
    currentY += 6;
  }

  // 5. CATEGORY & LOCATION CHARTS CAPTURED IMAGES
  if (catImg || locImg) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Grafik Performa Per Kategori & Wilayah (Tampilan Web Dashboard):', 14, currentY);
    currentY += 4;

    if (catImg && locImg) {
      const p1 = drawImageToPdf(doc, catImg, 14, currentY, 89, 75);
      const p2 = drawImageToPdf(doc, locImg, 107, currentY, 89, 75);
      const [y1, y2] = await Promise.all([p1, p2]);
      currentY = Math.max(y1, y2) + 6;
    } else if (catImg) {
      currentY = await drawImageToPdf(doc, catImg, 14, currentY, 182, 75);
      currentY += 6;
    } else if (locImg) {
      currentY = await drawImageToPdf(doc, locImg, 14, currentY, 182, 75);
      currentY += 6;
    }
  }

  // Box Rekomendasi Strategis Eksekutif
  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(14, currentY, 182, 45, 2, 2, 'FD');

  doc.setTextColor(12, 74, 110);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('REKOMENDASI STRATEGIS EKSEKUTIF (BERDASARKAN TAMPILAN FILTER AKTIF):', 18, currentY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  const linesRec = [
    `1. Dari total ${total} evaluasi terfilter, sebanyak ${countA + countB} data (${(Number(pctA) + Number(pctB)).toFixed(1)}%) masuk kriteria Sangat Direkomendasikan / Direkomendasikan.`,
    `2. Prioritaskan repeat order pada vendor yang memegang Grade A dengan skor rata-rata >= 85.`,
    `3. Lakukan pendampingan dan perbaikan kontrak bagi vendor pada Grade C & D (${countC + countD} evaluasi / ${(Number(pctC) + Number(pctD)).toFixed(1)}%).`
  ];

  let yLine = currentY + 16;
  linesRec.forEach(line => {
    doc.text(line, 18, yLine);
    yLine += 6;
  });

  addHeaderFooter(2, 3);

  // ==========================================
  // PAGE 3: FULL DATA TABLE ATTACHMENT
  // ==========================================
  doc.addPage();

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Lampiran Data Evaluasi Vendor Terfilter (${total} Data Active View)`, 14, 24);

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
