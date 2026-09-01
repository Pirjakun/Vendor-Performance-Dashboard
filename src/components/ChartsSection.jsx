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
  onVendorClick
}) {
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
  if (overviewMode === 'topbottom' && overviewItems.length > 10) {
    const top5 = overviewItems.slice(0, 5);
    const bottom5 = overviewItems.slice(-5);
    overviewDisplay = [...top5, { vendor: '— (Top vs Bottom) —', score: null }, ...bottom5];
  } else {
    overviewDisplay = overviewItems;
  }

  const overviewData = {
    labels: overviewDisplay.map(i => i.vendor),
    datasets: [{
      data: overviewDisplay.map(i => i.score),
      backgroundColor: overviewDisplay.map(i => {
        if (i.score === null) return 'transparent';
        if (selectedVendor) {
          return i.vendor === selectedVendor ? NAVY : 'rgba(37, 99, 201, 0.25)';
        }
        return i.score >= 80 ? BLUE600 : POOR;
      }),
      borderRadius: 6,
      barThickness: 16
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
      y: { grid: { display: false }, ticks: { font: { size: 11.5, weight: 600 } } }
    },
    onClick: (evt, activeEls) => {
      if (activeEls.length > 0) {
        const idx = activeEls[0].index;
        const v = overviewDisplay[idx]?.vendor;
        if (v && !v.includes('Top vs Bottom')) {
          onVendorClick(v);
        }
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
    }
  };

  // 4. REPEAT VENDOR HERO CHART
  const repeatMap = {};
  allEvaluations.forEach(d => {
    if (!repeatMap[d.vendor]) repeatMap[d.vendor] = [];
    repeatMap[d.vendor].push(d);
  });

  let repeatVendors = Object.keys(repeatMap).filter(v => repeatMap[v].length > 1);

  if (selectedVendor && repeatMap[selectedVendor]) {
    repeatVendors = [selectedVendor];
  } else if (selectedCategory) {
    repeatVendors = repeatVendors.filter(v => repeatMap[v].some(d => d.category === selectedCategory));
  }

  if (!selectedVendor && repeatVendors.length > 6) {
    repeatVendors = repeatVendors.slice(0, 6);
  }

  const maxUsageLength = Math.max(...repeatVendors.map(v => repeatMap[v].length), 2);
  const xRepeatLabels = Array.from({ length: maxUsageLength }, (_, i) => `Pemakaian ${i + 1}`);

  const lineColors = [NAVY, SKY400, FAIR, '#2563C9', '#E056FD', '#10AC84', '#FF9F43'];

  const repeatDatasets = repeatVendors.map((v, idx) => ({
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

  // 5. CATEGORY BAR CHART
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

  const categoryData = {
    labels: categories.map(c => c.category),
    datasets: [{
      data: categories.map(c => c.score),
      backgroundColor: categories.map(c => {
        if (selectedCategory) {
          return c.category === selectedCategory ? NAVY : 'rgba(37, 99, 201, 0.25)';
        }
        return BLUE600;
      }),
      borderRadius: 6,
      barThickness: 26
    }]
  };

  const categoryOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 100, grid: { color: ICE100 } },
      x: { grid: { display: false }, ticks: { font: { size: 11, weight: 600 } } }
    }
  };

  // 6. LOCATION / CITY BAR CHART
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

  const locationData = {
    labels: locations.map(l => l.location),
    datasets: [{
      label: 'Rata-rata Skor',
      data: locations.map(l => l.score),
      backgroundColor: SKY400,
      borderRadius: 6,
      barThickness: 24
    }]
  };

  const locationOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 100, grid: { color: ICE100 } },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="charts-section-grid">
      {/* 1. OVERVIEW */}
      <div className="card">
        <div className="card-head">
          <div>
            <h2>Vendor Performance Overview</h2>
            <p>Perbandingan skor rata-rata vendor pada periode/filter aktif. (Klik bar untuk melihat profil vendor)</p>
          </div>
          <div className="card-controls">
            <button
              className={`btn-toggle ${overviewMode === 'topbottom' ? 'active' : ''}`}
              onClick={() => setOverviewMode(overviewMode === 'topbottom' ? 'all' : 'topbottom')}
            >
              {overviewMode === 'topbottom' ? 'Top 5 & Bottom 5' : 'Lihat Semua Vendor'}
            </button>
          </div>
        </div>
        <div className="chart-wrap chart-tall">
          <Bar data={overviewData} options={overviewOptions} redraw={true} />
        </div>
      </div>

      {/* 2 COLUMN GRID */}
      <div className="two-col">
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Performance Trend</h2>
              <p>Tren rata-rata skor bulanan (Januari – Juni). Selalu konsisten 6 bulan.</p>
            </div>
          </div>
          <div className="chart-wrap chart-mid">
            <Line data={trendData} options={trendOptions} redraw={true} />
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h2>Performance Distribution</h2>
              <p>Sebaran skor evaluasi ke dalam kelompok predikat kualitas.</p>
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
            <div style={{
              position: 'absolute',
              top: '41%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
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

      {/* 4. HERO REPEAT VENDOR */}
      <div className="hero-section">
        <div className="card-head">
          <div>
            <h2>Repeat Vendor Performance ⭐</h2>
            <p>Konsistensi skor vendor yang digunakan lebih dari 1 kali sepanjang histori database.</p>
          </div>
          <span className="tag">Histori Penuh</span>
        </div>
        <div className="chart-wrap chart-tall">
          <Line data={repeatData} options={repeatOptions} redraw={true} />
        </div>
        <div className="legend-row">
          {repeatDatasets.map((d, i) => (
            <span key={i}>
              <span className="legend-dot" style={{ background: d.borderColor }}></span>
              {d.label}
            </span>
          ))}
        </div>
      </div>

      {/* 2 COLUMN GRID FOR CATEGORY & LOCATION */}
      <div className="two-col">
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Performance by Vendor Category</h2>
              <p>Skor rata-rata dikelompokkan berdasarkan kategori jasa.</p>
            </div>
          </div>
          <div className="chart-wrap chart-short">
            <Bar data={categoryData} options={categoryOptions} redraw={true} />
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h2>Performance by Location / City</h2>
              <p>Rata-rata skor evaluasi vendor berdasarkan wilayah kota.</p>
            </div>
          </div>
          <div className="chart-wrap chart-short">
            <Bar data={locationData} options={locationOptions} redraw={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
