import React from 'react';
import { PlusCircle, RotateCcw, ShieldCheck, Filter, X, FileSpreadsheet } from 'lucide-react';
import logoImg from '../assets/logo.png';

export function Header({
  onOpenAddModal,
  onOpenExcelModal,
  onResetData,
  filters,
  setFilter,
  resetFilters,
  uniqueMonths,
  uniqueVendors,
  uniqueEvents,
  uniqueCategories,
  uniqueLocations
}) {
  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <header className="top">
      <div className="top-row">
        <div>
          <div className="brand">
            <img src={logoImg} alt="Werkudara Group Logo" className="brand-logo" />
            <div className="brand-name">WERKUDARA GROUP</div>
          </div>
          <h1>Vendor Performance Monitoring</h1>
          <p>
            Memantau performa vendor dari waktu ke waktu — konsistensi, perbandingan, dan kualitas per kategori.
          </p>
        </div>

        <div className="header-badges">
          <div className="period-chip">
            <ShieldCheck size={14} style={{ color: 'var(--sky-200)' }} />
            2026
          </div>
          <div className="header-actions">
            <button className="btn-crud-add" onClick={onOpenAddModal}>
              <PlusCircle size={15} />
              Tambah Evaluasi
            </button>
            <button
              className="btn-crud-excel"
              onClick={onOpenExcelModal}
              style={{
                background: '#0D9488',
                color: '#fff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '12.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
              title="Upload file Excel (.xlsx / .csv) untuk menambah atau menimpa data"
            >
              <FileSpreadsheet size={15} />
              Upload Excel
            </button>
            <button className="btn-reset-data" onClick={onResetData} title="Reset dataset ke 151 data asli">
              <RotateCcw size={13} />
              Reset Data
            </button>
          </div>
        </div>
      </div>

      {/* COMPACT & SLEEK FILTER BAR MATCHING CONTOH TERBARU.HTML */}
      <div className="filters">
        <div className="filter">
          <div className="filter-content">
            <label>Bulan</label>
            <select value={filters.bulan} onChange={e => setFilter('bulan', e.target.value)}>
              <option value="">Semua Bulan</option>
              {uniqueMonths.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter">
          <div className="filter-content">
            <label>Vendor</label>
            <select value={filters.vendor} onChange={e => setFilter('vendor', e.target.value)}>
              <option value="">Semua Vendor ({uniqueVendors.length})</option>
              {uniqueVendors.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter">
          <div className="filter-content">
            <label>Event</label>
            <select value={filters.event} onChange={e => setFilter('event', e.target.value)}>
              <option value="">Semua Event ({uniqueEvents.length})</option>
              {uniqueEvents.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter">
          <div className="filter-content">
            <label>Kategori</label>
            <select value={filters.category} onChange={e => setFilter('category', e.target.value)}>
              <option value="">Semua Kategori ({uniqueCategories.length})</option>
              {uniqueCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter">
          <div className="filter-content">
            <label>Wilayah</label>
            <select value={filters.location} onChange={e => setFilter('location', e.target.value)}>
              <option value="">Semua Wilayah ({uniqueLocations.length})</option>
              {uniqueLocations.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter">
          <div className="filter-content">
            <label>Grade</label>
            <select value={filters.grade} onChange={e => setFilter('grade', e.target.value)}>
              <option value="">Semua Grade</option>
              <option value="A">Grade A (≥85 / Excellent)</option>
              <option value="B">Grade B (75–84 / Good)</option>
              <option value="C">Grade C (65–74 / Fair)</option>
              <option value="D">Grade D (&lt;65 / Poor)</option>
            </select>
          </div>
        </div>

        {activeCount > 0 && (
          <button className="btn-reset-filters-chip" onClick={resetFilters}>
            <X size={12} /> Reset Filter ({activeCount})
          </button>
        )}
      </div>
    </header>
  );
}
