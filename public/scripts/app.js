// ==================== STATE ====================
let currentTab = "upload";
let uploadData = [];
let hentiGunaData = [];
let deleteData = [];
let validasiData = [];
let approveData = [];
let stats = { total: 0, success: 0, error: 0, pending: 0 };

// Fixed request body values for upload (rusak-berat)
const FIXED_BODY = {
    kodeJenisTransaksi: "203",
    statusPersetujuan: 1,
    dasarHarga: 1,
    periode: 13,
    kodeKondisi: 3,
    tahunAnggaran: 2025,
    tglPembukuan: "2025-12-30T17:00:00.000Z",
    tglDasarMutasi: "2025-12-30T17:00:00.000Z",
    noDasarMutasi: "SK NOMOR 77 TAHUN 2025"
};

// Fixed request body values for henti-guna
const HENTI_GUNA_BODY = {
    id: "",
    tahunAnggaran: 2025,
    tglPembukuan: "2025-12-30T17:00:00.000Z",
    keterangan: "SK Penghentian Penggunaan",
    kodeJenisTransaksi: "401",
    noDasarMutasi: "SK NOMOR 77 TAHUN 2025",
    tglDasarMutasi: "2025-12-30T17:00:00.000Z",
    statusPersetujuan: 1,
    periode: 13,
    jenisDokumen: 31
};

// Hardcoded loginWrapper for validasi
const LOGIN_WRAPPER = {
    dekon2: "KP",
    dekonDesc: "Kantor Pusat",
    dekonId: "1",
    deptDesc: "KEMENTERIAN KEHUTANAN",
    deptId: "143",
    email: "lenn0029@sakti.mail.go.id",
    jenisLogin: 1,
    jenisSatkerDesc: "PERMANEN-PUSAT (Fixed Satker in Central)",
    jenisSatkerId: "1",
    kanwilDjpbDesc: "JAKARTA",
    kanwilDjpbId: "11",
    kodeBaPelaksana: null,
    kodeEs1Pelaksana: null,
    kodeWilayah: "0199",
    kppnDesc: "Jakarta VII",
    kppnId: "182",
    levelNik: 100,
    listRoles: ["AST_UAKPB_VALIDATOR"],
    lokasiSatker: "01.00",
    nama: "LENNY JUANITA SARI",
    nik: "3175016406750001",
    nip: "197506242000032003",
    role: 2,
    satkerDesc: "KANTOR PUSAT SEKRETARIAT JENDERAL KEMENTERIAN  KEHUTANAN",
    satkerId: "693521",
    sessionId: null,
    status: false,
    tahunAnggaran: 2025,
    tahunAnggaranId: "2025",
    tahunAnggaranTanggalAkhir: "2025-12-31T23:59:59.708Z",
    tahunAnggaranTanggalAwal: "2025-01-01T23:59:59.708Z",
    telpon: "081291129872",
    uakpbId: "143010199693521007KP",
    unitDesc: "SEKRETARIAT JENDERAL",
    unitId: "143.01",
    unitKode: "01",
    unitTeknis: "69352100",
    userId: "val_693521_197506242000032003"
};

// Hardcoded loginWrapper for approver
const APPROVER_LOGIN_WRAPPER = {
    dekon2: "KP",
    dekonDesc: "Kantor Pusat",
    dekonId: "1",
    deptDesc: "KEMENTERIAN KEHUTANAN",
    deptId: "143",
    email: "bang0058@sakti.mail.go.id",
    jenisLogin: 1,
    jenisSatkerDesc: "PERMANEN-PUSAT (Fixed Satker in Central)",
    jenisSatkerId: "1",
    kanwilDjpbDesc: "JAKARTA",
    kanwilDjpbId: "11",
    kodeBaPelaksana: null,
    kodeEs1Pelaksana: null,
    kodeWilayah: "0199",
    kppnDesc: "Jakarta VII",
    kppnId: "182",
    levelNik: 100,
    listRoles: ["AST_UAKPB_APPROVER", "PER_APPROVER_INDUK"],
    lokasiSatker: "01.00",
    nama: "BANGGA ARI SAPUTRA",
    nik: "3175071004930006",
    nip: "199304102020121006",
    role: 3,
    satkerDesc: "KANTOR PUSAT SEKRETARIAT JENDERAL KEMENTERIAN  KEHUTANAN",
    satkerId: "693521",
    sessionId: null,
    status: false,
    tahunAnggaran: 2025,
    tahunAnggaranId: "2025",
    tahunAnggaranTanggalAkhir: "2025-12-31T01:23:42.785Z",
    tahunAnggaranTanggalAwal: "2025-01-01T01:23:42.785Z",
    telpon: "08978284085",
    uakpbId: "143010199693521007KP",
    unitDesc: "SEKRETARIAT JENDERAL",
    unitId: "143.01",
    unitKode: "01",
    unitTeknis: "69352100",
    userId: "apr_693521_199304102020121006"
};

