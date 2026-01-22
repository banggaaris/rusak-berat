// DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const fileName = document.getElementById('fileName');
const previewSection = document.getElementById('previewSection');
const previewBody = document.getElementById('previewBody');
const dataCount = document.getElementById('dataCount');
const startUpload = document.getElementById('startUpload');
const dashboardSection = document.getElementById('dashboardSection');
const generateTimestamp = document.getElementById('generateTimestamp');

// State
let excelData = [];
let stats = { total: 0, success: 0, error: 0, pending: 0 };

// API Configuration
const API_URL = 'https://fusesakti.kemenkeu.go.id/sakti/backend/asset-tetap/assetTrx/savePengembangan';

// Fixed request body values
const FIXED_BODY = {
    kodeJenisTransaksi: "203",
    statusPersetujuan: 1,
    dasarHarga: 1,
    periode: 13,
    kodeKondisi: 3,
    tahunAnggaran: 2025,
    tglPembukuan: "2025-12-30T17:00:00.000Z",
    tglPerolehan: "2018-04-23T17:00:00.000Z",
    tglDasarMutasi: "2025-12-30T17:00:00.000Z",
    noDasarMutasi: "SK NOMOR 77 TAHUN 2025"
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    generateNewTimestamp();
});

function setupEventListeners() {
    // File upload via click
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // Generate timestamp
    generateTimestamp.addEventListener('click', generateNewTimestamp);

    // Start upload
    startUpload.addEventListener('click', startBulkUpload);
}

function generateNewTimestamp() {
    document.getElementById('timestamp').value = Date.now().toString();
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) handleFile(file);
}

function handleFile(file) {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
        alert('Harap upload file Excel (.xlsx atau .xls)');
        return;
    }

    fileName.textContent = `📄 ${file.name}`;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Validate columns
            if (jsonData.length === 0) {
                alert('File Excel kosong!');
                return;
            }

            const requiredCols = ['kodeUakpb', 'kodeBarang', 'noAwal', 'noAkhir'];
            const firstRow = jsonData[0];
            const missingCols = requiredCols.filter(col => !(col in firstRow));

            if (missingCols.length > 0) {
                alert(`Kolom tidak ditemukan: ${missingCols.join(', ')}`);
                return;
            }

            excelData = jsonData;
            renderPreview();
        } catch (error) {
            alert('Gagal membaca file Excel: ' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

function renderPreview() {
    previewBody.innerHTML = '';
    dataCount.textContent = excelData.length;

    excelData.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${row.kodeUakpb || ''}</td>
            <td>${row.kodeBarang || ''}</td>
            <td>${row.noAwal || ''}</td>
            <td>${row.noAkhir || ''}</td>
        `;
        previewBody.appendChild(tr);
    });

    previewSection.style.display = 'block';
}

function getAuthHeaders() {
    const sessionId = document.getElementById('sessionId').value.trim();
    const tokenId = document.getElementById('tokenId').value.trim();
    const timestamp = document.getElementById('timestamp').value.trim();

    if (!sessionId || !tokenId || !timestamp) {
        return null;
    }

    return {
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,id;q=0.7',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Host': 'fusesakti.kemenkeu.go.id',
        'Origin': 'https://sakti.kemenkeu.go.id',
        'Referer': 'https://sakti.kemenkeu.go.id/',
        'SAKTI_SESSION_ID': sessionId,
        'SAKTI_TIMESTAMP': timestamp,
        'SAKTI_TOKEN_ID': tokenId,
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
    };
}

async function startBulkUpload() {
    const headers = getAuthHeaders();
    if (!headers) {
        alert('Harap isi semua field autentikasi!');
        return;
    }

    if (excelData.length === 0) {
        alert('Tidak ada data untuk diupload!');
        return;
    }

    // Show dashboard
    dashboardSection.style.display = 'block';
    startUpload.disabled = true;
    startUpload.textContent = '⏳ Uploading...';

    // Reset stats
    stats = { total: excelData.length, success: 0, error: 0, pending: excelData.length };
    updateStats();
    clearLogs();

    addLog('info', `Memulai upload ${excelData.length} data...`);

    // Process each row
    for (let i = 0; i < excelData.length; i++) {
        const row = excelData[i];
        const rowNum = i + 1;

        addLog('pending', `[${rowNum}/${excelData.length}] Mengupload: ${row.kodeBarang} (${row.noAwal}-${row.noAkhir})...`);

        try {
            const result = await uploadRow(row, headers);
            stats.success++;
            stats.pending--;
            addLog('success', `[${rowNum}/${excelData.length}] ✅ Sukses: ${row.kodeBarang} (${row.noAwal}-${row.noAkhir})`);
        } catch (error) {
            stats.error++;
            stats.pending--;
            addLog('error', `[${rowNum}/${excelData.length}] ❌ Gagal: ${row.kodeBarang} - ${error.message}`);
        }

        updateStats();
        updateProgress();

        // Small delay to avoid overwhelming the server
        await sleep(100);
    }

    addLog('info', `Upload selesai! Sukses: ${stats.success}, Gagal: ${stats.error}`);
    startUpload.disabled = false;
    startUpload.textContent = '🚀 Mulai Upload';
}

async function uploadRow(row, headers) {
    const body = {
        ...FIXED_BODY,
        kodeUakpb: String(row.kodeUakpb),
        kodeBarang: String(row.kodeBarang),
        noAwal: Number(row.noAwal),
        noAkhir: Number(row.noAkhir),
        createdDateTime: new Date().toISOString()
    };

    const response = await fetch(API_URL, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(body),
        credentials: 'include'
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
    }

    return await response.json();
}

function updateStats() {
    document.getElementById('statTotal').textContent = stats.total;
    document.getElementById('statSuccess').textContent = stats.success;
    document.getElementById('statError').textContent = stats.error;
    document.getElementById('statPending').textContent = stats.pending;
}

function updateProgress() {
    const percent = Math.round(((stats.success + stats.error) / stats.total) * 100);
    document.getElementById('progressBar').style.width = percent + '%';
    document.getElementById('progressPercent').textContent = percent;
}

function addLog(type, message) {
    const logContainer = document.getElementById('logContainer');
    const icons = {
        success: '✅',
        error: '❌',
        pending: '⏳',
        info: 'ℹ️'
    };

    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `
        <span class="log-icon">${icons[type]}</span>
        <div class="log-content">
            <span class="log-time">${new Date().toLocaleTimeString('id-ID')}</span>
            <div class="log-message">${message}</div>
        </div>
    `;

    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

function clearLogs() {
    document.getElementById('logContainer').innerHTML = '';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
