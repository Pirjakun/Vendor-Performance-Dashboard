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

const canonicalVendorMap = new Map();

for (let i = 1; i < slicerRows.length; i++) {
  const v = slicerRows[i][2];
  if (v) {
    const cleanV = v.trim();
    canonicalVendorMap.set(cleanV.toLowerCase(), cleanV);
  }
}

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

function normalizeLocation(loc) {
  if (!loc) return 'Lainnya';
  let l = loc.trim().replace(/^"|"$/g, '');
  if (/yogyakarta|jogja|yogya|yogayakarta/i.test(l)) return 'Yogyakarta';
  if (/bandung/i.test(l)) return 'Bandung';
  if (/jakarta/i.test(l)) return 'Jakarta';
  if (/surabaya/i.test(l)) return 'Surabaya';
  if (/magelang/i.test(l)) return 'Magelang';
  if (/salatiga/i.test(l)) return 'Salatiga';
  if (/medan/i.test(l)) return 'Medan';
  if (/bali/i.test(l)) return 'Bali';
  if (/jawa timur|jatim/i.test(l)) return 'Jawa Timur';
  return 'Lainnya';
}

function normalizeCategory(cat) {
  if (!cat) return 'Lainnya';
  let c = cat.trim().replace(/^"|"$/g, '');
  const lower = c.toLowerCase();

  if (lower === 'activity') return 'Activity';
  if (lower === 'akomodasi') return 'Akomodasi';
  if (lower === 'bali dance') return 'Bali Dance';
  if (lower === 'beverage') return 'Beverage';
  if (lower === 'catering') return 'Catering';
  if (lower === 'decoration' || lower === 'dekorasi') return 'Decoration';
  if (lower === 'documentation' || lower === 'dokumentasi') return 'Documentation';
  if (lower === 'equipment') return 'Equipment';
  if (lower === 'equipment & production') return 'Equipment & Production';
  if (lower === 'event support') return 'Event Support';
  if (lower === 'f&b') return 'F&B';
  if (lower === 'game master') return 'Game Master';
  if (lower === 'gimmick' || lower === 'gimmick/souvenir') return 'Gimmick';
  if (lower === 'intepreter' || lower === 'interpreter' || lower === 'interpreter device') return 'Intepreter';
  if (lower === 'logistik') return 'Logistik';
  if (lower === 'mc') return 'MC';
  if (lower === 'manpower' || lower === 'manpwer' || lower === 'manpower vj' || lower.includes('man power')) return 'Manpower';
  if (lower === 'multimedia') return 'Multimedia';
  if (lower === 'pengharum ruangan') return 'Pengharum Ruangan';
  if (lower === 'photobooth') return 'Photobooth';
  if (lower === 'production' || lower.includes('produksian')) return 'Production';
  if (lower === 'registration') return 'Registration';
  if (lower === 'resto') return 'Resto';
  if (lower === 'show management' || lower === 'show managemnet') return 'Show Management';
  if (lower === 'talent') return 'Talent';
  if (lower === 'talent & decoration') return 'Talent & Decoration';
  if (lower === 'talent interpreter') return 'Talent';
  if (lower === 'transfer handling') return 'Transfer Handling';
  if (lower === 'transport' || lower === 'transportasi') return 'Transport';
  if (lower === 'travel agent') return 'Travel Agent';
  if (lower === 'usher') return 'Usher';
  if (lower === 'venue') return 'Venue';

  return c;
}

// Rule Skor Official:
// Grade A: >= 85 (Sangat direkomendasikan / prioritas repeat order)
// Grade B: 70 - 84.99 (Direkomendasikan dengan monitoring normal)
// Grade C: 55 - 69.99 (Perlu evaluasi dan catatan perbaikan)
// Grade D: < 55 (Perlu perbaikan serius / pertimbangkan alternatif)
function getGradeAndRekom(nilai) {
  const score = Number(nilai) || 0;
  if (score >= 85) {
    return { huruf: 'A', rekomendasi: 'Sangat direkomendasikan / prioritas repeat order' };
  } else if (score >= 70) {
    return { huruf: 'B', rekomendasi: 'Direkomendasikan dengan monitoring normal' };
  } else if (score >= 55) {
    return { huruf: 'C', rekomendasi: 'Perlu evaluasi dan catatan perbaikan' };
  } else {
    return { huruf: 'D', rekomendasi: 'Perlu perbaikan serius / pertimbangkan alternatif' };
  }
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
  const alamat = normalizeLocation(parts[6]);
  const nilai = parseFloat(parts[7]);

  const { huruf, rekomendasi } = getGradeAndRekom(nilai);

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