// ==================== INITIALIZE ====================
document.addEventListener("DOMContentLoaded", () => {
    setupTabs();
    setupUploadEvents();
    setupHentiGunaEvents();
    setupDeleteEvents();
    setupValidasiEvents();
    setupApproveEvents();
    generateNewTimestamp();
});

// ==================== TABS ====================
function setupTabs() {
    document.querySelectorAll(".tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
            tab.classList.add("active");
            currentTab = tab.dataset.tab;
            document.getElementById(currentTab + "Tab").classList.add("active");
        });
    });
}

// ==================== AUTH ====================
function generateNewTimestamp() {
    document.getElementById("timestamp").value = Date.now().toString();
}

function getAuthCredentials() {
    const sessionId = document.getElementById("sessionId").value.trim();
    const tokenId = document.getElementById("tokenId").value.trim();
    const timestamp = document.getElementById("timestamp").value.trim();
    if (!sessionId || !tokenId || !timestamp) return null;
    return { sessionId, tokenId, timestamp };
}

// ==================== UPLOAD EVENTS ====================
function setupUploadEvents() {
    const uploadArea = document.getElementById("uploadArea");
    const fileInput = document.getElementById("fileInput");

    uploadArea.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", e => handleUploadFile(e.target.files[0]));

    uploadArea.addEventListener("dragover", e => { e.preventDefault(); uploadArea.classList.add("dragover"); });
    uploadArea.addEventListener("dragleave", () => uploadArea.classList.remove("dragover"));
    uploadArea.addEventListener("drop", e => {
        e.preventDefault();
        uploadArea.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) handleUploadFile(e.dataTransfer.files[0]);
    });

    document.getElementById("generateTimestamp").addEventListener("click", generateNewTimestamp);
    document.getElementById("startUpload").addEventListener("click", startBulkUpload);
}

