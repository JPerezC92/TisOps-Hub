// ============================================
// Test Script: REP01 Tags Upload Test
// ============================================
// Purpose: Test the REP01 Tags upload endpoint with actual Excel file
// Usage: pnpm exec dotenv -e .env -- node scripts/test-rep01-upload.js
// ============================================

const fs = require('fs');
const path = require('path');
const http = require('http');

// ============================================
// Configuration
// ============================================
const API_URL = 'http://localhost:3000/rep01-tags/upload';
const FILE_PATH = path.join(__dirname, '../../../REP01 XD TAG 2025.xlsx');

console.log('🚀 REP01 Tags Upload Test Script');
console.log('================================\n');

// ============================================
// Validate File
// ============================================
if (!fs.existsSync(FILE_PATH)) {
  console.error('❌ Error: File not found at:', FILE_PATH);
  process.exit(1);
}

const fileStats = fs.statSync(FILE_PATH);
console.log('✓ File found:', path.basename(FILE_PATH));
console.log('✓ File size:', (fileStats.size / 1024).toFixed(2), 'KB');
console.log('✓ API URL:', API_URL);
console.log('\n📤 Starting upload...\n');

// ============================================
// Create Multipart Form Data Manually
// ============================================
function createMultipartFormData(filePath, fileName) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const fileBuffer = fs.readFileSync(filePath);

  const parts = [];

  // Add file field
  parts.push(Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
    `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n`
  ));

  parts.push(fileBuffer);
  parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

  return {
    boundary,
    body: Buffer.concat(parts)
  };
}

// ============================================
// Upload Function
// ============================================
async function uploadFile() {
  const startTime = Date.now();
  const formData = createMultipartFormData(FILE_PATH, 'REP01 XD TAG 2025.xlsx');

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/rep01-tags/upload',
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${formData.boundary}`,
      'Content-Length': formData.body.length
    },
    timeout: 120000 // 2 minutes timeout
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      console.log('📡 Response Status:', res.statusCode);

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log('⏱️  Duration:', duration, 'seconds\n');
        console.log('📦 Response Body:');
        console.log('================================');

        try {
          const jsonData = JSON.parse(data);
          console.log(JSON.stringify(jsonData, null, 2));

          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('\n✅ Upload successful!');

            if (jsonData.recordsCreated !== undefined) {
              console.log(`   • Records created: ${jsonData.recordsCreated}`);
            }
            if (jsonData.recordsUpdated !== undefined) {
              console.log(`   • Records updated: ${jsonData.recordsUpdated}`);
            }
            if (jsonData.totalRecords !== undefined) {
              console.log(`   • Total records: ${jsonData.totalRecords}`);
            }

            resolve(jsonData);
          } else {
            console.log('\n❌ Upload failed with status:', res.statusCode);
            reject(new Error(`HTTP ${res.statusCode}: ${jsonData.message || 'Unknown error'}`));
          }
        } catch (e) {
          console.log(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('\n✅ Upload successful (non-JSON response)');
            resolve({ success: true });
          } else {
            console.log('\n❌ Upload failed');
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        }
      });
    });

    req.on('error', (error) => {
      console.error('\n❌ Request Error:', error.message);
      console.error('\nPossible issues:');
      console.error('  • Is the API server running on port 3000?');
      console.error('  • Check if the endpoint is accessible');
      console.error('  • Verify network connectivity');
      reject(error);
    });

    req.on('timeout', () => {
      console.error('\n❌ Request timed out after 2 minutes');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    // Write the request body
    req.write(formData.body);
    req.end();

    // Show progress indicator
    let dots = 0;
    const progressInterval = setInterval(() => {
      dots = (dots + 1) % 4;
      process.stdout.write(`\r⏳ Uploading${'.'.repeat(dots)}${' '.repeat(3 - dots)}`);
    }, 500);

    req.on('close', () => {
      clearInterval(progressInterval);
      process.stdout.write('\r');
    });
  });
}

// ============================================
// Run Upload Test
// ============================================
uploadFile()
  .then(() => {
    console.log('\n' + '='.repeat(80));
    console.log('✅ TEST COMPLETED SUCCESSFULLY');
    console.log('='.repeat(80));
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n' + '='.repeat(80));
    console.error('❌ TEST FAILED');
    console.error('='.repeat(80));
    console.error('Error:', error.message);
    process.exit(1);
  });
