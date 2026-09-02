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

  const calculateGrade = (scoreNum) => {
    if (scoreNum >= 85) return 'A';
    if (scoreNum >= 70) return 'B';
    if (scoreNum >= 55) return 'C';
    return 'D';
  };

  const calculateRekomendasi = (huruf, scoreNum) => {
    const g = String(huruf || '').trim().toUpperCase();
    if (g === 'A') return 'Sangat direkomendasikan / prioritas repeat order';
    if (g === 'B') return 'Direkomendasikan dengan monitoring normal';
    if (g === 'C') return 'Perlu evaluasi dan catatan perbaikan';
    if (g === 'D') return 'Perlu perbaikan serius / pertimbangkan alternatif';

    if (scoreNum >= 85) return 'Sangat direkomendasikan / prioritas repeat order';
    if (scoreNum >= 70) return 'Direkomendasikan dengan monitoring normal';
    if (scoreNum >= 55) return 'Perlu evaluasi dan catatan perbaikan';
    return 'Perlu perbaikan serius / pertimbangkan alternatif';
  };

  const normalizeMonth = (m) => {
    if (!m) return 'Januari 2026';
    let str = String(m).trim().replace(/^,\s*/, '');
    if (str === 'Apr-26' || str === 'Apr 2026' || str === 'April-26') return 'April 2026';
    return str;
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

        // Convert sheet to 2D Array to handle title lines above the table
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (rows.length === 0) {
          setErrorMsg('File Excel/CSV tidak memiliki data atau kosong.');
          setParsedData([]);
          setIsProcessing(false);
          return;
        }

        // Find header row index by looking for key words: Vendor, Event, Barang, Nilai, Alamat, etc.
        let headerRowIdx = -1;
        for (let i = 0; i < Math.min(15, rows.length); i++) {
          const lineStr = rows[i].map(c => String(c).toLowerCase().trim()).join(' ');
          if (lineStr.includes('vendor') || lineStr.includes('barang') || lineStr.includes('nilai')) {
            headerRowIdx = i;
            break;
          }
        }

        if (headerRowIdx === -1) {
          setErrorMsg('Gagal menemukan baris header tabel. Pastikan terdapat kolom Vendor, Event, Barang / Jasa, Alamat, NILAI, dst.');
          setParsedData([]);
          setIsProcessing(false);
          return;
        }

        const headerRow = rows[headerRowIdx].map(c => String(c).trim());

        const findColIdx = (possibleNames) => {
          return headerRow.findIndex(h => {
            const clean = h.toLowerCase().replace(/\s+/g, ' ');
            return possibleNames.some(p => clean === p.toLowerCase() || clean.includes(p.toLowerCase()));
          });
        };

        const colEventNo = findColIdx(['no', 'no event', 'id']);
        const colEvent = findColIdx(['event', 'nama event', 'kegiatan']);
        const colBulan = findColIdx(['bulan', 'month']);
        const colTgl = findColIdx(['tgl event', 'tanggal event', 'tgl', 'tanggal', 'date']);
        const colVendor = findColIdx(['vendor', 'nama vendor', 'penyedia']);
        const colCategory = findColIdx(['barang / jasa', 'barang/jasa', 'kategori', 'kategori jasa', 'jenis']);
        const colAlamat = findColIdx(['alamat', 'wilayah', 'kota', 'lokasi']);
        const colNilai = findColIdx(['nilai', 'skor', 'score']);
        const colHuruf = findColIdx(['huruf', 'grade']);
        const colRekom = findColIdx(['rekomendasi', 'rekom']);

        if (colVendor === -1) {
          setErrorMsg('Kolom Vendor tidak ditemukan pada file Excel.');
          setParsedData([]);
          setIsProcessing(false);
          return;
        }

        let currentEventNo = '';
        let currentEvent = '';
        let currentBulan = '';
        let currentTgl = '';

        const normalizedRows = [];

        for (let i = headerRowIdx + 1; i < rows.length; i++) {
          const rowData = rows[i];
          if (!rowData || rowData.every(cell => String(cell).trim() === '')) continue; // Skip empty rows

          const rawVendor = colVendor !== -1 ? String(rowData[colVendor] || '').trim() : '';
          if (!rawVendor) continue; // Skip rows without vendor

          const rawEvtNo = colEventNo !== -1 ? String(rowData[colEventNo] || '').trim() : '';
          const rawEvt = colEvent !== -1 ? String(rowData[colEvent] || '').trim() : '';
          const rawBulan = colBulan !== -1 ? String(rowData[colBulan] || '').trim() : '';
          const rawTgl = colTgl !== -1 ? String(rowData[colTgl] || '').trim() : '';

          if (rawEvtNo) currentEventNo = rawEvtNo;
          if (rawEvt) currentEvent = rawEvt;
          if (rawBulan) currentBulan = rawBulan;
          if (rawTgl) currentTgl = rawTgl;

          const category = colCategory !== -1 && rowData[colCategory] ? String(rowData[colCategory]).trim() : 'Lainnya';
          const alamat = colAlamat !== -1 && rowData[colAlamat] ? String(rowData[colAlamat]).trim() : 'Lainnya';
          const nilaiRaw = colNilai !== -1 ? parseFloat(rowData[colNilai]) || 0 : 0;

          let rawHuruf = colHuruf !== -1 && rowData[colHuruf] ? String(rowData[colHuruf]).trim().toUpperCase() : '';
          if (!rawHuruf) {
            rawHuruf = calculateGrade(nilaiRaw);
          }

          let rawRekom = colRekom !== -1 && rowData[colRekom] ? String(rowData[colRekom]).trim() : '';
          if (!rawRekom) {
            rawRekom = calculateRekomendasi(rawHuruf, nilaiRaw);
          }

          normalizedRows.push({
            eventNo: rawEvtNo || currentEventNo || `${normalizedRows.length + 1}`,
            event: rawEvt || currentEvent || 'Event Tanpa Nama',
            bulan: normalizeMonth(rawBulan || currentBulan),
            tglEvent: rawTgl || currentTgl || '-',
            vendor: rawVendor,
            category: category || 'Lainnya',
            alamat: alamat || 'Lainnya',
            nilai: nilaiRaw,
            huruf: rawHuruf,
            rekomendasi: rawRekom
          });
        }

        if (normalizedRows.length === 0) {
          setErrorMsg('Tidak ada baris data vendor yang valid ditemukan pada file tersebut.');
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
        'Event': 'INUS CONGRESS 2026',
        'BULAN': 'Januari 2026',
        'Tgl Event': '21-24 Januari 2026',
        'Vendor': 'Adhikari Creation',
        'Barang / Jasa': 'Gimmick',
        'Alamat': 'Yogyakarta',
        'NILAI': 86,
        'HURUF': 'A',
        'REKOMENDASI': 'Sangat Direkomendasikan'
      },
      {
        'No': '',
        'Event': 'INUS CONGRESS 2026',
        'BULAN': 'Januari 2026',
        'Tgl Event': '21-24 Januari 2026',
        'Vendor': 'Rama Shinta Resto',
        'Barang / Jasa': 'Resto',
        'Alamat': 'Yogyakarta',
        'NILAI': 86,
        'HURUF': 'A',
        'REKOMENDASI': 'Sangat Direkomendasikan'
      },
      {
        'No': '2',
        'Event': 'WB HEALTHY FUTURE LAUNCH',
        'BULAN': 'Januari 2026',
        'Tgl Event': '22 Januari 2026',
        'Vendor': 'Akasya Catering',
        'Barang / Jasa': 'F&B',
        'Alamat': 'Jakarta',
        'NILAI': 91,
        'HURUF': 'A',
        'REKOMENDASI': 'Sangat Direkomendasikan'
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
      <div className="modal-content" style={{ maxWidth: '820px' }}>
        <div className="modal-header">
          <div>
            <h3>Upload Data Evaluasi Vendor (.xlsx / .csv)</h3>
            <p className="modal-subtitle">
              Format Kolom Resmi: <strong>No | Event | BULAN | Tgl Event | Vendor | Barang / Jasa | Alamat | NILAI | HURUF | REKOMENDASI</strong>
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
              Unduh template jika ingin mencocokkan format kolom:
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
              padding: '26px 20px',
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
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', color: isDragging ? 'var(--blue-600)' : 'var(--navy-900)' }}>
              <Upload size={34} />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy-950)', marginBottom: '4px' }}>
              {isDragging ? 'Lepaskan file di sini...' : 'Tarik & Taruh (Drag & Drop) file Excel / CSV di sini'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-600)' }}>
              atau <span style={{ color: 'var(--blue-600)', textDecoration: 'underline', fontWeight: 600 }}>Klik untuk pilih file</span> dari komputer Anda (.xlsx, .xls, .csv)
            </div>
          </div>

          {file && (
            <div style={{ background: '#F0F9FF', border: '1px solid var(--sky-200)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, color: 'var(--navy-950)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet size={16} style={{ color: 'var(--blue-600)' }} />
                File Terpilih: {file.name}
              </span>
              <span style={{ color: 'var(--good)', fontWeight: 700, fontSize: '12px' }}>
                ✓ {parsedData.length} evaluasi vendor terdeteksi
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
                Pilih Mode Pembaruan Data Dashboard:
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
                Preview Hasil Pembacaan File ({parsedData.length} Evaluasi):
              </div>
              <div style={{ maxHeight: '230px', overflowY: 'auto', overflowX: 'auto', border: '1px solid var(--line)', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: 'var(--ice-100)', textTransform: 'uppercase', fontSize: '10.5px', color: 'var(--navy-950)' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>No</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Nama Event</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Bulan</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Tgl Event</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Vendor</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Barang / Jasa</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Alamat</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Nilai</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Huruf (Grade)</th>
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
                  * Menampilkan 15 evaluasi pertama dari total {parsedData.length} baris data
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
