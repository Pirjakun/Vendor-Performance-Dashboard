import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export function EvaluationModal({ isOpen, onClose, onSave, initialRecord }) {
  const isEdit = Boolean(initialRecord && initialRecord.id);

  const [formData, setFormData] = useState({
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

  // Auto calculate Huruf (Grade) based on score rules
  const handleScoreChange = (scoreVal) => {
    const num = Math.min(100, Math.max(0, Number(scoreVal) || 0));
    let h = 'D';
    let r = 'Perlu perbaikan serius / pertimbangkan alternatif';
    if (num >= 85) {
      h = 'A';
      r = 'Sangat direkomendasikan / prioritas repeat order';
    } else if (num >= 70) {
      h = 'B';
      r = 'Direkomendasikan dengan monitoring normal';
    } else if (num >= 55) {
      h = 'C';
      r = 'Perlu evaluasi dan catatan perbaikan';
    }

    setFormData(prev => ({
      ...prev,
      nilai: num,
      huruf: h,
      rekomendasi: r
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

          <div className="form-group">
            <label>Bulan Evaluasi *</label>
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

          <div className="form-row-2">
            <div className="form-group">
              <label>Pilih Tanggal Pelaksanaan (Kalender)</label>
              <input
                type="date"
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--line)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--ink-900)',
                  background: 'var(--sky-50)'
                }}
                onChange={(e) => {
                  const isoVal = e.target.value;
                  if (!isoVal) return;
                  const [y, m, d] = isoVal.split('-');
                  const monthsIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                  const monthIdx = parseInt(m, 10) - 1;
                  const monthName = monthsIndo[monthIdx] || '';
                  const formattedDate = `${parseInt(d, 10)} ${monthName} ${y}`;
                  const formattedBulan = `${monthName} ${y}`;
                  setFormData(prev => ({
                    ...prev,
                    tglEvent: formattedDate,
                    bulan: formattedBulan
                  }));
                }}
              />
            </div>
            <div className="form-group">
              <label>Kategori Jasa *</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Activity">Activity</option>
                <option value="Akomodasi">Akomodasi</option>
                <option value="Bali Dance">Bali Dance</option>
                <option value="Beverage">Beverage</option>
                <option value="Catering">Catering</option>
                <option value="Decoration">Decoration</option>
                <option value="Documentation">Documentation</option>
                <option value="Equipment">Equipment</option>
                <option value="Equipment & Production">Equipment &amp; Production</option>
                <option value="Event Support">Event Support</option>
                <option value="F&B">F&amp;B</option>
                <option value="Game Master">Game Master</option>
                <option value="Gimmick">Gimmick</option>
                <option value="Intepreter">Intepreter</option>
                <option value="Logistik">Logistik</option>
                <option value="MC">MC</option>
                <option value="Manpower">Manpower</option>
                <option value="Multimedia">Multimedia</option>
                <option value="Pengharum Ruangan">Pengharum Ruangan</option>
                <option value="Photobooth">Photobooth</option>
                <option value="Production">Production</option>
                <option value="Registration">Registration</option>
                <option value="Resto">Resto</option>
                <option value="Show Management">Show Management</option>
                <option value="Talent">Talent</option>
                <option value="Talent & Decoration">Talent &amp; Decoration</option>
                <option value="Transfer Handling">Transfer Handling</option>
                <option value="Transport">Transport</option>
                <option value="Travel Agent">Travel Agent</option>
                <option value="Usher">Usher</option>
                <option value="Venue">Venue</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Lokasi / Kota *</label>
              <select
                value={formData.alamat}
                onChange={e => setFormData({ ...formData, alamat: e.target.value })}
              >
                <option value="Yogyakarta">Yogyakarta</option>
                <option value="Jakarta">Jakarta</option>
                <option value="Bandung">Bandung</option>
                <option value="Bali">Bali</option>
                <option value="Surabaya">Surabaya</option>
                <option value="Magelang">Magelang</option>
                <option value="Salatiga">Salatiga</option>
                <option value="Jawa Timur">Jawa Timur</option>
                <option value="Medan">Medan</option>
              </select>
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
                <option value="Sangat direkomendasikan / prioritas repeat order">Sangat direkomendasikan / prioritas repeat order</option>
                <option value="Direkomendasikan dengan monitoring normal">Direkomendasikan dengan monitoring normal</option>
                <option value="Perlu evaluasi dan catatan perbaikan">Perlu evaluasi dan catatan perbaikan</option>
                <option value="Perlu perbaikan serius / pertimbangkan alternatif">Perlu perbaikan serius / pertimbangkan alternatif</option>
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
