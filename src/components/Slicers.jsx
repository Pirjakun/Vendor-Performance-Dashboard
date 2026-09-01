import React from 'react';
import { Filter, RotateCcw, X } from 'lucide-react';

export function Slicers({
  filters,
  setFilter,
  resetFilters,
  uniqueMonths,
  uniqueVendors,
  uniqueEvents,
  uniqueCategories,
  evaluations
}) {
  const months = ['Januari 2026', 'Februari 2026', 'Maret 2026', 'April 2026', 'Mei 2026', 'Juni 2026'];
  const grades = ['A', 'B', 'C', 'D'];
  const rekomList = [
    'Sangat Direkomendasikan',
    'Direkomendasikan',
    'Perlu Evaluasi',
    'Pertimbangkan Alternatif'
  ];

  // Helper to count evaluations per month/grade/rekom
  const countBy = (key, val) => evaluations.filter(e => e[key] === val).length;

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="slicers-container">
      <div className="slicers-top-bar">
        <div className="slicers-title">
          <Filter size={15} />
          Interactive Dashboard Slicers (PowerBI Style)
        </div>
        {activeCount > 0 && (
          <button className="btn-reset-slicers" onClick={resetFilters}>
            <RotateCcw size={12} />
            Reset Semua Slicer ({activeCount})
          </button>
        )}
      </div>

      {/* 1. MONTH SLICER */}
      <div className="slicer-group">
        <div className="slicer-label">Bulan Evaluasi:</div>
        <div className="slicer-buttons">
          <button
            className={`slicer-btn ${filters.bulan === '' ? 'active' : ''}`}
            onClick={() => setFilter('bulan', '')}
          >
            Semua Bulan ({evaluations.length})
          </button>
          {months.map(m => {
            const count = countBy('bulan', m);
            if (count === 0) return null;
            return (
              <button
                key={m}
                className={`slicer-btn ${filters.bulan === m ? 'active' : ''}`}
                onClick={() => setFilter('bulan', filters.bulan === m ? '' : m)}
              >
                {m.replace(' 2026', '')} <span className="slicer-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. GRADE & REKOMENDASI SLICER */}
      <div className="slicers-flex-row">
        <div className="slicer-subgroup">
          <div className="slicer-label">Grade Slicer:</div>
          <div className="slicer-buttons">
            {grades.map(g => {
              const count = countBy('huruf', g);
              return (
                <button
                  key={g}
                  className={`slicer-btn badge-grade grade-${g} ${filters.grade === g ? 'active' : ''}`}
                  onClick={() => setFilter('grade', filters.grade === g ? '' : g)}
                >
                  Grade {g} <span className="slicer-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="slicer-subgroup">
          <div className="slicer-label">Rekomendasi Slicer:</div>
          <div className="slicer-buttons">
            {rekomList.map(r => {
              const count = countBy('rekomendasi', r);
              if (count === 0) return null;
              return (
                <button
                  key={r}
                  className={`slicer-btn ${filters.rekomendasi === r ? 'active' : ''}`}
                  onClick={() => setFilter('rekomendasi', filters.rekomendasi === r ? '' : r)}
                >
                  {r} <span className="slicer-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. DROPDOWN SLICERS FOR VENDOR, EVENT, CATEGORY */}
      <div className="slicers-grid">
        <div className="slicer-select-card">
          <label>Filter Vendor</label>
          <select value={filters.vendor} onChange={e => setFilter('vendor', e.target.value)}>
            <option value="">Semua Vendor ({uniqueVendors.length})</option>
            {uniqueVendors.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div className="slicer-select-card">
          <label>Filter Event</label>
          <select value={filters.event} onChange={e => setFilter('event', e.target.value)}>
            <option value="">Semua Event ({uniqueEvents.length})</option>
            {uniqueEvents.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>

        <div className="slicer-select-card">
          <label>Filter Kategori Jasa</label>
          <select value={filters.category} onChange={e => setFilter('category', e.target.value)}>
            <option value="">Semua Kategori ({uniqueCategories.length})</option>
            {uniqueCategories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ACTIVE FILTERS SUMMARY TAGS */}
      {activeCount > 0 && (
        <div className="active-pills-bar">
          <span style={{ fontSize: '11px', color: 'var(--sky-200)', fontWeight: 600 }}>Filter Aktif:</span>
          {Object.entries(filters).map(([k, v]) => {
            if (!v) return null;
            return (
              <span key={k} className="active-pill">
                {k.toUpperCase()}: <strong>{v}</strong>
                <button onClick={() => setFilter(k, '')}><X size={12} /></button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
