import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join(__dirname, 'Artefak', 'Data Evaluasi Vendor(Data).csv');
const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split(/\r?\n/);

const evaluations = [];
let currentEventNo = '';
let currentEvent = '';
let currentBulan = '';
let currentTgl = '';

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

for (let i = 2; i < lines.length; i++) {
  const line = lines[i].trim();
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

  const vendor = parts[4].replace(/^"|"$/g, '');
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

const jsContent = 'window.EVALUATION_DATA = ' + JSON.stringify(evaluations, null, 2) + ';\n';
fs.writeFileSync(path.join(__dirname, 'data.js'), jsContent, 'utf8');
console.log('Saved data.js successfully!');

const initialDataJs = '// Initial dataset parsed from Data Evaluasi Vendor(Data).csv\nexport const initialData = ' + JSON.stringify(evaluations, null, 2) + ';\n';
fs.writeFileSync(path.join(__dirname, 'src', 'data', 'initialData.js'), initialDataJs, 'utf8');
console.log('Saved src/data/initialData.js successfully!');
