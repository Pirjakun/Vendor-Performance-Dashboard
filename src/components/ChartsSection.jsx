import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Star, BarChart3, TrendingUp, PieChart, MapPin } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const NAVY = '#0F2A57';
const BLUE600 = '#2563C9';
const SKY400 = '#6FB1F0';
const SKY200 = '#C9E2FA';
const ICE100 = '#EEF4FC';
const FAIR = '#D69A25';
const POOR = '#D0552F';

function InlineGradeVendorDetails({ grade, evaluations, calcMode, onClose, onVendorClick }) {
  if (!grade) return null;

  const gradeTitles = {
    A: { title: 'Grade A (Sangat Direkomendasikan)', badgeClass: 'grade-a', desc: 'Prioritas utama repeat order' },
    B: { title: 'Grade B (Direkomendasikan)', badgeClass: 'grade-b', desc: 'Dapat digunakan kembali dengan pemantauan' },
    C: { title: 'Grade C (Perlu Evaluasi)', badgeClass: 'grade-c', desc: 'Memerlukan catatan perbaikan' },
    D: { title: 'Grade D (Perlu Perbaikan Serius)', badgeClass: 'grade-d', desc: 'Dipertimbangkan evaluasi total' }
  };

  const currentGradeInfo = gradeTitles[grade] || gradeTitles.A;

  let items = [];
  if (calcMode === 'vendor') {
    const vendorMap = {};
    evaluations.forEach(e => {
      if (!vendorMap[e.vendor]) {
        vendorMap[e.vendor] = { vendor: e.vendor, category: e.category, alamat: e.alamat, sum: 0, count: 0 };
      }
      vendorMap[e.vendor].sum += Number(e.nilai);
      vendorMap[e.vendor].count += 1;
    });

    items = Object.values(vendorMap).map(v => {
      const avg = parseFloat((v.sum / v.count).toFixed(1));
      let huruf = 'D';
      if (avg >= 85) huruf = 'A';
      else if (avg >= 70) huruf = 'B';
      else if (avg >= 55) huruf = 'C';
      return {
        vendor: v.vendor,
        category: v.category,
        alamat: v.alamat,
        score: avg,
        count: v.count,
        huruf
      };
    }).filter(v => v.huruf === grade).sort((a, b) => b.score - a.score);
  } else {
    const map = {};
    evaluations.filter(e => e.huruf === grade).forEach(e => {
      if (!map[e.vendor]) {
        map[e.vendor] = { vendor: e.vendor, category: e.category, alamat: e.alamat, sum: 0, count: 0 };
      }
      map[e.vendor].sum += Number(e.nilai);
      map[e.vendor].count += 1;
    });

    items = Object.values(map).map(v => ({
      vendor: v.vendor,
      category: v.category,
      alamat: v.alamat,
      score: parseFloat((v.sum / v.count).toFixed(1)),
      count: v.count,
      huruf: grade
    })).sort((a, b) => b.score - a.score);
  }

  return (
    <div className="card" style={{
      marginTop: '16px',
      borderLeft: '4px solid var(--blue-600)',
      boxShadow: '0 4px 14px rgba(15,42,87,0.08)'
    }}>
      <div className="card-head" style={{ marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid var(--line)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`badge ${currentGradeInfo.badgeClass}`} style={{ fontWeight: 800, fontSize: '12px', padding: '4px 10px' }}>
              Grade {grade}
            </span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--navy-950)' }}>
              Rincian Vendor {currentGradeInfo.title}
            </h3>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--ink-600)' }}>
            {currentGradeInfo.desc} ({items.length} Vendor Ditemukan — Mode: {calcMode === 'vendor' ? 'Rata-Rata Per Vendor' : 'Per Evaluasi Event'})
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'var(--ice-100)',
            border: '1px solid var(--line)',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--ink-600)',
            fontWeight: 800,
            fontSize: '13px'
          }}
          title="Tutup Rincian"
        >
          ✕
        </button>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--ink-500)', fontSize: '13px' }}>
          Tidak ada vendor dalam <strong>Grade {grade}</strong> untuk filter saat ini.
        </div>
      ) : (
        <div style={{ maxHeight: '280px', overflowY: 'auto', overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: 'var(--surface-50)', textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Nama Vendor</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Kategori Jasa</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Wilayah</th>
                <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>Total Evaluasi</th>
                <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>Skor Rata-Rata</th>
                <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--navy-950)' }}>
                    {item.vendor}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--ink-700)', fontSize: '13px' }}>
                    {item.category}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--ink-700)', fontSize: '13px' }}>
                    {item.alamat}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, fontSize: '13px' }}>
                    {item.count} Event
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span className={`badge ${currentGradeInfo.badgeClass}`} style={{ fontWeight: 800, fontSize: '12px' }}>
                      {item.score}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    <button
                      onClick={() => onVendorClick && onVendorClick(item.vendor)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: '1px solid var(--navy-300)',
                        background: '#fff',
                        color: 'var(--navy-900)',
                        cursor: 'pointer'
                      }}
                    >
                      Lihat Profil ↗
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ChartsSection({
  filteredOverview,
  filteredTrend,
  filteredGeneral,
  filteredRepeat,
  filteredCategory,
  allEvaluations,
  selectedVendor,
  selectedCategory,
  overviewMode,
  setOverviewMode,
  donutCalcMode,
  setDonutCalcMode,
  onVendorClick,
  selectedGradeModal,
  onGradeClick
}) {
  const [catViewMode, setCatViewMode] = React.useState('top');
  const [locViewMode, setLocViewMode] = React.useState('top');
  const [repeatViewMode, setRepeatViewMode] = React.useState('top5');

  // 1. OVERVIEW CHART DATA
  const overviewMap = {};
  filteredOverview.forEach(d => {
    if (!overviewMap[d.vendor]) overviewMap[d.vendor] = { sum: 0, count: 0 };
    overviewMap[d.vendor].sum += Number(d.nilai);
    overviewMap[d.vendor].count += 1;
  });

  let overviewItems = Object.keys(overviewMap).map(v => ({
    vendor: v,
    score: parseFloat((overviewMap[v].sum / overviewMap[v].count).toFixed(1))
  })).sort((a, b) => b.score - a.score);

  let overviewDisplay = [];
  if (overviewMode === 'top10') {
    overviewDisplay = overviewItems.slice(0, 10);
  } else if (overviewMode === 'bottom10') {
    overviewDisplay = overviewItems.slice(-10);
  } else if (overviewMode === 'all') {
    overviewDisplay = overviewItems;
  } else {
    // Default: 'topbottom'
    if (overviewItems.length > 10) {
      const top5 = overviewItems.slice(0, 5);
      const bottom5 = overviewItems.slice(-5);
      overviewDisplay = [...top5, { vendor: '— (Top vs Bottom) —', score: null }, ...bottom5];
    } else {
      overviewDisplay = overviewItems;
    }
  }

  const isAllMode = overviewMode === 'all';
  const dynamicOverviewHeight = isAllMode ? Math.max(380, overviewDisplay.length * 28 + 30) : 340;

  const overviewData = {
    labels: overviewDisplay.map(i => i.vendor),
    datasets: [{
      data: overviewDisplay.map(i => i.score),
      backgroundColor: overviewDisplay.map(i => {
        if (i.score === null) return 'transparent';
        if (selectedVendor) {
          return i.vendor === selectedVendor ? NAVY : 'rgba(37, 99, 201, 0.25)';
        }
        return i.score >= 85 ? BLUE600 : i.score >= 70 ? SKY400 : i.score >= 55 ? FAIR : POOR;
      }),
      borderRadius: 4,
      barThickness: isAllMode ? 14 : 18
    }]
  };

  const overviewOptions = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ctx.raw !== null ? ` Skor Rata-rata: ${ctx.raw}` : ''
        }
      }
    },
    scales: {
      x: { grid: { color: ICE100 }, max: 100, ticks: { stepSize: 20 } },
      y: { grid: { display: false }, ticks: { font: { size: isAllMode ? 11 : 11.5, weight: 600 } } }
    },
    onClick: (evt, activeEls) => {
      if (activeEls.length > 0) {
        const idx = activeEls[0].index;
        const v = overviewDisplay[idx]?.vendor;
        if (v && !v.includes('Top vs Bottom') && onVendorClick) {
          onVendorClick(v);
        }
      }
    },
    onHover: (evt, activeEls) => {
      if (evt.native && evt.native.target) {
        evt.native.target.style.cursor = activeEls.length > 0 ? 'pointer' : 'default';
      }
    }
  };

  // 2. TREND CHART DATA
  const months = [
    'Januari 2026', 'Februari 2026', 'Maret 2026', 'April 2026',
    'Mei 2026', 'Juni 2026', 'Juli 2026', 'Agustus 2026',
    'September 2026', 'Oktober 2026', 'November 2026', 'Desember 2026'
  ];
  const monthShorts = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const trendScores = months.map(m => {
    const rows = filteredTrend.filter(d => d.bulan === m);
    if (rows.length === 0) return null;
    const sum = rows.reduce((acc, curr) => acc + Number(curr.nilai), 0);
    return parseFloat((sum / rows.length).toFixed(1));
  });

  const trendData = {
    labels: monthShorts,
    datasets: [{
      label: selectedVendor ? `Skor ${selectedVendor}` : 'Rata-Rata Seluruh Vendor',
      data: trendScores,
      borderColor: BLUE600,
      backgroundColor: 'rgba(37, 99, 201, 0.1)',
      fill: true,
      tension: 0.35,
      pointBackgroundColor: NAVY,
      pointRadius: 5,
      borderWidth: 2.5
    }]
  };

  const trendOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: selectedVendor ? true : false }
    },
    scales: {
      y: { min: 50, max: 100, grid: { color: ICE100 } },
      x: { grid: { display: false } }
    }
  };

  // 3. DONUT CHART DATA
  let excellent = 0, good = 0, fair = 0, poor = 0;
  if (donutCalcMode === 'row') {
    filteredGeneral.forEach(d => {
      if (d.huruf === 'A') excellent++;
      else if (d.huruf === 'B') good++;
      else if (d.huruf === 'C') fair++;
      else if (d.huruf === 'D') poor++;
      else {
        const v = Number(d.nilai);
        if (v >= 85) excellent++;
        else if (v >= 70) good++;
        else if (v >= 55) fair++;
        else poor++;
      }
    });
  } else {
    const map = {};
    filteredGeneral.forEach(d => {
      if (!map[d.vendor]) map[d.vendor] = { sum: 0, count: 0 };
      map[d.vendor].sum += Number(d.nilai);
      map[d.vendor].count++;
    });
    Object.keys(map).forEach(v => {
      const avg = map[v].sum / map[v].count;
      if (avg >= 85) excellent++;
      else if (avg >= 70) good++;
      else if (avg >= 55) fair++;
      else poor++;
    });
  }

  const donutTotalCount = donutCalcMode === 'row' 
    ? filteredGeneral.length 
    : Object.keys(overviewMap).length;

  const donutData = {
    labels: ['Grade A (≥85)', 'Grade B (70–84.99)', 'Grade C (55–69.99)', 'Grade D (<55)'],
    datasets: [{
      data: [excellent, good, fair, poor],
      backgroundColor: [NAVY, BLUE600, FAIR, POOR],
      borderWidth: 0,
      spacing: 3
    }]
  };

  const donutOptions = {
    cutout: '72%',
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 10, boxHeight: 10, padding: 12, font: { size: 11 } }
      }
    },
    onClick: (evt, activeEls, chart) => {
      let idx = -1;
      if (activeEls && activeEls.length > 0) {
        idx = activeEls[0].index;
      } else if (chart) {
        const elements = chart.getElementsAtEventForMode(evt.native || evt, 'nearest', { intersect: true }, true);
        if (elements.length > 0) idx = elements[0].index;
      }
      if (idx >= 0) {
        const grades = ['A', 'B', 'C', 'D'];
        const clickedGrade = grades[idx];
        if (clickedGrade && onGradeClick) {
          onGradeClick(clickedGrade);
        }
      }
    },
    onHover: (evt, activeEls) => {
      if (evt.native && evt.native.target) {
        evt.native.target.style.cursor = activeEls.length > 0 ? 'pointer' : 'default';
      }
    }
  };

  // 4. REPEAT VENDOR HERO CHART
  const repeatSourceData = selectedGradeModal 
    ? filteredRepeat.filter(d => d.huruf === selectedGradeModal) 
    : filteredRepeat;

  const repeatMap = {};
  repeatSourceData.forEach(d => {
    if (!repeatMap[d.vendor]) repeatMap[d.vendor] = [];
    repeatMap[d.vendor].push(d);
  });

  let allRepeatVendors = Object.keys(repeatMap)
    .filter(v => repeatMap[v].length > 1)
    .sort((a, b) => repeatMap[b].length - repeatMap[a].length);

  if (allRepeatVendors.length === 0) {
    allRepeatVendors = Object.keys(repeatMap)
      .sort((a, b) => repeatMap[b].length - repeatMap[a].length);
  }

  let activeRepeatVendors = [...allRepeatVendors];

  if (selectedVendor && repeatMap[selectedVendor]) {
    activeRepeatVendors = [selectedVendor];
  } else if (selectedCategory) {
    activeRepeatVendors = activeRepeatVendors.filter(v => repeatMap[v].some(d => d.category === selectedCategory));
  } else {
    if (repeatViewMode === 'top5') {
      activeRepeatVendors = activeRepeatVendors.slice(0, 5);
    } else if (repeatViewMode === 'top10') {
      activeRepeatVendors = activeRepeatVendors.slice(0, 10);
    }
  }

  const maxUsageLength = activeRepeatVendors.length > 0 
    ? Math.max(...activeRepeatVendors.map(v => repeatMap[v].length), 2)
    : 2;
  const xRepeatLabels = Array.from({ length: maxUsageLength }, (_, i) => `Pemakaian ${i + 1}`);

  const lineColors = [
    '#6FB1F0', '#2563C9', '#D69A25', '#E056FD', '#10AC84', '#FF9F43',
    '#54a0ff', '#5f27cd', '#ff6b6b', '#1dd1a1', '#fabca1', '#48dbfb'
  ];

  const repeatDatasets = activeRepeatVendors.map((v, idx) => ({
    label: v,
    data: repeatMap[v].map(e => Number(e.nilai)),
    borderColor: lineColors[idx % lineColors.length],
    backgroundColor: lineColors[idx % lineColors.length],
    tension: 0.3,
    borderWidth: 2.5,
    pointRadius: 4
  }));

  const repeatData = {
    labels: xRepeatLabels,
    datasets: repeatDatasets
  };

  const repeatOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 50, max: 100, grid: { color: 'rgba(255, 255, 255, 0.08)' }, ticks: { color: SKY200 } },
      x: { grid: { display: false }, ticks: { color: SKY200 } }
    }
  };

  // 5. CATEGORY BAR CHART (Horizontal layout)
  const catMap = {};
  filteredCategory.forEach(d => {
    if (!catMap[d.category]) catMap[d.category] = { sum: 0, count: 0 };
    catMap[d.category].sum += Number(d.nilai);
    catMap[d.category].count++;
  });

  const categories = Object.keys(catMap).map(c => ({
    category: c,
    score: parseFloat((catMap[c].sum / catMap[c].count).toFixed(1))
  })).sort((a, b) => b.score - a.score);

  const isCatAll = catViewMode === 'all';
  const displayCategories = isCatAll ? categories : categories.slice(0, 8);
  const catChartHeight = isCatAll ? Math.max(260, displayCategories.length * 28 + 30) : 260;

  const categoryData = {
    labels: displayCategories.map(c => c.category),
    datasets: [{
      data: displayCategories.map(c => c.score),
      backgroundColor: displayCategories.map(c => {
        if (selectedCategory && c.category === selectedCategory) return NAVY;
        return c.score >= 85 ? BLUE600 : c.score >= 70 ? SKY400 : c.score >= 55 ? FAIR : POOR;
      }),
      borderRadius: 4,
      barThickness: isCatAll ? 14 : 18
    }]
  };

  const categoryOptions = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` Rata-rata Skor: ${ctx.raw}`
        }
      }
    },
    scales: {
      x: { min: 0, max: 100, grid: { color: ICE100 } },
      y: { grid: { display: false }, ticks: { font: { size: 11.5, weight: 600 } } }
    }
  };

  // 6. LOCATION / CITY BAR CHART (Horizontal layout)
  const locMap = {};
  filteredGeneral.forEach(d => {
    const loc = d.alamat || 'Lainnya';
    if (!locMap[loc]) locMap[loc] = { sum: 0, count: 0 };
    locMap[loc].sum += Number(d.nilai);
    locMap[loc].count++;
  });

  const locations = Object.keys(locMap).map(l => ({
    location: l,
    score: parseFloat((locMap[l].sum / locMap[l].count).toFixed(1)),
    count: locMap[l].count
  })).sort((a, b) => b.count - a.count);

  const isLocAll = locViewMode === 'all';
  const displayLocations = isLocAll ? locations : locations.slice(0, 8);
  const locChartHeight = isLocAll ? Math.max(260, displayLocations.length * 28 + 30) : 260;

  const locationData = {
    labels: displayLocations.map(l => l.location),
    datasets: [{
      label: 'Rata-rata Skor',
      data: displayLocations.map(l => l.score),
      backgroundColor: displayLocations.map(l => {
        return l.score >= 85 ? BLUE600 : l.score >= 70 ? SKY400 : l.score >= 55 ? FAIR : POOR;
      }),
      borderRadius: 4,
      barThickness: isLocAll ? 14 : 18
    }]
  };

  const locationOptions = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` Rata-rata Skor: ${ctx.raw}`
        }
      }
    },
    scales: {
      x: { min: 0, max: 100, grid: { color: ICE100 } },
      y: { grid: { display: false }, ticks: { font: { size: 11.5, weight: 600 } } }
    }
  };

  return (
    <div className="charts-section-grid">
      {/* 1. OVERVIEW */}
      <div className="card" id="chart-card-overview">
        <div className="card-head">
          <div>
            <h2>Ringkasan Performa Vendor</h2>
            <p>Perbandingan skor rata-rata vendor pada periode/filter aktif. (Klik batang grafik untuk melihat profil vendor)</p>
          </div>
          <div className="card-controls" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              className={`btn-toggle ${overviewMode === 'topbottom' ? 'active' : ''}`}
              onClick={() => setOverviewMode('topbottom')}
            >
              Top 5 &amp; Bottom 5
            </button>
            <button
              className={`btn-toggle ${overviewMode === 'top10' ? 'active' : ''}`}
              onClick={() => setOverviewMode('top10')}
            >
              Top 10 Vendor
            </button>
            <button
              className={`btn-toggle ${overviewMode === 'bottom10' ? 'active' : ''}`}
              onClick={() => setOverviewMode('bottom10')}
            >
              Bottom 10 Vendor
            </button>
            <button
              className={`btn-toggle ${overviewMode === 'all' ? 'active' : ''}`}
              onClick={() => setOverviewMode('all')}
            >
              Semua Vendor ({overviewItems.length})
            </button>
          </div>
        </div>
        <div style={{
          maxHeight: isAllMode ? '520px' : 'none',
          overflowY: isAllMode ? 'auto' : 'visible',
          paddingRight: isAllMode ? '6px' : '0'
        }}>
          <div style={{ height: `${dynamicOverviewHeight}px`, position: 'relative', width: '100%' }}>
            <Bar data={overviewData} options={overviewOptions} redraw={true} />
          </div>
        </div>
      </div>

      {/* 2 COLUMN GRID */}
      <div className="two-col">
        <div className="card" id="chart-card-trend">
          <div className="card-head">
            <div>
              <h2>Tren Performa Bulanan</h2>
              <p>Grafik perkembangan rata-rata skor evaluasi vendor per bulan.</p>
            </div>
          </div>
          <div className="chart-wrap chart-mid">
            <Line data={trendData} options={trendOptions} redraw={true} />
          </div>
        </div>

        <div className="card" id="chart-card-donut">
          <div className="card-head">
            <div>
              <h2>Distribusi Predikat Evaluasi</h2>
              <p>Sebaran skor evaluasi ke dalam kelompok predikat kualitas (Grade A, B, C, D).</p>
            </div>
            <button
              className="btn-toggle"
              onClick={() => setDonutCalcMode(donutCalcMode === 'row' ? 'vendor' : 'row')}
            >
              {donutCalcMode === 'row' ? 'Per Evaluasi' : 'Per Vendor'}
            </button>
          </div>
          <div className="chart-wrap chart-mid" style={{ position: 'relative' }}>
            <Doughnut data={donutData} options={donutOptions} redraw={true} />
            <div
              onClick={() => onGradeClick && onGradeClick('A')}
              style={{
                position: 'absolute',
                top: '38%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                cursor: 'pointer'
              }}
              title="Klik untuk melihat rincian Grade vendor"
            >
              <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--navy-950)', lineHeight: 1 }}>
                {donutTotalCount}
              </div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-500)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {donutCalcMode === 'row' ? 'Evaluasi' : 'Vendor'}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Full Width Inline Vendor Details Panel Directly Under Donut & Trend Row */}
      <InlineGradeVendorDetails
        grade={selectedGradeModal}
        evaluations={filteredGeneral}
        calcMode={donutCalcMode}
        onClose={() => onGradeClick && onGradeClick(null)}
        onVendorClick={onVendorClick}
      />

      {/* 4. HERO REPEAT VENDOR */}
      <div className="hero-section" id="chart-card-repeat">
        <div className="card-head">
          <div>
            <h2>Performa Vendor Berulang (Repeat Order)</h2>
            <p>Konsistensi skor vendor yang digunakan lebih dari 1 kali ({allRepeatVendors.length} Repeat Vendor Terdeteksi).</p>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              className={`btn-toggle ${repeatViewMode === 'top5' ? 'active' : ''}`}
              onClick={() => setRepeatViewMode('top5')}
            >
              Top 5 Sering
            </button>
            <button
              className={`btn-toggle ${repeatViewMode === 'top10' ? 'active' : ''}`}
              onClick={() => setRepeatViewMode('top10')}
            >
              Top 10 Sering
            </button>
            <button
              className={`btn-toggle ${repeatViewMode === 'all' ? 'active' : ''}`}
              onClick={() => setRepeatViewMode('all')}
            >
              Semua ({allRepeatVendors.length})
            </button>
          </div>
        </div>
        <div className="chart-wrap chart-tall">
          <Line data={repeatData} options={repeatOptions} redraw={true} />
        </div>
        <div className="legend-row" style={{ flexWrap: 'wrap', gap: '8px' }}>
          {repeatDatasets.map((d, i) => (
            <span
              key={i}
              onClick={() => onVendorClick && onVendorClick(d.label)}
              style={{
                cursor: 'pointer',
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.08)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
              title={`Klik untuk melihat profil ${d.label}`}
            >
              <span className="legend-dot" style={{ background: d.borderColor }}></span>
              {d.label} ({repeatMap[d.label]?.length || 0}x)
            </span>
          ))}
        </div>
      </div>

      {/* 2 COLUMN GRID FOR CATEGORY & LOCATION */}
      <div className="two-col">
        <div className="card" id="chart-card-category">
          <div className="card-head">
            <div>
              <h2>Performa Berdasarkan Kategori Vendor</h2>
              <p>Skor rata-rata dikelompokkan berdasarkan kategori jasa.</p>
            </div>
            <button
              className="btn-toggle"
              onClick={() => setCatViewMode(catViewMode === 'top' ? 'all' : 'top')}
            >
              {catViewMode === 'top' ? `Lihat Semua (${categories.length})` : 'Top 8 Kategori'}
            </button>
          </div>
          <div style={{
            maxHeight: isCatAll ? '360px' : 'none',
            overflowY: isCatAll ? 'auto' : 'visible',
            paddingRight: isCatAll ? '4px' : '0'
          }}>
            <div style={{ height: `${catChartHeight}px`, position: 'relative', width: '100%' }}>
              <Bar data={categoryData} options={categoryOptions} redraw={true} />
            </div>
          </div>
        </div>

        <div className="card" id="chart-card-location">
          <div className="card-head">
            <div>
              <h2>Performa Berdasarkan Wilayah / Kota</h2>
              <p>Rata-rata skor evaluasi vendor berdasarkan wilayah kota.</p>
            </div>
            <button
              className="btn-toggle"
              onClick={() => setLocViewMode(locViewMode === 'top' ? 'all' : 'top')}
            >
              {locViewMode === 'top' ? `Lihat Semua (${locations.length})` : 'Top 8 Lokasi'}
            </button>
          </div>
          <div style={{
            maxHeight: isLocAll ? '360px' : 'none',
            overflowY: isLocAll ? 'auto' : 'visible',
            paddingRight: isLocAll ? '4px' : '0'
          }}>
            <div style={{ height: `${locChartHeight}px`, position: 'relative', width: '100%' }}>
              <Bar data={locationData} options={locationOptions} redraw={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
