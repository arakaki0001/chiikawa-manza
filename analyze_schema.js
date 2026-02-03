import fs from 'fs';
import path from 'path';
import * as xlsx from 'xlsx';
import { parse } from 'csv-parse/sync';

const dataDir = path.join(process.cwd(), 'data');

// File names (adjust if necessary)
const files = [
  '商品-2025-10-01-2026-02-01.csv',
  'ちいかわ商品マスタ.xlsx',
  '棚卸表_2026年1月28日作成.xlsx'
];

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`[MISSING] ${file}`);
    return;
  }

  console.log(`\n--- Analyzing: ${file} ---`);
  
  if (file.endsWith('.csv')) {
    const content = fs.readFileSync(filePath);
    // Try to detect encoding (assuming Shift_JIS or UTF-8). 
    // Since we are in simple node, let's try reading as buffer and decode if needed, but for now try utf8/binary.
    // Actually, Japanese CSVs are often Shift_JIS. let's peek.
    // For simplicity, let's just use xlsx to read csv too, it handles things well.
    const workbook = xlsx.read(content, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = xlsx.utils.sheet_to_json(sheet, { header: 1, limit: 1 });
    console.log('Headers:', json[0]);
  } else {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = xlsx.utils.sheet_to_json(sheet, { header: 1, limit: 1 });
    console.log('Headers:', json[0]);
  }
});