function handleUploadFile(file) {
    if (!file || !file.name.match(/\.(xlsx|xls)$/i)) {
        alert("Harap upload file Excel (.xlsx atau .xls)");
        return;
    }

    document.getElementById("fileName").textContent = "📄 " + file.name;

    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

            if (jsonData.length === 0) { alert("File Excel kosong!"); return; }

            const requiredCols = ["kodeUakpb", "kodeBarang", "noAwal", "noAkhir", "tglPerolehan"];
            const missingCols = requiredCols.filter(col => !(col in jsonData[0]));
            if (missingCols.length > 0) { alert("Kolom tidak ditemukan: " + missingCols.join(", ")); return; }

            uploadData = jsonData;
            renderUploadPreview();
        } catch (error) {
            alert("Gagal membaca file: " + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

function renderUploadPreview() {
    const tbody = document.getElementById("previewBody");
    tbody.innerHTML = "";
    document.getElementById("dataCount").textContent = uploadData.length;

    uploadData.forEach((row, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = "<td>" + (i + 1) + "</td><td>" + (row.kodeUakpb || "") + "</td><td>" + (row.kodeBarang || "") + "</td><td>" + (row.noAwal || "") + "</td><td>" + (row.noAkhir || "") + "</td><td>" + (row.tglPerolehan || "") + "</td>";
        tbody.appendChild(tr);
    });

    document.getElementById("previewSection").style.display = "block";
}

async function startBulkUpload() {
    const auth = getAuthCredentials();
    if (!auth) { alert("Harap isi semua field autentikasi!"); return; }
    if (uploadData.length === 0) { alert("Tidak ada data untuk diupload!"); return; }

    showDashboard(uploadData.length);
    document.getElementById("startUpload").disabled = true;
    document.getElementById("startUpload").textContent = "⏳ Uploading...";

    addLog("info", "Memulai upload " + uploadData.length + " data...");

    for (let i = 0; i < uploadData.length; i++) {
        const row = uploadData[i];
        addLog("pending", "[" + (i + 1) + "/" + uploadData.length + "] Mengupload: " + row.kodeBarang + "...");

        try {
            await uploadRow(row, auth);
            stats.success++;
            addLog("success", "[" + (i + 1) + "/" + uploadData.length + "] ✅ Sukses: " + row.kodeBarang);
        } catch (error) {
            stats.error++;
            addLog("error", "[" + (i + 1) + "/" + uploadData.length + "] ❌ Gagal: " + row.kodeBarang + " - " + error.message);
        }

        stats.pending--;
        updateDashboard();
        await sleep(100);
    }

    addLog("info", "Upload selesai! Sukses: " + stats.success + ", Gagal: " + stats.error);
    document.getElementById("startUpload").disabled = false;
    document.getElementById("startUpload").textContent = "🚀 Mulai Upload";
}

async function uploadRow(row, auth) {
    let tglPerolehan = row.tglPerolehan;
    if (typeof tglPerolehan === "number") {
        const excelEpoch = new Date(1899, 11, 30);
        tglPerolehan = new Date(excelEpoch.getTime() + tglPerolehan * 86400000).toISOString();
    } else if (typeof tglPerolehan === "string") {
        tglPerolehan = new Date(tglPerolehan).toISOString();
    }

    const body = Object.assign({}, FIXED_BODY, {
        kodeUakpb: String(row.kodeUakpb),
        kodeBarang: String(row.kodeBarang),
        noAwal: Number(row.noAwal),
        noAkhir: Number(row.noAkhir),
        tglPerolehan: tglPerolehan,
        createdDateTime: new Date().toISOString(),
        _headers: auth
    });

    const response = await fetch("/api/proxy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error("HTTP " + response.status + ": " + errorText.substring(0, 100));
    }
    return await response.json();
}

// ==================== HENTI-GUNA EVENTS ====================
function setupHentiGunaEvents() {
    const hentiGunaArea = document.getElementById("hentiGunaUploadArea");
    const hentiGunaInput = document.getElementById("hentiGunaFileInput");

    hentiGunaArea.addEventListener("click", () => hentiGunaInput.click());
    hentiGunaInput.addEventListener("change", e => handleHentiGunaFile(e.target.files[0]));

    hentiGunaArea.addEventListener("dragover", e => { e.preventDefault(); hentiGunaArea.classList.add("dragover"); });
    hentiGunaArea.addEventListener("dragleave", () => hentiGunaArea.classList.remove("dragover"));
    hentiGunaArea.addEventListener("drop", e => {
        e.preventDefault();
        hentiGunaArea.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) handleHentiGunaFile(e.dataTransfer.files[0]);
    });

    document.getElementById("startHentiGunaUpload").addEventListener("click", startBulkHentiGunaUpload);
}

function handleHentiGunaFile(file) {
    if (!file || !file.name.match(/\.(xlsx|xls)$/i)) {
        alert("Harap upload file Excel (.xlsx atau .xls)");
        return;
    }

    document.getElementById("hentiGunaFileName").textContent = "📄 " + file.name;

    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

            if (jsonData.length === 0) { alert("File Excel kosong!"); return; }

            const requiredCols = ["noSPPA", "kodeUakpb", "kodeBarang", "namaBarang", "noAwal", "noAkhir", "tglPerolehan"];
            const missingCols = requiredCols.filter(col => !(col in jsonData[0]));
            if (missingCols.length > 0) { alert("Kolom tidak ditemukan: " + missingCols.join(", ")); return; }

            hentiGunaData = jsonData;
            renderHentiGunaPreview();
        } catch (error) {
            alert("Gagal membaca file: " + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

function renderHentiGunaPreview() {
    const tbody = document.getElementById("hentiGunaPreviewBody");
    tbody.innerHTML = "";
    document.getElementById("hentiGunaDataCount").textContent = hentiGunaData.length;

    hentiGunaData.forEach((row, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = "<td>" + (i + 1) + "</td><td>" + (row.noSPPA || "") + "</td><td>" + (row.kodeUakpb || "") + "</td><td>" + (row.kodeBarang || "") + "</td><td>" + (row.namaBarang || "") + "</td><td>" + (row.noAwal || "") + "</td><td>" + (row.noAkhir || "") + "</td><td>" + (row.tglPerolehan || "") + "</td>";
        tbody.appendChild(tr);
    });

    document.getElementById("hentiGunaPreviewSection").style.display = "block";
}

async function startBulkHentiGunaUpload() {
    const auth = getAuthCredentials();
    if (!auth) { alert("Harap isi semua field autentikasi!"); return; }
    if (hentiGunaData.length === 0) { alert("Tidak ada data untuk diupload!"); return; }

    showDashboard(hentiGunaData.length);
    document.getElementById("startHentiGunaUpload").disabled = true;
    document.getElementById("startHentiGunaUpload").textContent = "⏳ Uploading...";

    addLog("info", "Memulai upload Henti-Guna " + hentiGunaData.length + " data...");

    for (let i = 0; i < hentiGunaData.length; i++) {
        const row = hentiGunaData[i];
        addLog("pending", "[" + (i + 1) + "/" + hentiGunaData.length + "] Mengupload: " + row.kodeBarang + "...");

        try {
            await uploadHentiGunaRow(row, auth);
            stats.success++;
            addLog("success", "[" + (i + 1) + "/" + hentiGunaData.length + "] ✅ Sukses: " + row.kodeBarang);
        } catch (error) {
            stats.error++;
            addLog("error", "[" + (i + 1) + "/" + hentiGunaData.length + "] ❌ Gagal: " + row.kodeBarang + " - " + error.message);
        }

        stats.pending--;
        updateDashboard();
        await sleep(100);
    }

    addLog("info", "Upload Henti-Guna selesai! Sukses: " + stats.success + ", Gagal: " + stats.error);
    document.getElementById("startHentiGunaUpload").disabled = false;
    document.getElementById("startHentiGunaUpload").textContent = "🚀 Mulai Upload Henti Guna";
}

async function uploadHentiGunaRow(row, auth) {
    let tglPerolehan = row.tglPerolehan;
    if (typeof tglPerolehan === "number") {
        const excelEpoch = new Date(1899, 11, 30);
        tglPerolehan = new Date(excelEpoch.getTime() + tglPerolehan * 86400000).toISOString();
    } else if (typeof tglPerolehan === "string") {
        tglPerolehan = new Date(tglPerolehan).toISOString();
    }

    const body = Object.assign({}, HENTI_GUNA_BODY, {
        noSPPA: String(row.noSPPA),
        kodeUakpb: String(row.kodeUakpb),
        kodeBarang: String(row.kodeBarang),
        namaBarang: String(row.namaBarang),
        noAwal: Number(row.noAwal),
        noAkhir: Number(row.noAkhir),
        tglPerolehan: tglPerolehan,
        createdDateTime: new Date().toISOString(),
        _headers: auth
    });

    const response = await fetch("/api/henti-guna", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error("HTTP " + response.status + ": " + errorText.substring(0, 100));
    }
    return await response.json();
}

// ==================== DELETE EVENTS ====================
function setupDeleteEvents() {
    const deleteArea = document.getElementById("deleteUploadArea");
    const deleteInput = document.getElementById("deleteFileInput");

    deleteArea.addEventListener("click", () => deleteInput.click());
    deleteInput.addEventListener("change", e => handleDeleteFile(e.target.files[0]));

    deleteArea.addEventListener("dragover", e => { e.preventDefault(); deleteArea.classList.add("dragover"); });
    deleteArea.addEventListener("dragleave", () => deleteArea.classList.remove("dragover"));
    deleteArea.addEventListener("drop", e => {
        e.preventDefault();
        deleteArea.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) handleDeleteFile(e.dataTransfer.files[0]);
    });

    document.getElementById("startDelete").addEventListener("click", startBulkDelete);
}

function handleDeleteFile(file) {
    if (!file || !file.name.match(/\.(xlsx|xls)$/i)) {
        alert("Harap upload file Excel (.xlsx atau .xls)");
        return;
    }

    document.getElementById("deleteFileName").textContent = "📄 " + file.name;

    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

            if (jsonData.length === 0) { alert("File Excel kosong!"); return; }
            if (!("object" in jsonData[0])) { alert('Kolom "object" tidak ditemukan!'); return; }

            deleteData = jsonData;
            renderDeletePreview();
        } catch (error) {
            alert("Gagal membaca file: " + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

function renderDeletePreview() {
    const tbody = document.getElementById("deletePreviewBody");
    tbody.innerHTML = "";
    document.getElementById("deleteDataCount").textContent = deleteData.length;

    deleteData.forEach((row, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = "<td>" + (i + 1) + "</td><td>" + (row.object || "") + "</td>";
        tbody.appendChild(tr);
    });

    document.getElementById("deletePreviewSection").style.display = "block";
}

async function startBulkDelete() {
    const auth = getAuthCredentials();
    if (!auth) { alert("Harap isi semua field autentikasi!"); return; }
    if (deleteData.length === 0) { alert("Tidak ada data untuk dihapus!"); return; }

    if (!confirm("⚠️ PERINGATAN!\n\nAnda akan menghapus " + deleteData.length + " data.\nAksi ini tidak dapat dibatalkan.\n\nLanjutkan?")) {
        return;
    }

    showDashboard(deleteData.length);
    document.getElementById("startDelete").disabled = true;
    document.getElementById("startDelete").textContent = "⏳ Deleting...";

    addLog("info", "Memulai delete " + deleteData.length + " data...");

    for (let i = 0; i < deleteData.length; i++) {
        const row = deleteData[i];
        addLog("pending", "[" + (i + 1) + "/" + deleteData.length + "] Menghapus object: " + row.object + "...");

        try {
            await deleteRow(row, auth);
            stats.success++;
            addLog("success", "[" + (i + 1) + "/" + deleteData.length + "] ✅ Sukses hapus: " + row.object);
        } catch (error) {
            stats.error++;
            addLog("error", "[" + (i + 1) + "/" + deleteData.length + "] ❌ Gagal: " + row.object + " - " + error.message);
        }

        stats.pending--;
        updateDashboard();
        await sleep(100);
    }

    addLog("info", "Delete selesai! Sukses: " + stats.success + ", Gagal: " + stats.error);
    document.getElementById("startDelete").disabled = false;
    document.getElementById("startDelete").textContent = "🗑️ Mulai Delete";
}

async function deleteRow(row, auth) {
    const response = await fetch("/api/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            object: Number(row.object),
            _headers: auth
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error("HTTP " + response.status + ": " + errorText.substring(0, 100));
    }
    return await response.json();
}

// ==================== VALIDASI EVENTS ====================
function setupValidasiEvents() {
    document.getElementById("btnFetchData").addEventListener("click", fetchValidasiData);
    document.getElementById("btnValidate").addEventListener("click", startValidation);
    document.getElementById("valSelectAll").addEventListener("change", e => {
        document.querySelectorAll(".val-checkbox").forEach(cb => cb.checked = e.target.checked);
        updateSelectedCount();
    });
}

async function fetchValidasiData() {
    const auth = getAuthCredentials();
    if (!auth) { alert("Harap isi semua field autentikasi!"); return; }

    const kodeUakpb = document.getElementById("valKodeUakpb").value.trim();
    const currentPage = document.getElementById("valCurrentPage").value;
    const pageSize = document.getElementById("valPageSize").value;

    if (!kodeUakpb) { alert("Harap isi Kode UAKPB!"); return; }

    document.getElementById("btnFetchData").disabled = true;
    document.getElementById("btnFetchData").textContent = "⏳ Loading...";

    try {
        const response = await fetch("/api/find-persetujuan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                _headers: auth,
                kodeUakpb: kodeUakpb,
                currentPage: Number(currentPage),
                pageSize: Number(pageSize)
            })
        });

        const result = await response.json();

        if (result.status && result.object && result.object.dataList) {
            validasiData = result.object.dataList;
            const pagingInfo = result.object.pagingInfo;

            document.getElementById("valTotalCount").textContent = result.object.totalRowCount || validasiData.length;
            document.getElementById("valCurrentPageInfo").textContent = pagingInfo.currentPage;
            document.getElementById("valPageCount").textContent = pagingInfo.pageCount;

            renderValidasiResults();
            document.getElementById("valResultsSection").style.display = "block";
        } else {
            alert("Error: " + (result.message || "Tidak ada data"));
        }
    } catch (error) {
        alert("Error: " + error.message);
    }

    document.getElementById("btnFetchData").disabled = false;
    document.getElementById("btnFetchData").textContent = "🔍 Cari Data";
}

function renderValidasiResults() {
    const tbody = document.getElementById("valResultsBody");
    tbody.innerHTML = "";

    validasiData.forEach((item, i) => {
        const tr = document.createElement("tr");
        const tglPerolehan = item.tglPerolehan ? new Date(item.tglPerolehan).toLocaleDateString("id-ID") : "-";
        tr.innerHTML =
            '<td><input type="checkbox" class="val-checkbox" data-index="' + i + '" onchange="updateSelectedCount()"></td>' +
            "<td>" + item.id + "</td>" +
            "<td>" + (item.noSPPA || "-") + "</td>" +
            "<td>" + (item.kodeBarang || "-") + "</td>" +
            "<td>" + (item.namaBarang || "-") + "</td>" +
            "<td>" + item.noAwal + "-" + item.noAkhir + "</td>" +
            "<td>" + tglPerolehan + "</td>";
        tbody.appendChild(tr);
    });

    updateSelectedCount();
}

function updateSelectedCount() {
    const count = document.querySelectorAll(".val-checkbox:checked").length;
    document.getElementById("valSelectedCount").textContent = count;
}

async function startValidation() {
    const auth = getAuthCredentials();
    if (!auth) { alert("Harap isi semua field autentikasi!"); return; }

    const selectedItems = [];
    document.querySelectorAll(".val-checkbox:checked").forEach(cb => {
        const index = parseInt(cb.dataset.index);
        const item = validasiData[index];
        selectedItems.push({
            ...item,
            selected: true,
            statusPersetujuan: "2",
            tglPembukuan: "2025-12-30T17:00:00.000Z"
        });
    });

    if (selectedItems.length === 0) {
        alert("Pilih minimal 1 item untuk divalidasi!");
        return;
    }

    if (!confirm("Anda akan memvalidasi " + selectedItems.length + " item. Lanjutkan?")) {
        return;
    }

    document.getElementById("valStatusSection").style.display = "block";
    document.getElementById("btnValidate").disabled = true;
    document.getElementById("btnValidate").textContent = "⏳ Processing...";

    const logContainer = document.getElementById("valLogContainer");
    logContainer.innerHTML = "";

    addValLog("info", "Memulai validasi " + selectedItems.length + " item...");

    addValLog("pending", "Step 1/2: Menjalankan validasi...");
    try {
        const validateResponse = await fetch("/api/validate-persetujuan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                _headers: auth,
                listPersetujuanWrapper: selectedItems
            })
        });

        const validateResult = await validateResponse.json();

        if (!validateResult.status) {
            addValLog("error", "Validasi gagal: " + (validateResult.message || "Unknown error"));
            resetValidateButton();
            return;
        }

        addValLog("success", "Step 1/2: Validasi berhasil!");
        addValLog("pending", "Step 2/2: Menyimpan persetujuan...");

        const saveResponse = await fetch("/api/save-persetujuan", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                _headers: auth,
                listPersetujuanWrapper: selectedItems,
                loginWrapper: LOGIN_WRAPPER
            })
        });

        const saveResult = await saveResponse.json();

        if (saveResult.status) {
            addValLog("success", "Step 2/2: Persetujuan berhasil disimpan!");
            addValLog("info", "✅ Proses validasi selesai! " + selectedItems.length + " item telah disetujui.");
        } else {
            addValLog("error", "Gagal menyimpan: " + (saveResult.message || "Unknown error"));
        }

    } catch (error) {
        addValLog("error", "Error: " + error.message);
    }

    resetValidateButton();
}

