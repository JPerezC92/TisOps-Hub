const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'files', 'XD PROBLEMAS NUEVOS.xlsx');

try {
  const workbook = XLSX.readFile(filePath);

  console.log('📊 Sheet Names:', workbook.SheetNames);

  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n\n=== Sheet: ${sheetName} ===`);
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Total rows: ${data.length}`);

    if (data.length > 0) {
      console.log('\n📋 Column names:');
      console.log(Object.keys(data[0]));

      console.log('\n📝 First row sample:');
      console.log(JSON.stringify(data[0], null, 2));

      if (data.length > 1) {
        console.log('\n📝 Second row sample:');
        console.log(JSON.stringify(data[1], null, 2));
      }
    }
  });
} catch (error) {
  console.error('Error:', error.message);
}
