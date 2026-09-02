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
 * Capture HTML element to PNG data URL with high crisp resolution
 */
async function captureElement(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return null;
  try {
    const canvas = await html2canvas(el, {
      scale: 2, // High resolution capture
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1280
    });
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Gagal mengambil tampilan elemen:', elementId, err);
    return null;
  }
}

/**
 * Draw captured image onto jsPDF maintaining aspect ratio
 */
function drawImageToPdf(doc, imgData, x, y, maxW, maxH) {
  if (!imgData) return Promise.resolve(y);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let w = maxW;
      let h = (img.height / img.width) * w;
      if (maxH && h > maxH) {
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
 * Executive Multi-page PDF Report matching EXACT Web Dashboard UI elements & active filters
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
    ? `Filter Aktif: ${activeFilters.join(' | ')} (${data.length} Data Terfilter)`
    : `Filter: Semua Data (${data.length} Total Data)`;

  // CAPTURE ACTUAL DASHBOARD UI CARDS & CHARTS EXACTLY AS SHOWN ON WEB SCREEN
  const [
    kpiImg,
    overviewImg,
    trendImg,
    donutImg,
    repeatImg,
    catImg,
    locImg,
    mapImg,
    tableImg
  ] = await Promise.all([
    captureElement('kpi-cards-row'),
    captureElement('chart-card-overview'),
    captureElement('chart-card-trend'),
    captureElement('chart-card-donut'),
    captureElement('chart-card-repeat'),
    captureElement('chart-card-category'),
    captureElement('chart-card-location'),
    captureElement('region-map-card'),
    captureElement('data-table-card')
  ]);

  // Helper Header & Footer for every page
  const addHeaderFooter = (pageNum, totalPages) => {
    // Header Banner
    doc.setFillColor(15, 23, 42); // Navy-900
    doc.rect(0, 0, 210, 14, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text('WERKUDARA GROUP', 12, 9.5);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('EXECUTIVE VENDOR PERFORMANCE REPORT', 198, 9.5, { align: 'right' });

    // Footer line & text
    doc.setDrawColor(226, 232, 240);
    doc.line(12, 283, 198, 283);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text('Werkudara Group - Dokumen Laporan Eksekutif Resmi', 12, 289);
    doc.text(`Halaman ${pageNum} dari ${totalPages}`, 198, 289, { align: 'right' });
  };

  // ==========================================
  // PAGE 1: TITLE BANNER + KPI CARDS + OVERVIEW CHART
  // ==========================================
  
  // Decorative Banner Top
  doc.setFillColor(37, 99, 201); // Blue-600
  doc.rect(0, 0, 210, 5, 'F');

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 5, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  doc.text('WERKUDARA GROUP', 12, 18);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(201, 226, 250);
  doc.text('Laporan Eksekutif Evaluasi & Performa Vendor', 12, 25);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Tanggal Cetak: ${todayStr}  |  Periode: 2026`, 12, 32);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(201, 226, 250);
  doc.text(filterSummaryText, 12, 38);

  let currentY = 44;

  // 1. KPI CARDS CAPTURED IMAGE
  if (kpiImg) {
    currentY = await drawImageToPdf(doc, kpiImg, 12, currentY, 186, 32);
    currentY += 4;
  }

  // 2. OVERVIEW CHART CAPTURED IMAGE
  if (overviewImg) {
    currentY = await drawImageToPdf(doc, overviewImg, 12, currentY, 186, 185);
  }

  addHeaderFooter(1, 4);

  // ==========================================
  // PAGE 2: TREND BULANAN + DONUT PREDIKAT + REPEAT ORDER
  // ==========================================
  doc.addPage();
  currentY = 18;

  // Tren Bulanan & Donut Predikat (Side by side)
  if (trendImg && donutImg) {
    const p1 = drawImageToPdf(doc, trendImg, 12, currentY, 91, 78);
    const p2 = drawImageToPdf(doc, donutImg, 107, currentY, 91, 78);
    const [y1, y2] = await Promise.all([p1, p2]);
    currentY = Math.max(y1, y2) + 6;
  } else if (trendImg) {
    currentY = await drawImageToPdf(doc, trendImg, 12, currentY, 186, 78);
    currentY += 6;
  } else if (donutImg) {
    currentY = await drawImageToPdf(doc, donutImg, 12, currentY, 186, 78);
    currentY += 6;
  }

  // Hero Repeat Order Chart
  if (repeatImg) {
    currentY = await drawImageToPdf(doc, repeatImg, 12, currentY, 186, 160);
  }

  addHeaderFooter(2, 4);

  // ==========================================
  // PAGE 3: PERFORMA KATEGORI + WILAYAH + PETA INDONESIA
  // ==========================================
  doc.addPage();
  currentY = 18;

  // Kategori & Wilayah (Side by side)
  if (catImg && locImg) {
    const p1 = drawImageToPdf(doc, catImg, 12, currentY, 91, 85);
    const p2 = drawImageToPdf(doc, locImg, 107, currentY, 91, 85);
    const [y1, y2] = await Promise.all([p1, p2]);
    currentY = Math.max(y1, y2) + 6;
  } else if (catImg) {
    currentY = await drawImageToPdf(doc, catImg, 12, currentY, 186, 85);
    currentY += 6;
  } else if (locImg) {
    currentY = await drawImageToPdf(doc, locImg, 12, currentY, 186, 85);
    currentY += 6;
  }

  // Peta Wilayah Indonesia Card
  if (mapImg) {
    currentY = await drawImageToPdf(doc, mapImg, 12, currentY, 186, 150);
  }

  addHeaderFooter(3, 4);

  // ==========================================
  // PAGE 4: DAFTAR EVALUASI VENDOR DETAIL TABLE
  // ==========================================
  doc.addPage();
  currentY = 18;

  if (tableImg) {
    currentY = await drawImageToPdf(doc, tableImg, 12, currentY, 186, 255);
  } else {
    // Fallback Table using autoTable
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`Daftar Evaluasi Vendor Detail (${data.length} Data Terfilter)`, 12, 24);

    const tableHeaders = ['Nama Event', 'Bulan', 'Tgl Event', 'Nama Vendor', 'Kategori', 'Lokasi', 'Skor', 'Grade', 'Rekomendasi'];
    const tableRows = data.map(item => [
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
      startY: 28,
      head: [tableHeaders],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 42, 87], textColor: 255, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 18 },
        2: { cellWidth: 20 },
        3: { cellWidth: 28, fontStyle: 'bold' },
        4: { cellWidth: 22 },
        5: { cellWidth: 18 },
        6: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
        7: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
        8: { cellWidth: 23 }
      }
    });
  }

  addHeaderFooter(4, 4);

  doc.save(`Laporan_FullReport_Vendor_Werkudara_${new Date().toISOString().slice(0, 10)}.pdf`);
}