function resetValidateButton() {
    document.getElementById("btnValidate").disabled = false;
    document.getElementById("btnValidate").innerHTML = '✅ Validasi & Setujui (<span id="valSelectedCount">' + document.querySelectorAll(".val-checkbox:checked").length + "</span> item)";
}

function addValLog(type, message) {
    const logContainer = document.getElementById("valLogContainer");
    const icons = { success: "✅", error: "❌", pending: "⏳", info: "ℹ️" };
    const entry = document.createElement("div");
    entry.className = "log-entry " + type;
    entry.innerHTML = '<span class="log-icon">' + icons[type] + '</span><div class="log-content"><span class="log-time">' + new Date().toLocaleTimeString("id-ID") + '</span><div class="log-message">' + message + "</div></div>";
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// ==================== APPROVE EVENTS ====================
function setupApproveEvents() {
    document.getElementById("btnFetchApprove").addEventListener("click", fetchApproveData);
    document.getElementById("btnApprove").addEventListener("click", startApproval);
    document.getElementById("aprSelectAll").addEventListener("change", e => {
        document.querySelectorAll(".apr-checkbox").forEach(cb => cb.checked = e.target.checked);
        updateApproveSelectedCount();
    });
}

async function fetchApproveData() {
    const auth = getAuthCredentials();
    if (!auth) { alert("Harap isi semua field autentikasi!"); return; }

    const kodeUakpb = document.getElementById("aprKodeUakpb").value.trim();
    const currentPage = document.getElementById("aprCurrentPage").value;
    const pageSize = document.getElementById("aprPageSize").value;

    if (!kodeUakpb) { alert("Harap isi Kode UAKPB!"); return; }

    document.getElementById("btnFetchApprove").disabled = true;
    document.getElementById("btnFetchApprove").textContent = "⏳ Loading...";

    try {
        const response = await fetch("/api/find-approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                _headers: auth,
                kodeUakpb: kodeUakpb,
                currentPage: Number(currentPage),
                pageSize: Number(pageSize)
            })
        });

        const result = await response.json();

        if (result.status && result.object && result.object.dataList) {
            approveData = result.object.dataList;
            const pagingInfo = result.object.pagingInfo;

            document.getElementById("aprTotalCount").textContent = result.object.totalRowCount || approveData.length;
            document.getElementById("aprCurrentPageInfo").textContent = pagingInfo.currentPage;
            document.getElementById("aprPageCount").textContent = pagingInfo.pageCount;

            renderApproveResults();
            document.getElementById("aprResultsSection").style.display = "block";
        } else {
            alert("Error: " + (result.message || "Tidak ada data"));
        }
    } catch (error) {
        alert("Error: " + error.message);
    }

    document.getElementById("btnFetchApprove").disabled = false;
    document.getElementById("btnFetchApprove").textContent = "🔍 Cari Data";
}

