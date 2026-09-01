import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseCsvRows(csvText) {
  let rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const c = csvText[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      row.push(field.trim());
      field = '';
    } else if ((c === '\n' || c === '\r') && !inQuotes) {
      if (c === '\r' && csvText[i+1] === '\n') i++;
      row.push(field.trim());
      if (row.some(f => f)) rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field || row.length > 0) {
    row.push(field.trim());
    if (row.some(f => f)) rows.push(row);
  }
  return rows;
}

// 1. Build Canonical Vendor Lookup Map from Data Evaluasi Vendor(Slicer).csv
const slicerPath = path.join(__dirname, 'Artefak', 'Data Evaluasi Vendor(Slicer).csv');
const slicerRows = parseCsvRows(fs.readFileSync(slicerPath, 'utf8'));

const canonicalVendorMap = new Map(); // lowercase -> exact canonical string

for (let i = 1; i < slicerRows.length; i++) {
  const v = slicerRows[i][2]; // Vendor column
  if (v) {
    const cleanV = v.trim();
    canonicalVendorMap.set(cleanV.toLowerCase(), cleanV);
  }
}

// Custom aliases for typos / abbreviations
const vendorAliases = {
  'o2 show mangement': 'O2 Show Management',
  'pt tekno event asia': 'Tekno Event Asia',
  'pt tea': 'Tekno Event Asia',
  'pt. tekno event asia': 'Tekno Event Asia',
  'tba': 'TBA Event Support'
};

function normalizeVendorName(rawVendor) {
  if (!rawVendor) return rawVendor;
  let v = rawVendor.trim().replace(/^"|"$/g, '');
  const lower = v.toLowerCase();

  if (vendorAliases[lower]) {
    return vendorAliases[lower];
  }
  if (canonicalVendorMap.has(lower)) {
    return canonicalVendorMap.get(lower);
  }
  return v;
}

function normalizeMonth(m) {
  if (!m) return m;
  m = m.trim().replace(/^,\s*/, '');
  if (m === 'Apr-26' || m === 'Apr 2026' || m === 'April-26') return 'April 2026';
  return m;
}

function normalizeCategory(cat) {
  if (!cat) return 'Lainnya';
  let c = cat.trim().replace(/"/g, '');
  if (/dokumentasi|documentation/i.test(c)) return 'Dokumentasi';
  if (/show manage/i.test(c)) return 'Show Management';
  if (/interpreter|intepreter/i.test(c)) return 'Interpreter';
  if (/manpower|manpwer/i.test(c)) return 'Manpower';
  if (/gimmick/i.test(c)) return 'Gimmick & Souvenir';
  if (/resto|f&b|catering|beverage/i.test(c)) return 'F&B & Resto';
  if (/transport/i.test(c)) return 'Transport';
  if (/production|produksian/i.test(c)) return 'Production';
  if (/equipment/i.test(c)) return 'Equipment';
  return c;
}

// 2. Parse Data Evaluasi Vendor(Data).csv
const dataPath = path.join(__dirname, 'Artefak', 'Data Evaluasi Vendor(Data).csv');
const dataLines = fs.readFileSync(dataPath, 'utf8').split(/\r?\n/);

const evaluations = [];
let currentEventNo = '';
let currentEvent = '';
let currentBulan = '';
let currentTgl = '';

for (let i = 2; i < dataLines.length; i++) {
  const line = dataLines[i].trim();
  if (!line) continue;

  const parts = [];
  let inQuotes = false;
  let currentToken = '';

  for (let idx = 0; idx < line.length; idx++) {
    const ch = line[idx];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      parts.push(currentToken.trim());
      currentToken = '';
    } else {
      currentToken += ch;
    }
  }
  parts.push(currentToken.trim());

  if (parts.length < 5) continue;

  if (parts[0]) currentEventNo = parts[0];
  if (parts[1]) currentEvent = parts[1].replace(/^"|"$/g, '');
  if (parts[2]) currentBulan = normalizeMonth(parts[2]);
  if (parts[3]) currentTgl = parts[3].replace(/^"|"$/g, '');

  const rawVendor = parts[4].replace(/^"|"$/g, '');
  const vendor = normalizeVendorName(rawVendor);
  const categoryRaw = parts[5].replace(/^"|"$/g, '');
  const category = normalizeCategory(categoryRaw);
  const alamat = parts[6].replace(/^"|"$/g, '');
  const nilai = parseFloat(parts[7]);
  const huruf = parts[8].replace(/^"|"$/g, '');
  const rekomendasi = parts[9].replace(/^"|"$/g, '');

  if (vendor && !isNaN(nilai)) {
    evaluations.push({
      id: evaluations.length + 1,
      eventNo: currentEventNo,
      event: currentEvent,
      bulan: currentBulan,
      tglEvent: currentTgl,
      vendor: vendor,
      categoryRaw: categoryRaw,
      category: category,
      alamat: alamat,
      nilai: nilai,
      huruf: huruf,
      rekomendasi: rekomendasi
    });
  }
}

console.log('Total parsed evaluations:', evaluations.length);

const uniqueVendorsSet = new Set(evaluations.map(e => e.vendor));
console.log('Total unique vendors after normalization:', uniqueVendorsSet.size);

const jsContent = 'window.EVALUATION_DATA = ' + JSON.stringify(evaluations, null, 2) + ';\n';
fs.writeFileSync(path.join(__dirname, 'data.js'), jsContent, 'utf8');

const initialDataJs = '// Initial dataset parsed from Data Evaluasi Vendor(Data).csv\nexport const initialData = ' + JSON.stringify(evaluations, null, 2) + ';\n';
fs.writeFileSync(path.join(__dirname, 'src', 'data', 'initialData.js'), initialDataJs, 'utf8');
console.log('Saved src/data/initialData.js successfully!');
