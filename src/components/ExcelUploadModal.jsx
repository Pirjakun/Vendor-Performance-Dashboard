import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2, X } from 'lucide-react';

export function ExcelUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [importMode, setImportMode] = useState('append'); // 'append' | 'replace'
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const calculateGradeAndRekom = (scoreNum) => {
    if (scoreNum >= 85) {
      return { huruf: 'A', rekomendasi: 'Sangat direkomendasikan / prioritas repeat order' };
    } else if (scoreNum >= 70) {
      return { huruf: 'B', rekomendasi: 'Direkomendasikan dengan monitoring normal' };
    } else if (scoreNum >= 55) {
      return { huruf: 'C', rekomendasi: 'Perlu evaluasi dan catatan perbaikan' };
    } else {
      return { huruf: 'D', rekomendasi: 'Perlu perbaikan serius / pertimbangkan alternatif' };
    }
  };

  const getHeaderKey = (headers, possibleNames) => {
    return headers.find(h => {
      const clean = String(h).trim().toLowerCase();
      return possibleNames.some(p => clean.includes(p));
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrorMsg('');
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawJson.length === 0) {
          setErrorMsg('File Excel/CSV tidak memiliki data atau kosong.');
          setParsedData([]);
          setIsProcessing(false);
          return;
        }

        const sampleRow = rawJson[0];
        const headers = Object.keys(sampleRow);

        const keyEventNo = getHeaderKey(headers, ['no event', 'no.', 'no', 'id']);
        const keyEvent = getHeaderKey(headers, ['nama event', 'event', 'kegiatan']);
        const keyBulan = getHeaderKey(headers, ['bulan evaluasi', 'bulan', 'month']);
        const keyTgl = getHeaderKey(headers, ['tgl event', 'tanggal event', 'tgl', 'tanggal', 'date']);
        const keyVendor = getHeaderKey(headers, ['nama vendor', 'vendor', 'penyedia', 'barang/jasa']);
        const keyCat = getHeaderKey(headers, ['kategori jasa', 'kategori', 'jenis']);
        const keyAlamat = getHeaderKey(headers, ['alamat', 'wilayah', 'kota', 'lokasi']);
        const keyNilai = getHeaderKey(headers, ['nilai evaluasi', 'nilai', 'skor', 'score']);

        let currentEventNo = '';
        let currentEvent = '';
        let currentBulan = '';
        let currentTgl = '';

        const normalizedRows = [];

        rawJson.forEach((row, idx) => {
          const rawEvtNo = keyEventNo ? String(row[keyEventNo]).trim() : '';
          const rawEvt = keyEvent ? String(row[keyEvent]).trim() : '';
          const rawBulan = keyBulan ? String(row[keyBulan]).trim() : '';
          const rawTgl = keyTgl ? String(row[keyTgl]).trim() : '';
          const rawVendor = keyVendor ? String(row[keyVendor]).trim() : '';

          if (rawEvtNo) currentEventNo = rawEvtNo;
          if (rawEvt) currentEvent = rawEvt;
          if (rawBulan) currentBulan = rawBulan;
          if (rawTgl) currentTgl = rawTgl;

          if (!rawVendor) return; // Skip empty vendor row

          const category = keyCat && row[keyCat] ? String(row[keyCat]).trim() : 'Lainnya';
          const alamat = keyAlamat && row[keyAlamat] ? String(row[keyAlamat]).trim() : 'Lainnya';
          const nilai = keyNilai ? parseFloat(row[keyNilai]) || 0 : 0;

          const { huruf, rekomendasi } = calculateGradeAndRekom(nilai);

          normalizedRows.push({
            eventNo: rawEvtNo || currentEventNo || `EVT-${idx + 1}`,
            event: rawEvt || currentEvent || 'Event Tanpa Nama',
            bulan: rawBulan || currentBulan || 'Januari 2026',
            tglEvent: rawTgl || currentTgl || '-',
            vendor: rawVendor,
            category: category || 'Lainnya',
            alamat: alamat || 'Lainnya',
            nilai,
            huruf,
            rekomendasi
          });
        });

        if (normalizedRows.length === 0) {
          setErrorMsg('Tidak ditemukan kolom vendor yang valid dalam file Excel tersebut.');
        } else {
          setParsedData(normalizedRows);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Gagal membaca file Excel/CSV. Pastikan format file sesuai.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'No Event': '1',
        'Event': 'Gath Sinergi 2026',
        'Bulan': 'Januari 2026',
        'Tanggal Event': '15 Jan 2026',
        'Vendor': 'O2 Show Management',
        'Kategori Jasa': 'Show Management',
        'Alamat': 'Yogyakarta',
        'Nilai Evaluasi': 92
      },
      {
        'No Event': '1',
        'Event': 'Gath Sinergi 2026',
        'Bulan': 'Januari 2026',
        'Tanggal Event': '15 Jan 2026',
        'Vendor': 'Tekno Event Asia',
        'Kategori Jasa': 'Equipment & Production',
        'Alamat': 'Bandung',
        'Nilai Evaluasi': 88
      },
      {
        'No Event': '2',
        'Event': 'Corporate Gala Dinner',
        'Bulan': 'Februari 2026',
        'Tanggal Event': '10 Feb 2026',
        'Vendor': 'Royal Catering Service',
        'Kategori Jasa': 'Catering',
        'Alamat': 'Jakarta',
        'Nilai Evaluasi': 65
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Evaluasi Vendor');
    XLSX.writeFile(wb, 'Template_Upload_Evaluasi_Vendor.xlsx');
  };

  const handleConfirmImport = () => {
    if (parsedData.length === 0) return;
    onUploadSuccess(parsedData, importMode);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '750px' }}>
        <div className="modal-header">
          <div>
            <h3>Upload Data Evaluasi Vendor (.xlsx / .csv)</h3>
            <p className="modal-subtitle">Perbarui atau tambahkan data evaluasi vendor secara cepat menggunakan file Excel</p>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Action Bar: Download Template & File Input */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <button
              onClick={handleDownloadTemplate}
              style={{
                background: 'var(--ice-100)',
                color: 'var(--navy-900)',
                border: '1px solid var(--sky-200)',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Download size={14} />
              Download Template Excel (.xlsx)
            </button>

            <label
              style={{
                background: 'var(--blue-600)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FileSpreadsheet size={15} />
              Pilih File Excel / CSV
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {file && (
            <div style={{ background: 'var(--ice-50)', border: '1px solid var(--line)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, color: 'var(--navy-950)' }}>
                📁 File Terpilih: {file.name}
              </span>
              <span style={{ color: 'var(--good)', fontWeight: 700, fontSize: '12px' }}>
                {parsedData.length} baris valid terdeteksi
              </span>
            </div>
          )}

          {errorMsg && (
            <div style={{ background: 'var(--poor-bg)', color: 'var(--poor)', border: '1px solid #FCA5A5', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          {/* Import Mode Selection */}
          {parsedData.length > 0 && (
            <div style={{ background: '#F8FAFC', border: '1px solid var(--line)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--navy-950)', marginBottom: '8px' }}>
                Pilih Mode Pembaruan Data:
              </div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: importMode === 'append' ? 700 : 400 }}>
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                  />
                  <span>➕ Tambahkan ke Data Saat Ini (Append)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: importMode === 'replace' ? 700 : 400 }}>
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                  />
                  <span>🔄 Ganti / Timpa Seluruh Data (Replace All)</span>
                </label>
              </div>
            </div>
          )}

          {/* Preview Table */}
          {parsedData.length > 0 && (
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy-950)', marginBottom: '8px' }}>
                Preview Hasil Pembacaan File ({parsedData.length} Data):
              </div>
              <div style={{ maxHeight: '240px', overflowY: 'auto', overflowX: 'auto', border: '1px solid var(--line)', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: 'var(--ice-100)', textTransform: 'uppercase', fontSize: '10.5px', color: 'var(--navy-950)' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Event</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Bulan</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Vendor</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Kategori</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Wilayah</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Nilai</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 15).map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '8px', fontWeight: 600 }}>{row.event}</td>
                        <td style={{ padding: '8px' }}>{row.bulan}</td>
                        <td style={{ padding: '8px', fontWeight: 700, color: 'var(--navy-950)' }}>{row.vendor}</td>
                        <td style={{ padding: '8px' }}>{row.category}</td>
                        <td style={{ padding: '8px' }}>{row.alamat}</td>
                        <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700 }}>{row.nilai}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <span className={`badge-score grade-${row.huruf}`}>{row.huruf}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.length > 15 && (
                <div style={{ fontSize: '11px', color: 'var(--ink-500)', marginTop: '4px', textAlign: 'center' }}>
                  * Menampilkan 15 data pertama dari total {parsedData.length} baris
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
            <button className="btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button
              className="btn-primary"
              disabled={parsedData.length === 0 || isProcessing}
              onClick={handleConfirmImport}
              style={{ opacity: parsedData.length === 0 ? 0.5 : 1, cursor: parsedData.length === 0 ? 'not-allowed' : 'pointer' }}
            >
              <CheckCircle2 size={16} />
              Terapkan &amp; Simpan Data ({parsedData.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
