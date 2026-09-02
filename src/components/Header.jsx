import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, RotateCcw, ShieldCheck, X, FileSpreadsheet, FileText, Download, LogOut, User } from 'lucide-react';
import logoImg from '../assets/logo.png';

export function Header({
  onOpenAddModal,
  onOpenExcelModal,
  onExportPdf,
  onFullReport,
  onResetData,
  currentUser,
  onLogout,
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
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div className="period-chip">
              <ShieldCheck size={14} style={{ color: 'var(--sky-200)' }} />
              2026
            </div>

            {/* Logged in user info chip */}
            {currentUser && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <User size={13} style={{ color: 'var(--sky-400)' }} />
                <span>{currentUser.email || 'ss@werkudara.com'}</span>
              </div>
            )}
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

            {/* Single Unified Export Dropdown Button */}
            <div ref={exportRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setExportOpen(o => !o)}
                style={{
                  background: '#DC2626',
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
                title="Pilih Format Export Laporan"
              >
                <Download size={15} />
                Export ▾
              </button>

              {exportOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                  background: '#fff', border: '1px solid #E2E8F0',
                  borderRadius: '10px', boxShadow: '0 8px 24px rgba(15,23,42,0.15)',
                  minWidth: '220px', zIndex: 100, overflow: 'hidden'
                }}>
                  {onExportPdf && (
                    <button
                      onClick={() => { onExportPdf(); setExportOpen(false); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '11px 16px', background: 'none', border: 'none',
                        cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                        color: '#1E293B', textAlign: 'left', transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <FileText size={16} style={{ color: '#DC2626' }} />
                      <div>
                        <div>Export PDF (Tabel)</div>
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 400 }}>Tabel data evaluasi aktif</div>
                      </div>
                    </button>
                  )}

                  <div style={{ height: '1px', background: '#F1F5F9', margin: '0 12px' }} />

                  {onFullReport && (
                    <button
                      onClick={() => { onFullReport(); setExportOpen(false); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '11px 16px', background: 'none', border: 'none',
                        cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                        color: '#1E293B', textAlign: 'left', transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#EEF4FF'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <FileText size={16} style={{ color: '#7C3AED' }} />
                      <div>
                        <div style={{ color: '#7C3AED' }}>Full Report PDF ✨</div>
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 400 }}>Grafik + analisis & narasi</div>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>

            <button className="btn-reset-data" onClick={onResetData} title="Reset dataset ke 151 data asli">
              <RotateCcw size={13} />
              Reset Data
            </button>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#FECACA',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                title="Keluar dari Akun Dashboard"
              >
                <LogOut size={14} />
                Keluar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* COMPACT & SLEEK FILTER BAR */}
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
