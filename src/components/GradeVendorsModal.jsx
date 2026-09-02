import React from 'react';
import { X, Award, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';

export function GradeVendorsModal({ grade, evaluations, calcMode, onClose, onVendorClick }) {
  if (!grade) return null;

  const gradeTitles = {
    A: { title: 'Grade A (Sangat Direkomendasikan)', badgeClass: 'grade-a', range: 'Skor ≥ 85', desc: 'Prioritas utama repeat order untuk event-event mendatang.' },
    B: { title: 'Grade B (Direkomendasikan)', badgeClass: 'grade-b', range: 'Skor 70 – 84.99', desc: 'Dapat digunakan kembali dengan pemantauan standar.' },
    C: { title: 'Grade C (Perlu Evaluasi)', badgeClass: 'grade-c', range: 'Skor 55 – 69.99', desc: 'Memerlukan catatan perbaikan sebelum digunakan kembali.' },
    D: { title: 'Grade D (Perlu Perbaikan Serius)', badgeClass: 'grade-d', range: 'Skor < 55', desc: 'Dipertimbangkan alternatif vendor lain atau evaluasi total.' }
  };

  const currentGradeInfo = gradeTitles[grade] || gradeTitles.A;

  // Aggregate vendor scores or evaluations based on calcMode
  let items = [];
  if (calcMode === 'vendor') {
    // Per Vendor mode: calculate vendor average score first
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
    // Per Evaluasi mode: list evaluation rows matching grade
    const map = {};
    evaluations.filter(e => e.huruf === grade).forEach(e => {
      if (!map[e.vendor]) {
        map[e.vendor] = { vendor: e.vendor, category: e.category, alamat: e.alamat, sum: 0, count: 0, scores: [] };
      }
      map[e.vendor].sum += Number(e.nilai);
      map[e.vendor].count += 1;
      map[e.vendor].scores.push(e.nilai);
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-large" onClick={e => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className={`badge ${currentGradeInfo.badgeClass}`} style={{ fontSize: '14px', padding: '6px 12px' }}>
                Grade {grade}
              </span>
              <h2>Rincian Vendor {currentGradeInfo.title}</h2>
            </div>
            <p style={{ marginTop: '4px', fontSize: '13px', color: 'var(--ink-500)' }}>
              {currentGradeInfo.desc} ({items.length} Vendor Ditemukan — Mode: {calcMode === 'vendor' ? 'Rata-Rata Per Vendor' : 'Per Evaluasi Event'})
            </p>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Tutup Modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '460px', overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ink-400)' }}>
              <AlertTriangle size={36} style={{ marginBottom: '10px', color: 'var(--ink-300)' }} />
              <p>Tidak ada vendor dalam kategori <strong>Grade {grade}</strong> untuk filter saat ini.</p>
            </div>
          ) : (
            <table className="eval-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-50)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '700' }}>Nama Vendor</th>
                  <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '700' }}>Kategori Jasa</th>
                  <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '700' }}>Wilayah</th>
                  <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '700', textAlign: 'center' }}>Total Evaluasi</th>
                  <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '700', textAlign: 'center' }}>Skor Rata-Rata</th>
                  <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '700', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--navy-950)' }}>
                      {item.vendor}
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', color: 'var(--ink-700)' }}>
                      {item.category}
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', color: 'var(--ink-700)' }}>
                      {item.alamat}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>
                      {item.count} Event
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span className={`badge ${currentGradeInfo.badgeClass}`} style={{ fontWeight: 800 }}>
                        {item.score}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        className="btn-outline-sm"
                        onClick={() => {
                          onClose();
                          onVendorClick(item.vendor);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          background: '#fff',
                          border: '1px solid var(--navy-300)',
                          color: 'var(--navy-900)'
                        }}
                      >
                        Profil <ExternalLink size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="modal-footer" style={{ padding: '14px 24px', background: 'var(--surface-50)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
