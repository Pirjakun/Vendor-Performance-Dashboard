import React, { useState, useMemo } from 'react';
import { Search, Download, Pencil, Trash2, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export function DataTable({
  filteredData,
  onEdit,
  onDelete,
  onVendorClick,
  searchQuery,
  setSearchQuery,
  onExportPdf
}) {
  const [sortCol, setSortCol] = useState('id');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const pageSize = 10;

  // Sorting
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let valA = a[sortCol];
      let valB = b[sortCol];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortCol, sortDir]);

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const pageData = sortedData.slice(startIdx, startIdx + pageSize);

  // CSV Export
  const handleExportCSV = () => {
    if (sortedData.length === 0) return;
    const headers = ['Event', 'Bulan', 'Tanggal Event', 'Vendor', 'Kategori', 'Alamat', 'Nilai', 'Huruf', 'Rekomendasi'];
    const rows = sortedData.map(d => [
      `"${(d.event || '').replace(/"/g, '""')}"`,
      `"${d.bulan || ''}"`,
      `"${d.tglEvent || ''}"`,
      `"${(d.vendor || '').replace(/"/g, '""')}"`,
      `"${(d.category || '').replace(/"/g, '""')}"`,
      `"${d.alamat || ''}"`,
      d.nilai,
      `"${d.huruf || ''}"`,
      `"${d.rekomendasi || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Vendor_Evaluations_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card table-card">
      <DeleteConfirmModal
        isOpen={Boolean(deletingRecord)}
        onClose={() => setDeletingRecord(null)}
        onConfirm={(id) => onDelete(id)}
        record={deletingRecord}
      />

      <div className="card-head">
        <div>
          <h2>Daftar Evaluasi Vendor Detail</h2>
          <p>Daftar seluruh penilaian vendor. Anda dapat menambah, mengedit, atau menghapus data secara langsung.</p>
        </div>
        <div className="table-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn-export" onClick={handleExportCSV}>
            <Download size={14} />
            Export CSV ({sortedData.length})
          </button>
          {onExportPdf && (
            <button
              className="btn-export-pdf"
              onClick={onExportPdf}
              style={{
                background: '#DC2626',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <FileText size={14} />
              Export PDF ({sortedData.length})
            </button>
          )}
        </div>
      </div>

      <div className="table-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Cari vendor, event, kategori, lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="tag">{sortedData.length} data ditemukan</div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('event')}>Event</th>
              <th onClick={() => handleSort('bulan')}>Bulan</th>
              <th onClick={() => handleSort('vendor')}>Vendor</th>
              <th onClick={() => handleSort('category')}>Kategori</th>
              <th onClick={() => handleSort('alamat')}>Lokasi</th>
              <th onClick={() => handleSort('nilai')}>Skor</th>
              <th onClick={() => handleSort('huruf')}>Grade</th>
              <th onClick={() => handleSort('rekomendasi')}>Rekomendasi</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '28px', color: 'var(--ink-400)' }}>
                  Tidak ada data evaluasi yang sesuai filter/pencarian.
                </td>
              </tr>
            ) : (
              pageData.map(row => (
                <tr key={row.id}>
                  <td>{row.event}</td>
                  <td>{row.bulan}</td>
                  <td>
                    <strong
                      style={{ color: 'var(--blue-700)', cursor: 'pointer' }}
                      onClick={() => onVendorClick(row.vendor)}
                      title="Klik untuk melihat detail profil vendor"
                    >
                      {row.vendor}
                    </strong>
                  </td>
                  <td>{row.category}</td>
                  <td>{row.alamat}</td>
                  <td><strong>{Number(row.nilai).toFixed(2)}</strong></td>
                  <td><span className={`badge-score grade-${row.huruf}`}>{row.huruf}</span></td>
                  <td>{row.rekomendasi}</td>
                  <td>
                    <div className="table-row-actions">
                      <button
                        className="btn-action-edit"
                        onClick={(e) => { e.stopPropagation(); onEdit(row); }}
                        title="Edit data evaluasi"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        className="btn-action-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingRecord(row);
                        }}
                        title="Hapus data evaluasi"
                      >
                        <Trash2 size={13} /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>
          Menampilkan {sortedData.length > 0 ? startIdx + 1 : 0}-{Math.min(startIdx + pageSize, sortedData.length)} dari {sortedData.length} data
        </span>
        <div className="pagination-controls">
          <button
            className="btn-page"
            disabled={safePage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            <ChevronLeft size={14} /> Prev
          </button>

          <span style={{ margin: '0 8px', fontWeight: 600, fontSize: '13px' }}>
            Halaman {safePage} dari {totalPages}
          </span>

          <button
            className="btn-page"
            disabled={safePage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
