import React from 'react';
import { X, Award, Calendar, MapPin, Tag } from 'lucide-react';

export function VendorDetailModal({ vendorName, allEvaluations, onClose }) {
  if (!vendorName) return null;

  const vendorRecords = allEvaluations.filter(d => d.vendor === vendorName);
  if (vendorRecords.length === 0) return null;

  const sum = vendorRecords.reduce((acc, curr) => acc + Number(curr.nilai), 0);
  const avg = (sum / vendorRecords.length).toFixed(1);

  const mainCategory = vendorRecords[0]?.category || '-';
  const mainAddress = vendorRecords[0]?.alamat || '-';

  let grade = 'D';
  if (avg >= 85) grade = 'A';
  else if (avg >= 75) grade = 'B';
  else if (avg >= 65) grade = 'C';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content vendor-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{vendorName}</h3>
            <p className="modal-subtitle">Detail Profil & Histori Penilaian Evaluasi Vendor</p>
          </div>
          <button className="btn-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          <div className="vendor-profile-hero">
            <div className="profile-stat">
              <div className="stat-num">{avg}</div>
              <div className="stat-lbl">Rata-rata Skor</div>
            </div>
            <div className="profile-stat">
              <div className={`badge-score grade-${grade}`} style={{ fontSize: '18px', padding: '6px 14px' }}>
                Grade {grade}
              </div>
              <div className="stat-lbl">Predikat Performa</div>
            </div>
            <div className="profile-stat">
              <div className="stat-num">{vendorRecords.length}x</div>
              <div className="stat-lbl">Total Frekuensi Event</div>
            </div>
          </div>

          <div className="profile-info-grid">
            <div><Tag size={14} /> <strong>Kategori:</strong> {mainCategory}</div>
            <div><MapPin size={14} /> <strong>Lokasi:</strong> {mainAddress}</div>
          </div>

          <h4 style={{ marginTop: '20px', marginBottom: '10px', color: 'var(--navy-900)' }}>
            Riwayat Event Terlibat ({vendorRecords.length})
          </h4>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Bulan</th>
                  <th>Skor</th>
                  <th>Grade</th>
                  <th>Rekomendasi</th>
                </tr>
              </thead>
              <tbody>
                {vendorRecords.map((r, i) => (
                  <tr key={i}>
                    <td><strong>{r.event}</strong></td>
                    <td>{r.bulan}</td>
                    <td><strong>{Number(r.nilai).toFixed(1)}</strong></td>
                    <td><span className={`badge-score grade-${r.huruf}`}>{r.huruf}</span></td>
                    <td>{r.rekomendasi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