function renderApproveResults() {
    const tbody = document.getElementById("aprResultsBody");
    tbody.innerHTML = "";

    approveData.forEach((item, i) => {
        const tr = document.createElement("tr");
        const tglPerolehan = item.tglPerolehan ? new Date(item.tglPerolehan).toLocaleDateString("id-ID") : "-";
        tr.innerHTML =
            '<td><input type="checkbox" class="apr-checkbox" data-index="' + i + '" onchange="updateApproveSelectedCount()"></td>' +
            "<td>" + item.id + "</td>" +
            "<td>" + (item.noSPPA || "-") + "</td>" +
            "<td>" + (item.kodeBarang || "-") + "</td>" +
            "<td>" + (item.namaBarang || "-") + "</td>" +
            "<td>" + item.noAwal + "-" + item.noAkhir + "</td>" +
            "<td>" + tglPerolehan + "</td>";
        tbody.appendChild(tr);
    });

    updateApproveSelectedCount();
}

function updateApproveSelectedCount() {
    const count = document.querySelectorAll(".apr-checkbox:checked").length;
    document.getElementById("aprSelectedCount").textContent = count;
}

async function startApproval() {
    const auth = getAuthCredentials();
    if (!auth) { alert("Harap isi semua field autentikasi!"); return; }

    const selectedItems = [];
    document.querySelectorAll(".apr-checkbox:checked").forEach(cb => {
        const index = parseInt(cb.dataset.index);
        const item = approveData[index];
        selectedItems.push({
            ...item,
            selected: true,
            statusPersetujuan: "3",
            tglPembukuan: "2025-12-30T17:00:00.000Z"
        });
    });

    if (selectedItems.length === 0) {
        alert("Pilih minimal 1 item untuk di-approve!");
        return;
    }

    if (!confirm("Anda akan meng-approve " + selectedItems.length + " item. Lanjutkan?")) {
        return;
    }

    document.getElementById("aprStatusSection").style.display = "block";
    document.getElementById("btnApprove").disabled = true;
    document.getElementById("btnApprove").textContent = "⏳ Processing...";

    const logContainer = document.getElementById("aprLogContainer");
    logContainer.innerHTML = "";

    addAprLog("info", "Memulai approval " + selectedItems.length + " item...");

    addAprLog("pending", "Step 1/2: Menjalankan validasi...");
    try {
        const validateResponse = await fetch("/api/validate-persetujuan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                _headers: auth,
                listPersetujuanWrapper: selectedItems
            })
        });

        const validateResult = await validateResponse.json();

        if (!validateResult.status) {
            addAprLog("error", "Validasi gagal: " + (validateResult.message || "Unknown error"));
            resetApproveButton();
            return;
        }

        addAprLog("success", "Step 1/2: Validasi berhasil!");
        addAprLog("pending", "Step 2/2: Menyimpan persetujuan...");

        const saveResponse = await fetch("/api/save-persetujuan", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                _headers: auth,
                listPersetujuanWrapper: selectedItems,
                loginWrapper: APPROVER_LOGIN_WRAPPER
            })
        });

        const saveResult = await saveResponse.json();

        if (saveResult.status) {
            addAprLog("success", "Step 2/2: Approval berhasil disimpan!");
            addAprLog("info", "✅ Proses approval selesai! " + selectedItems.length + " item telah disetujui.");
        } else {
            addAprLog("error", "Gagal menyimpan: " + (saveResult.message || "Unknown error"));
        }

    } catch (error) {
        addAprLog("error", "Error: " + error.message);
    }

    resetApproveButton();
}

