import React, { useState, useEffect } from 'react';
import { X, Save, CheckCircle } from 'lucide-react';

export function EvaluationModal({ isOpen, onClose, onSave, initialRecord }) {
  const isEdit = Boolean(initialRecord && initialRecord.id);

  const [formData, setFormData] = useState({
    eventNo: '1',
    event: '',
    bulan: 'Januari 2026',
    tglEvent: '',
    vendor: '',
    category: 'Production',
    alamat: 'Yogyakarta',
    nilai: 85,
    huruf: 'A',
    rekomendasi: 'Sangat Direkomendasikan'
  });

  useEffect(() => {
    if (initialRecord) {
      setFormData({
        eventNo: initialRecord.eventNo || '1',
        event: initialRecord.event || '',
        bulan: initialRecord.bulan || 'Januari 2026',
        tglEvent: initialRecord.tglEvent || '',
        vendor: initialRecord.vendor || '',
        category: initialRecord.category || 'Production',
        alamat: initialRecord.alamat || 'Yogyakarta',
        nilai: initialRecord.nilai ?? 85,
        huruf: initialRecord.huruf || 'A',
        rekomendasi: initialRecord.rekomendasi || 'Sangat Direkomendasikan'
      });
    } else {
      setFormData({
        eventNo: '1',
        event: '',
        bulan: 'Januari 2026',
        tglEvent: '',
        vendor: '',
        category: 'Production',
        alamat: 'Yogyakarta',
        nilai: 85,
        huruf: 'A',
        rekomendasi: 'Sangat Direkomendasikan'
      });
    }
  }, [initialRecord, isOpen]);

  // Auto calculate Huruf (Grade) based on score
  const handleScoreChange = (scoreVal) => {
    const num = Math.min(100, Math.max(0, Number(scoreVal) || 0));
    let h = 'D';
    let r = 'Pertimbangkan Alternatif';
    if (num >= 85) {
      h = 'A';
      r = 'Sangat Direkomendasikan';
    } else if (num >= 75) {
      h = 'B';
      r = 'Direkomendasikan';
    } else if (num >= 65) {
      h = 'C';
      r = 'Perlu Evaluasi';
    }

    setFormData(prev => ({
      ...prev,
      nilai: num,
      huruf: h,
      rekomendasi: prev.rekomendasi || r
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.vendor.trim() || !formData.event.trim()) {
      alert('Nama Vendor dan Nama Event wajib diisi.');
      return;
    }
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content crud-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{isEdit ? 'Edit Evaluasi Vendor' : 'Tambah Evaluasi Vendor Baru'}</h3>
            <p className="modal-subtitle">
              {isEdit ? 'Perbarui data dan skor evaluasi vendor' : 'Isi formulir berikut untuk menambahkan data evaluasi baru'}
            </p>
          </div>
          <button className="btn-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body form-grid">
          <div className="form-group">
            <label>Nama Vendor *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Akasya Catering"
              value={formData.vendor}
              onChange={e => setFormData({ ...formData, vendor: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Nama Event *</label>
            <input
              type="text"
              required
              placeholder="Contoh: WB HEALTHY FUTURE LAUNCH"
              value={formData.event}
              onChange={e => setFormData({ ...formData, event: e.target.value })}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Nomor Event</label>
              <input
                type="text"
                value={formData.eventNo}
                onChange={e => setFormData({ ...formData, eventNo: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Bulan Evaluasi</label>
              <select
                value={formData.bulan}
                onChange={e => setFormData({ ...formData, bulan: e.target.value })}
              >
                <option value="Januari 2026">Januari 2026</option>
                <option value="Februari 2026">Februari 2026</option>
                <option value="Maret 2026">Maret 2026</option>
                <option value="April 2026">April 2026</option>
                <option value="Mei 2026">Mei 2026</option>
                <option value="Juni 2026">Juni 2026</option>
                <option value="Juli 2026">Juli 2026</option>
                <option value="Agustus 2026">Agustus 2026</option>
                <option value="September 2026">September 2026</option>
                <option value="Oktober 2026">Oktober 2026</option>
                <option value="November 2026">November 2026</option>
                <option value="Desember 2026">Desember 2026</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Tanggal Pelaksanaan</label>
              <input
                type="text"
                placeholder="Contoh: 22 Januari 2026"
                value={formData.tglEvent}
                onChange={e => setFormData({ ...formData, tglEvent: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Kategori Jasa</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="F&B & Resto">F&B & Resto</option>
                <option value="Production">Production</option>
                <option value="Dokumentasi">Dokumentasi</option>
                <option value="Multimedia">Multimedia</option>
                <option value="Show Management">Show Management</option>

                <option value="Talent">Talent</option>
                <option value="Transport">Transport</option>
                <option value="Venue">Venue</option>
                <option value="Interpreter">Interpreter</option>
                <option value="Equipment">Equipment</option>
                <option value="Manpower & Support">Manpower & Support</option>
                <option value="Activity">Activity</option>
                <option value="Gimmick & Souvenir">Gimmick & Souvenir</option>
                <option value="Dekorasi">Dekorasi</option>
                <option value="Usher">Usher</option>
                <option value="Travel Agent">Travel Agent</option>
                <option value="Talent & Decoration">Talent & Decoration</option>
                <option value="Logistik">Logistik</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Lokasi / Kota</label>
              <input
                type="text"
                placeholder="Contoh: Jakarta, Yogyakarta, Bali..."
                value={formData.alamat}
                onChange={e => setFormData({ ...formData, alamat: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Nilai / Skor (0 - 100) *</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={formData.nilai}
                onChange={e => handleScoreChange(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Grade (Otomatis)</label>
              <input
                type="text"
                readOnly
                className={`grade-preview grade-${formData.huruf}`}
                value={`Grade ${formData.huruf}`}
              />
            </div>
            <div className="form-group">
              <label>Rekomendasi *</label>
              <select
                value={formData.rekomendasi}
                onChange={e => setFormData({ ...formData, rekomendasi: e.target.value })}
              >
                <option value="Sangat Direkomendasikan">Sangat Direkomendasikan</option>
                <option value="Direkomendasikan">Direkomendasikan</option>
                <option value="Perlu Evaluasi">Perlu Evaluasi</option>
                <option value="Pertimbangkan Alternatif">Pertimbangkan Alternatif</option>
              </select>
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Batal</button>
            <button type="submit" className="btn-primary">
              <Save size={15} /> {isEdit ? 'Simpan Perubahan' : 'Tambah Evaluasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
