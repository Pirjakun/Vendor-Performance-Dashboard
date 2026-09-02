import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2, X } from 'lucide-react';

export function ExcelUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [importMode, setImportMode] = useState('append'); // 'append' | 'replace'
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
      const clean = String(h).trim().toLowerCase().replace(/\s+/g, ' ');
      return possibleNames.some(p => {
        const pClean = p.toLowerCase();
        return clean === pClean || clean.includes(pClean);
      });
    });
  };

  const processFile = (selectedFile) => {
    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls') && !fileName.endsWith('.csv')) {
      setErrorMsg('Format file tidak didukung. Harap pilih file .xlsx, .xls, atau .csv');
      return;
    }

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

        // Exact column matching for: No, Event, BULAN, Tgl Event, Vendor, Barang / Jasa, Alamat, NILAI, HURUF, REKOMENDASI
        const keyEventNo = getHeaderKey(headers, ['no', 'no event', 'id']);
        const keyEvent = getHeaderKey(headers, ['event', 'nama event', 'kegiatan']);
        const keyBulan = getHeaderKey(headers, ['bulan', 'month']);
        const keyTgl = getHeaderKey(headers, ['tgl event', 'tanggal event', 'tgl', 'tanggal', 'date']);
        const keyVendor = getHeaderKey(headers, ['vendor', 'nama vendor', 'penyedia']);
        const keyCat = getHeaderKey(headers, ['barang / jasa', 'barang/jasa', 'kategori', 'kategori jasa', 'jenis']);
        const keyAlamat = getHeaderKey(headers, ['alamat', 'wilayah', 'kota', 'lokasi']);
        const keyNilai = getHeaderKey(headers, ['nilai', 'skor', 'score']);
        const keyHuruf = getHeaderKey(headers, ['huruf', 'grade']);
        const keyRekom = getHeaderKey(headers, ['rekomendasi', 'rekom']);

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

          const defaultGrade = calculateGradeAndRekom(nilai);
          const huruf = keyHuruf && row[keyHuruf] ? String(row[keyHuruf]).trim() : defaultGrade.huruf;
          const rekomendasi = keyRekom && row[keyRekom] ? String(row[keyRekom]).trim() : defaultGrade.rekomendasi;

          normalizedRows.push({
            eventNo: rawEvtNo || currentEventNo || `${idx + 1}`,
            event: rawEvt || currentEvent || 'Event Tanpa Nama',
            bulan: rawBulan || currentBulan || 'Januari 2026',
            tglEvent: rawTgl || currentTgl || '-',
            vendor: rawVendor,
            category: category || 'Lainnya',
            alamat: alamat || 'Lainnya',
            nilai,
            huruf: huruf || 'C',
            rekomendasi: rekomendasi || defaultGrade.rekomendasi
          });
        });

        if (normalizedRows.length === 0) {
          setErrorMsg('Tidak ditemukan kolom Vendor yang valid dalam file Excel tersebut.');
          setParsedData([]);
        } else {
          setParsedData(normalizedRows);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Gagal membaca file Excel/CSV. Pastikan format file sesuai.');
        setParsedData([]);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'No': '1',
        'Event': 'Gath Sinergi 2026',
        'BULAN': 'Januari 2026',
        'Tgl Event': '15 Jan 2026',
        'Vendor': 'O2 Show Management',
        'Barang / Jasa': 'Show Management',
        'Alamat': 'Yogyakarta',
        'NILAI': 92,
        'HURUF': 'A',
        'REKOMENDASI': 'Sangat direkomendasikan / prioritas repeat order'
      },
      {
        'No': '1',
        'Event': 'Gath Sinergi 2026',
        'BULAN': 'Januari 2026',
        'Tgl Event': '15 Jan 2026',
        'Vendor': 'Tekno Event Asia',
        'Barang / Jasa': 'Equipment & Production',
        'Alamat': 'Bandung',
        'NILAI': 88,
        'HURUF': 'A',
        'REKOMENDASI': 'Sangat direkomendasikan / prioritas repeat order'
      },
      {
        'No': '2',
        'Event': 'Corporate Gala Dinner',
        'BULAN': 'Februari 2026',
        'Tgl Event': '10 Feb 2026',
        'Vendor': 'Royal Catering Service',
        'Barang / Jasa': 'Catering',
        'Alamat': 'Jakarta',
        'NILAI': 65,
        'HURUF': 'C',
        'REKOMENDASI': 'Perlu evaluasi dan catatan perbaikan'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Evaluasi Vendor');
    XLSX.writeFile(wb, 'Template_Evaluasi_Vendor.xlsx');
  };

  const handleConfirmImport = () => {
    if (parsedData.length === 0) return;
    onUploadSuccess(parsedData, importMode);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '760px' }}>
        <div className="modal-header">
          <div>
            <h3>Upload Data Evaluasi Vendor (.xlsx / .csv)</h3>
            <p className="modal-subtitle">
              Format Kolom: <strong>No | Event | BULAN | Tgl Event | Vendor | Barang / Jasa | Alamat | NILAI | HURUF | REKOMENDASI</strong>
            </p>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Action Bar: Download Template */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '12.5px', color: 'var(--ink-600)' }}>
              Silakan unduh template jika belum memiliki format file yang sesuai:
            </span>
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
          </div>

          {/* Drag and Drop Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: isDragging ? '2px dashed var(--blue-600)' : '2px dashed var(--sky-400)',
              background: isDragging ? 'rgba(37, 99, 201, 0.08)' : 'var(--ice-50)',
              borderRadius: '12px',
              padding: '28px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '16px'
            }}
            onClick={() => document.getElementById('excel-file-input').click()}
          >
            <input
              id="excel-file-input"
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px', color: isDragging ? 'var(--blue-600)' : 'var(--navy-900)' }}>
              <Upload size={36} />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy-950)', marginBottom: '4px' }}>
              {isDragging ? 'Lepaskan file di sini...' : 'Tarik & Taruh (Drag & Drop) file Excel / CSV di sini'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-600)' }}>
              atau <span style={{ color: 'var(--blue-600)', textDecoration: 'underline', fontWeight: 600 }}>Klik untuk memilih file</span> dari komputer Anda (.xlsx, .xls, .csv)
            </div>
          </div>

          {file && (
            <div style={{ background: '#F0F9FF', border: '1px solid var(--sky-200)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, color: 'var(--navy-950)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet size={16} style={{ color: 'var(--blue-600)' }} />
                File Terpilih: {file.name}
              </span>
              <span style={{ color: 'var(--good)', fontWeight: 700, fontSize: '12px' }}>
                ✓ {parsedData.length} baris valid terdeteksi
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
              <div style={{ maxHeight: '220px', overflowY: 'auto', overflowX: 'auto', border: '1px solid var(--line)', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: 'var(--ice-100)', textTransform: 'uppercase', fontSize: '10.5px', color: 'var(--navy-950)' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>No</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Event</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>BULAN</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Tgl Event</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Vendor</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Barang / Jasa</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Alamat</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>NILAI</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>HURUF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 15).map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '8px' }}>{row.eventNo}</td>
                        <td style={{ padding: '8px', fontWeight: 600 }}>{row.event}</td>
                        <td style={{ padding: '8px' }}>{row.bulan}</td>
                        <td style={{ padding: '8px' }}>{row.tglEvent}</td>
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
