// ============================================
// Test Script: Parse EDWarRooms2025.xlsx
// ============================================
// Purpose: Parse and analyze the structure of EDWarRooms2025.xlsx file
// Usage: pnpm exec dotenv -e .env -- node scripts/parse-war-rooms.js
// ============================================

const XLSX = require('xlsx');
const path = require('path');

// ============================================
// Configuration
// ============================================
const FILE_PATH = path.join(__dirname, '../files/EDWarRooms2025.xlsx');

// ============================================
// Parse Excel File
// ============================================

async function parseExcelFile() {
  console.log('📊 Parsing EDWarRooms2025.xlsx');
  console.log('='.repeat(80));
  console.log(`📁 File Path: ${FILE_PATH}\n`);

  try {
    // Read the Excel file
    const workbook = XLSX.readFile(FILE_PATH);

    // 1️⃣ Display Sheet Names
    console.log('1️⃣  Sheet Names:');
    console.log('   ', workbook.SheetNames);
    console.log('');

    // 2️⃣ Analyze each sheet
    workbook.SheetNames.forEach((sheetName, index) => {
      console.log(`${index + 2}️⃣  Analyzing Sheet: "${sheetName}"`);
      console.log('   ' + '-'.repeat(76));

      const worksheet = workbook.Sheets[sheetName];

      // Convert sheet to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (jsonData.length === 0) {
        console.log('   ⚠️  Sheet is empty or has no data rows\n');
        return;
      }

      // Display column headers
      const headers = Object.keys(jsonData[0]);
      console.log(`   📋 Column Headers (${headers.length} columns):`);
      headers.forEach((header, idx) => {
        console.log(`      ${idx + 1}. ${header}`);
      });
      console.log('');

      // Display data info
      console.log(`   📊 Total Rows: ${jsonData.length}`);
      console.log('');

      // Display first 3 sample rows
      console.log(`   📝 Sample Data (First 3 rows):`);
      console.table(jsonData.slice(0, 3));
      console.log('');

      // Analyze data types for each column
      console.log('   🔍 Data Type Analysis:');
      const sampleRow = jsonData[0];
      headers.forEach((header) => {
        const value = sampleRow[header];
        const type = typeof value;
        const sample = String(value).substring(0, 50);
        console.log(`      • ${header}: ${type} (sample: "${sample}")`);
      });
      console.log('');
    });

    // Conclusion
    console.log('='.repeat(80));
    console.log('✅ PARSING COMPLETED');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error parsing Excel file:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// ============================================
// Run Parser
// ============================================
parseExcelFile();