function resetApproveButton() {
    document.getElementById("btnApprove").disabled = false;
    document.getElementById("btnApprove").innerHTML = '✅ Approve (<span id="aprSelectedCount">' + document.querySelectorAll(".apr-checkbox:checked").length + "</span> item)";
}

function addAprLog(type, message) {
    const logContainer = document.getElementById("aprLogContainer");
    const icons = { success: "✅", error: "❌", pending: "⏳", info: "ℹ️" };
    const entry = document.createElement("div");
    entry.className = "log-entry " + type;
    entry.innerHTML = '<span class="log-icon">' + icons[type] + '</span><div class="log-content"><span class="log-time">' + new Date().toLocaleTimeString("id-ID") + '</span><div class="log-message">' + message + "</div></div>";
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// ==================== DASHBOARD ====================
function showDashboard(total) {
    stats = { total: total, success: 0, error: 0, pending: total };
    document.getElementById("dashboardSection").style.display = "block";
    document.getElementById("logContainer").innerHTML = "";
    updateDashboard();
}

function updateDashboard() {
    document.getElementById("statTotal").textContent = stats.total;
    document.getElementById("statSuccess").textContent = stats.success;
    document.getElementById("statError").textContent = stats.error;
    document.getElementById("statPending").textContent = stats.pending;
    const percent = Math.round(((stats.success + stats.error) / stats.total) * 100);
    document.getElementById("progressBar").style.width = percent + "%";
    document.getElementById("progressPercent").textContent = percent;
}

function addLog(type, message) {
    const logContainer = document.getElementById("logContainer");
    const icons = { success: "✅", error: "❌", pending: "⏳", info: "ℹ️" };
    const entry = document.createElement("div");
    entry.className = "log-entry " + type;
    entry.innerHTML = '<span class="log-icon">' + icons[type] + '</span><div class="log-content"><span class="log-time">' + new Date().toLocaleTimeString("id-ID") + '</span><div class="log-message">' + message + "</div></div>";
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

