// Vendor Performance Monitoring — Interactive Engine (Werkudara Group)
document.addEventListener('DOMContentLoaded', () => {
  const rawData = window.EVALUATION_DATA || [];

  // Global State
  const state = {
    filters: {
      bulan: '',
      vendor: '',
      event: '',
      category: ''
    },
    overviewMode: 'topbottom', // 'topbottom' | 'all'
    donutCalcMode: 'row', // 'row' | 'vendor'
    searchQuery: '',
    sortCol: 'id',
    sortDir: 'asc',
    currentPage: 1,
    pageSize: 10
  };

  // Chart Instances Reference
  let overviewChart = null;
  let trendChart = null;
  let donutChart = null;
  let repeatChart = null;
  let categoryChart = null;

  // DOM Elements
  const elBulan = document.getElementById('filterBulan');
  const elVendor = document.getElementById('filterVendor');
  const elEvent = document.getElementById('filterEvent');
  const elKategori = document.getElementById('filterKategori');
  const elResetBtn = document.getElementById('btnResetFilters');
  const elActiveFiltersBar = document.getElementById('activeFiltersBar');

  const elKpiVendor = document.getElementById('kpiTotalVendor');
  const elKpiEvent = document.getElementById('kpiTotalEvent');
  const elKpiAvgScore = document.getElementById('kpiAvgScore');
  const elKpiAvgBadge = document.getElementById('kpiAvgBadge');

  const elOverviewModeBtn = document.getElementById('btnOverviewMode');
  const elDonutCalcBtn = document.getElementById('btnDonutCalcMode');

  const elSearchInput = document.getElementById('inputSearch');
  const elTableBody = document.getElementById('tableBody');
  const elTableCount = document.getElementById('tableRecordCount');
  const elPageInfo = document.getElementById('pageInfo');
  const elPageNumbers = document.getElementById('pageNumbers');
  const elBtnPrev = document.getElementById('btnPrevPage');
  const elBtnNext = document.getElementById('btnNextPage');
  const elBtnExport = document.getElementById('btnExportCSV');

  // Modal Elements
  const elModal = document.getElementById('vendorModal');
  const elBtnCloseModal = document.getElementById('btnCloseModal');
  const elModalVendorName = document.getElementById('modalVendorName');
  const elModalVendorCategory = document.getElementById('modalVendorCategory');
  const elModalScore = document.getElementById('modalStatScore');
  const elModalCount = document.getElementById('modalStatCount');
  const elModalGrade = document.getElementById('modalStatGrade');
  const elModalHistoryList = document.getElementById('modalHistoryList');

  // Colors Palette
  const NAVY = '#0F2A57';
  const BLUE600 = '#2563C9';
  const BLUE500 = '#3B82E0';
  const SKY400 = '#6FB1F0';
  const SKY200 = '#C9E2FA';
  const ICE100 = '#EEF4FC';
  const GOOD = '#1E9E6B';
  const FAIR = '#D69A25';
  const POOR = '#D0552F';

  // 1. INITIALIZATION & POPULATE DROPDOWNS
  function initFilters() {
    const bulanSet = new Set();
    const vendorSet = new Set();
    const eventSet = new Set();
    const catSet = new Set();

    rawData.forEach(d => {
      if (d.bulan) bulanSet.add(d.bulan);
      if (d.vendor) vendorSet.add(d.vendor);
      if (d.event) eventSet.add(d.event);
      if (d.category) catSet.add(d.category);
    });

    const monthsOrder = ['Januari 2026', 'Februari 2026', 'Maret 2026', 'April 2026', 'Mei 2026', 'Juni 2026'];
    const sortedMonths = Array.from(bulanSet).sort((a, b) => {
      const idxA = monthsOrder.indexOf(a);
      const idxB = monthsOrder.indexOf(b);
      return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
    });

    sortedMonths.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      elBulan.appendChild(opt);
    });

    Array.from(vendorSet).sort().forEach(v => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      elVendor.appendChild(opt);
    });

    Array.from(eventSet).sort().forEach(e => {
      const opt = document.createElement('option');
      opt.value = e;
      opt.textContent = e;
      elEvent.appendChild(opt);
    });

    Array.from(catSet).sort().forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      elKategori.appendChild(opt);
    });

    // Event listeners for selects
    elBulan.addEventListener('change', (e) => { state.filters.bulan = e.target.value; state.currentPage = 1; updateDashboard(); });
    elVendor.addEventListener('change', (e) => { state.filters.vendor = e.target.value; state.currentPage = 1; updateDashboard(); });
    elEvent.addEventListener('change', (e) => { state.filters.event = e.target.value; state.currentPage = 1; updateDashboard(); });
    elKategori.addEventListener('change', (e) => { state.filters.category = e.target.value; state.currentPage = 1; updateDashboard(); });

    elResetBtn.addEventListener('click', resetFilters);
    elOverviewModeBtn.addEventListener('click', toggleOverviewMode);
    elDonutCalcBtn.addEventListener('click', toggleDonutCalcMode);

    elSearchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase();
      state.currentPage = 1;
      updateTable();
    });

    // Sorting Table Columns
    document.querySelectorAll('table.data-table th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.getAttribute('data-sort');
        if (state.sortCol === col) {
          state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortCol = col;
          state.sortDir = 'asc';
        }
        updateTable();
      });
    });

    // Pagination
    elBtnPrev.addEventListener('click', () => { if (state.currentPage > 1) { state.currentPage--; updateTable(); } });
    elBtnNext.addEventListener('click', () => { state.currentPage++; updateTable(); });

    // Export CSV
    elBtnExport.addEventListener('click', exportTableToCSV);

    // Modal Close
    elBtnCloseModal.addEventListener('click', closeModal);
    elModal.addEventListener('click', (e) => { if (e.target === elModal) closeModal(); });
  }

  function resetFilters() {
    state.filters.bulan = '';
    state.filters.vendor = '';
    state.filters.event = '';
    state.filters.category = '';
    state.searchQuery = '';

    elBulan.value = '';
    elVendor.value = '';
    elEvent.value = '';
    elKategori.value = '';
    elSearchInput.value = '';

    state.currentPage = 1;
    updateDashboard();
  }

  function toggleOverviewMode() {
    state.overviewMode = state.overviewMode === 'topbottom' ? 'all' : 'topbottom';
    elOverviewModeBtn.textContent = state.overviewMode === 'topbottom' ? 'Top 5 & Bottom 5' : 'Lihat Semua Vendor';
    elOverviewModeBtn.classList.toggle('active', state.overviewMode === 'topbottom');
    renderOverviewChart();
  }

  function toggleDonutCalcMode() {
    state.donutCalcMode = state.donutCalcMode === 'row' ? 'vendor' : 'row';
    elDonutCalcBtn.textContent = state.donutCalcMode === 'row' ? 'Per Baris Evaluasi' : 'Per Rata-rata Vendor';
    renderDonutChart();
  }

  function renderActiveFilterPills() {
    elActiveFiltersBar.innerHTML = '';
    const keys = Object.keys(state.filters);
    let activeCount = 0;

    keys.forEach(k => {
      const val = state.filters[k];
      if (val) {
        activeCount++;
        const pill = document.createElement('div');
        pill.className = 'filter-pill';
        pill.innerHTML = `<span>${k.toUpperCase()}: <strong>${val}</strong></span> <button data-key="${k}">&times;</button>`;
        pill.querySelector('button').addEventListener('click', () => {
          state.filters[k] = '';
          document.getElementById('filter' + k.charAt(0).toUpperCase() + k.slice(1)).value = '';
          state.currentPage = 1;
          updateDashboard();
        });
        elActiveFiltersBar.appendChild(pill);
      }
    });
  }

  // 2. DATA FILTERING LOGIC PER RULE
  function getFilteredDataGeneral() {
    return rawData.filter(d => {
      if (state.filters.bulan && d.bulan !== state.filters.bulan) return false;
      if (state.filters.vendor && d.vendor !== state.filters.vendor) return false;
      if (state.filters.event && d.event !== state.filters.event) return false;
      if (state.filters.category && d.category !== state.filters.category) return false;
      return true;
    });
  }

  // Rule Brief 4: Overview Chart ignores Vendor filter for filtering out rows (highlights only)
  function getFilteredDataOverview() {
    return rawData.filter(d => {
      if (state.filters.bulan && d.bulan !== state.filters.bulan) return false;
      if (state.filters.event && d.event !== state.filters.event) return false;
      if (state.filters.category && d.category !== state.filters.category) return false;
      return true;
    });
  }

  // Rule Brief 4.b: Performance Trend IGNORES Bulan filter
  function getFilteredDataTrend() {
    return rawData.filter(d => {
      if (state.filters.vendor && d.vendor !== state.filters.vendor) return false;
      if (state.filters.event && d.event !== state.filters.event) return false;
      if (state.filters.category && d.category !== state.filters.category) return false;
      return true;
    });
  }

  // Rule Brief 4.c: Repeat Vendor IGNORES Bulan and Event filter (calculated from FULL DB)
  function getFilteredDataRepeat() {
    return rawData.filter(d => {
      if (state.filters.vendor && d.vendor !== state.filters.vendor) return false;
      if (state.filters.category && d.category !== state.filters.category) return false;
      return true;
    });
  }

  // Rule Brief 4.a: Category Chart IGNORES Category filter for filtering out rows (highlights only)
  function getFilteredDataCategory() {
    return rawData.filter(d => {
      if (state.filters.bulan && d.bulan !== state.filters.bulan) return false;
      if (state.filters.vendor && d.vendor !== state.filters.vendor) return false;
      if (state.filters.event && d.event !== state.filters.event) return false;
      return true;
    });
  }

  // 3. MAIN DASHBOARD UPDATE
  function updateDashboard() {
    renderActiveFilterPills();
    updateKPICards();
    renderOverviewChart();
    renderTrendChart();
    renderDonutChart();
    renderRepeatChart();
    renderCategoryChart();
    updateTable();
  }

  // 4. KPI CARDS
  function updateKPICards() {
    const data = getFilteredDataGeneral();
    const vendorSet = new Set(data.map(d => d.vendor));
    const eventSet = new Set(data.map(d => d.event));

    const totalVendors = vendorSet.size;
    const totalEvents = eventSet.size;

    let avgScore = 0;
    if (data.length > 0) {
      const sum = data.reduce((acc, curr) => acc + curr.nilai, 0);
      avgScore = (sum / data.length).toFixed(1);
    }

    elKpiVendor.textContent = totalVendors;
    elKpiEvent.textContent = totalEvents;
    elKpiAvgScore.textContent = avgScore > 0 ? avgScore : '0.0';

    if (avgScore >= 85) {
      elKpiAvgBadge.textContent = 'Excellent / Sangat Baik';
      elKpiAvgBadge.className = 'kpi-badge good';
    } else if (avgScore >= 75) {
      elKpiAvgBadge.textContent = 'Good / Baik';
      elKpiAvgBadge.className = 'kpi-badge good';
    } else if (avgScore >= 65) {
      elKpiAvgBadge.textContent = 'Fair / Cukup';
      elKpiAvgBadge.className = 'kpi-badge fair';
    } else if (avgScore > 0) {
      elKpiAvgBadge.textContent = 'Poor / Perlu Evaluasi';
      elKpiAvgBadge.className = 'kpi-badge poor';
    } else {
      elKpiAvgBadge.textContent = 'Tidak Ada Data';
      elKpiAvgBadge.className = 'kpi-badge fair';
    }
  }

  // 5. CHART 1: VENDOR PERFORMANCE OVERVIEW
  function renderOverviewChart() {
    const data = getFilteredDataOverview();

    // Group by Vendor
    const map = {};
    data.forEach(d => {
      if (!map[d.vendor]) map[d.vendor] = { sum: 0, count: 0 };
      map[d.vendor].sum += d.nilai;
      map[d.vendor].count += 1;
    });

    let items = Object.keys(map).map(v => ({
      vendor: v,
      score: parseFloat((map[v].sum / map[v].count).toFixed(1))
    }));

    items.sort((a, b) => b.score - a.score);

    let displayItems = [];
    if (state.overviewMode === 'topbottom' && items.length > 10) {
      const top5 = items.slice(0, 5);
      const bottom5 = items.slice(-5);
      displayItems = [...top5, { vendor: '— (Pemisah Top & Bottom) —', score: null }, ...bottom5];
    } else {
      displayItems = items;
    }

    const labels = displayItems.map(i => i.vendor);
    const scores = displayItems.map(i => i.score);
    const selectedVendor = state.filters.vendor;

    const bgColors = displayItems.map(i => {
      if (i.score === null) return 'transparent';
      if (selectedVendor) {
        return i.vendor === selectedVendor ? NAVY : 'rgba(37, 99, 201, 0.25)';
      }
      return i.score >= 80 ? BLUE600 : POOR;
    });

    const ctx = document.getElementById('overviewChart').getContext('2d');
    if (overviewChart) overviewChart.destroy();

    overviewChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: scores,
          backgroundColor: bgColors,
          borderRadius: 6,
          barThickness: 16
        }]
      },
      options: {
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
            const index = activeEls[0].index;
            const vendorName = labels[index];
            if (vendorName && !vendorName.includes('Pemisah')) {
              openVendorModal(vendorName);
            }
          }
        }
      }
    });
  }

  // 6. CHART 2: PERFORMANCE TREND (Jan - Jun)
  function renderTrendChart() {
    const data = getFilteredDataTrend();
    const months = ['Januari 2026', 'Februari 2026', 'Maret 2026', 'April 2026', 'Mei 2026', 'Juni 2026'];
    const monthShorts = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];

    const monthScores = months.map(m => {
      const rows = data.filter(d => d.bulan === m);
      if (rows.length === 0) return null;
      const sum = rows.reduce((acc, curr) => acc + curr.nilai, 0);
      return parseFloat((sum / rows.length).toFixed(1));
    });

    const ctx = document.getElementById('trendChart').getContext('2d');
    if (trendChart) trendChart.destroy();

    trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: monthShorts,
        datasets: [{
          label: state.filters.vendor ? `Skor ${state.filters.vendor}` : 'Rata-Rata Seluruh Vendor',
          data: monthScores,
          borderColor: BLUE600,
          backgroundColor: 'rgba(37, 99, 201, 0.1)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: NAVY,
          pointRadius: 5,
          borderWidth: 2.5
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { display: state.filters.vendor ? true : false }
        },
        scales: {
          y: { min: 50, max: 100, grid: { color: ICE100 } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // 7. CHART 3: PERFORMANCE DISTRIBUTION (Donut Chart)
  function renderDonutChart() {
    const data = getFilteredDataGeneral();
    let excellent = 0, good = 0, fair = 0, poor = 0;

    if (state.donutCalcMode === 'row') {
      data.forEach(d => {
        if (d.nilai >= 90) excellent++;
        else if (d.nilai >= 80) good++;
        else if (d.nilai >= 70) fair++;
        else poor++;
      });
    } else {
      // Per vendor average score
      const map = {};
      data.forEach(d => {
        if (!map[d.vendor]) map[d.vendor] = { sum: 0, count: 0 };
        map[d.vendor].sum += d.nilai;
        map[d.vendor].count++;
      });
      Object.keys(map).forEach(v => {
        const avg = map[v].sum / map[v].count;
        if (avg >= 90) excellent++;
        else if (avg >= 80) good++;
        else if (avg >= 70) fair++;
        else poor++;
      });
    }

    const ctx = document.getElementById('donutChart').getContext('2d');
    if (donutChart) donutChart.destroy();

    donutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Excellent (90–100)', 'Good (80–89)', 'Fair (70–79)', 'Poor (<70)'],
        datasets: [{
          data: [excellent, good, fair, poor],
          backgroundColor: [NAVY, BLUE600, FAIR, POOR],
          borderWidth: 0,
          spacing: 3
        }]
      },
      options: {
        cutout: '68%',
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 10, boxHeight: 10, padding: 12, font: { size: 11 } }
          }
        }
      }
    });
  }

  // 8. CHART 4: REPEAT VENDOR PERFORMANCE (Hero Chart)
  function renderRepeatChart() {
    const data = getFilteredDataRepeat();

    // Group by vendor across full dataset history
    const map = {};
    rawData.forEach(d => {
      if (!map[d.vendor]) map[d.vendor] = [];
      map[d.vendor].push(d);
    });

    // Filter vendors that are used > 1 time
    let repeatVendors = Object.keys(map).filter(v => map[v].length > 1);

    // If a vendor filter is selected, prioritize that vendor
    if (state.filters.vendor && map[state.filters.vendor]) {
      repeatVendors = [state.filters.vendor];
    } else if (state.filters.category) {
      repeatVendors = repeatVendors.filter(v => map[v].some(d => d.category === state.filters.category));
    }

    // Limit display to top 6 repeat vendors to keep chart clean if no vendor selected
    if (!state.filters.vendor && repeatVendors.length > 6) {
      repeatVendors = repeatVendors.slice(0, 6);
    }

    const maxUsageLength = Math.max(...repeatVendors.map(v => map[v].length), 2);
    const xLabels = Array.from({ length: maxUsageLength }, (_, i) => `Pemakaian ${i + 1}`);

    const colors = [NAVY, SKY400, FAIR, '#2563C9', '#E056FD', '#10AC84', '#FF9F43'];

    const datasets = repeatVendors.map((v, idx) => {
      const vendorEvaluations = map[v];
      const scores = vendorEvaluations.map(e => e.nilai);
      const color = colors[idx % colors.length];

      return {
        label: v,
        data: scores,
        borderColor: color,
        backgroundColor: color,
        tension: 0.3,
        borderWidth: 2.5,
        pointRadius: 4
      };
    });

    const ctx = document.getElementById('repeatChart').getContext('2d');
    if (repeatChart) repeatChart.destroy();

    repeatChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: xLabels,
        datasets: datasets
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { min: 50, max: 100, grid: { color: 'rgba(255, 255, 255, 0.08)' }, ticks: { color: SKY200 } },
          x: { grid: { display: false }, ticks: { color: SKY200 } }
        }
      }
    });

    // Custom Legend Render
    const elLegend = document.getElementById('repeatLegend');
    elLegend.innerHTML = datasets.map((d, i) => `
      <span onclick="toggleRepeatDataset(${i})">
        <span class="legend-dot" style="background:${d.borderColor}"></span>
        ${d.label}
      </span>
    `).join('');
  }

  window.toggleRepeatDataset = function(index) {
    if (repeatChart) {
      const meta = repeatChart.getDatasetMeta(index);
      meta.hidden = meta.hidden === null ? !repeatChart.data.datasets[index].hidden : null;
      repeatChart.update();
    }
  };

  // 9. CHART 5: PERFORMANCE BY VENDOR CATEGORY
  function renderCategoryChart() {
    const data = getFilteredDataCategory();

    const map = {};
    data.forEach(d => {
      if (!map[d.category]) map[d.category] = { sum: 0, count: 0 };
      map[d.category].sum += d.nilai;
      map[d.category].count += 1;
    });

    const categories = Object.keys(map).map(c => ({
      category: c,
      score: parseFloat((map[c].sum / map[c].count).toFixed(1))
    })).sort((a, b) => b.score - a.score);

    const labels = categories.map(c => c.category);
    const scores = categories.map(c => c.score);
    const selectedCat = state.filters.category;

    const bgColors = categories.map(c => {
      if (selectedCat) {
        return c.category === selectedCat ? NAVY : 'rgba(37, 99, 201, 0.25)';
      }
      return BLUE600;
    });

    const ctx = document.getElementById('categoryChart').getContext('2d');
    if (categoryChart) categoryChart.destroy();

    categoryChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: scores,
          backgroundColor: bgColors,
          borderRadius: 6,
          barThickness: 28
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { min: 0, max: 100, grid: { color: ICE100 } },
          x: { grid: { display: false }, ticks: { font: { size: 11, weight: 600 } } }
        }
      }
    });
  }

  // 10. RAW DATA TABLE & PAGINATION
  function updateTable() {
    let data = getFilteredDataGeneral();

    // Search query filter
    if (state.searchQuery) {
      const q = state.searchQuery;
      data = data.filter(d =>
        d.vendor.toLowerCase().includes(q) ||
        d.event.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.alamat.toLowerCase().includes(q) ||
        d.rekomendasi.toLowerCase().includes(q)
      );
    }

    // Sorting
    data.sort((a, b) => {
      let valA = a[state.sortCol];
      let valB = b[state.sortCol];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return state.sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return state.sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    elTableCount.textContent = `${data.length} record ditemukan`;

    // Pagination Calculation
    const totalPages = Math.ceil(data.length / state.pageSize) || 1;
    if (state.currentPage > totalPages) state.currentPage = totalPages;

    const startIdx = (state.currentPage - 1) * state.pageSize;
    const endIdx = startIdx + state.pageSize;
    const pageData = data.slice(startIdx, endIdx);

    // Render Table Body
    elTableBody.innerHTML = '';
    if (pageData.length === 0) {
      elTableBody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 24px; color: var(--ink-400);">Tidak ada data evaluasi yang sesuai filter / pencarian.</td></tr>`;
    } else {
      pageData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${row.eventNo}</strong></td>
          <td>${row.event}</td>
          <td>${row.bulan}</td>
          <td><strong style="color: var(--blue-700);">${row.vendor}</strong></td>
          <td>${row.category}</td>
          <td>${row.alamat}</td>
          <td><strong>${row.nilai.toFixed(2)}</strong></td>
          <td><span class="badge-score grade-${row.huruf}">${row.huruf}</span></td>
          <td>${row.rekomendasi}</td>
        `;
        tr.addEventListener('click', () => openVendorModal(row.vendor));
        elTableBody.appendChild(tr);
      });
    }

    // Pagination info & buttons
    const displayStart = data.length > 0 ? startIdx + 1 : 0;
    const displayEnd = Math.min(endIdx, data.length);
    elPageInfo.textContent = `Menampilkan ${displayStart}-${displayEnd} dari ${data.length} data`;

    elBtnPrev.disabled = state.currentPage === 1;
    elBtnNext.disabled = state.currentPage === totalPages;

    // Render page number buttons
    elPageNumbers.innerHTML = '';
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || (p >= state.currentPage - 1 && p <= state.currentPage + 1)) {
        const btn = document.createElement('button');
        btn.className = `btn-page ${p === state.currentPage ? 'active' : ''}`;
        btn.textContent = p;
        btn.addEventListener('click', () => {
          state.currentPage = p;
          updateTable();
        });
        elPageNumbers.appendChild(btn);
      }
    }
  }

  // 11. EXPORT TO CSV
  function exportTableToCSV() {
    const data = getFilteredDataGeneral();
    if (data.length === 0) {
      alert('Tidak ada data untuk di-export.');
      return;
    }

    const headers = ['No Event', 'Event', 'Bulan', 'Tanggal Event', 'Vendor', 'Kategori', 'Alamat', 'Nilai', 'Huruf', 'Rekomendasi'];
    const rows = data.map(d => [
      `"${d.eventNo}"`,
      `"${d.event.replace(/"/g, '""')}"`,
      `"${d.bulan}"`,
      `"${d.tglEvent}"`,
      `"${d.vendor.replace(/"/g, '""')}"`,
      `"${d.category.replace(/"/g, '""')}"`,
      `"${d.alamat}"`,
      d.nilai,
      `"${d.huruf}"`,
      `"${d.rekomendasi}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Evaluasi_Vendor_Filtered_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 12. VENDOR PROFILE MODAL INSPECTOR
  function openVendorModal(vendorName) {
    const vendorEvaluations = rawData.filter(d => d.vendor === vendorName);
    if (vendorEvaluations.length === 0) return;

    const category = vendorEvaluations[0].category;
    const count = vendorEvaluations.length;
    const avgScore = (vendorEvaluations.reduce((sum, e) => sum + e.nilai, 0) / count).toFixed(1);

    let topGrade = 'A';
    if (avgScore < 70) topGrade = 'D';
    else if (avgScore < 80) topGrade = 'C';
    else if (avgScore < 90) topGrade = 'B';

    elModalVendorName.textContent = vendorName;
    elModalVendorCategory.textContent = `Kategori: ${category} · ${vendorEvaluations[0].alamat}`;
    elModalScore.textContent = avgScore;
    elModalCount.textContent = count;
    elModalGrade.textContent = topGrade;

    elModalHistoryList.innerHTML = vendorEvaluations.map(e => `
      <div style="padding: 10px; border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: 700; font-size: 13px; color: var(--navy-950);">${e.event}</div>
          <div style="font-size: 11.5px; color: var(--ink-600);">${e.bulan} (${e.tglEvent})</div>
        </div>
        <div style="text-align: right;">
          <span class="badge-score grade-${e.huruf}">${e.nilai.toFixed(1)} (${e.huruf})</span>
          <div style="font-size: 11px; color: var(--ink-400); margin-top: 2px;">${e.rekomendasi}</div>
        </div>
      </div>
    `).join('');

    elModal.classList.add('active');
  }

  function closeModal() {
    elModal.classList.remove('active');
  }

  // START APP
  initFilters();
  updateDashboard();
});
