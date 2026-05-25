import { formatExcelDate } from "./excel"
import { wibDateToIso } from "./utils"

export interface DocState {
    tglPembukuan: string
    tglDasarMutasi: string
    noDasarMutasi: string
    keterangan: string
}

export interface Auth {
    sessionId: string
    tokenId: string
    timestamp: string
}

export interface UploadType {
    key: string
    label: string
    code: string
    description: string
    endpoint: string
    requiredCols: string[]
    hasKeterangan: boolean
    docDefaults: DocState
    templateSample: Record<string, string | number>
    buildBody: (row: Record<string, unknown>, doc: DocState, auth: Auth) => Record<string, unknown>
}

// Normalise a value coming from an Excel cell into a clean string:
// stringify, then strip stray whitespace (incl. non-breaking spaces from copy-paste).
const txt = (v: unknown) => String(v ?? "").trim()

const docPart = (doc: DocState, withKeterangan: boolean) => ({
    tglPembukuan: wibDateToIso(doc.tglPembukuan),
    tglDasarMutasi: wibDateToIso(doc.tglDasarMutasi),
    noDasarMutasi: doc.noDasarMutasi,
    createdDateTime: wibDateToIso(doc.tglPembukuan),
    ...(withKeterangan ? { keterangan: doc.keterangan } : {}),
})

export const UPLOAD_TYPES: UploadType[] = [
    {
        key: "rusak-berat",
        label: "Rusak-Berat",
        code: "203",
        description: "Bulk upload aset kondisi rusak berat",
        endpoint: "/api/proxy",
        requiredCols: ["kodeUakpb", "kodeBarang", "noAwal", "noAkhir", "tglPerolehan"],
        hasKeterangan: false,
        docDefaults: {
            tglPembukuan: "2025-12-31",
            tglDasarMutasi: "2025-12-31",
            noDasarMutasi: "SK NOMOR 77 TAHUN 2025",
            keterangan: "",
        },
        templateSample: {
            kodeUakpb: "143010199693521001KP",
            kodeBarang: "3050101002",
            noAwal: 1,
            noAkhir: 1,
            tglPerolehan: "2013-10-30",
        },
        buildBody: (row, doc, auth) => ({
            kodeJenisTransaksi: "203",
            statusPersetujuan: 1,
            dasarHarga: 1,
            periode: 13,
            kodeKondisi: 3,
            tahunAnggaran: 2025,
            ...docPart(doc, false),
            kodeUakpb: txt(row.kodeUakpb),
            kodeBarang: txt(row.kodeBarang),
            noAwal: Number(row.noAwal),
            noAkhir: Number(row.noAkhir),
            tglPerolehan: formatExcelDate(row.tglPerolehan as string | number),
            _headers: auth,
        }),
    },
    {
        key: "henti-guna",
        label: "Henti-Guna",
        code: "401",
        description: "Bulk upload penghentian penggunaan aset",
        endpoint: "/api/henti-guna",
        requiredCols: ["noSPPA", "kodeUakpb", "kodeBarang", "namaBarang", "noAwal", "noAkhir", "tglPerolehan"],
        hasKeterangan: true,
        docDefaults: {
            tglPembukuan: "2025-12-31",
            tglDasarMutasi: "2025-12-31",
            noDasarMutasi: "SK NOMOR 77 TAHUN 2025",
            keterangan: "SK Penghentian Penggunaan",
        },
        templateSample: {
            noSPPA: "J01263",
            kodeUakpb: "143010199693521001KP",
            kodeBarang: "3050101002",
            namaBarang: "Mesin Ketik Manual Standard (14-16 Inci)",
            noAwal: 1,
            noAkhir: 1,
            tglPerolehan: "2013-10-30",
        },
        buildBody: (row, doc, auth) => ({
            id: "",
            tahunAnggaran: 2025,
            kodeJenisTransaksi: "401",
            statusPersetujuan: 1,
            periode: 13,
            jenisDokumen: 31,
            ...docPart(doc, true),
            noSPPA: txt(row.noSPPA),
            kodeUakpb: txt(row.kodeUakpb),
            kodeBarang: txt(row.kodeBarang),
            namaBarang: txt(row.namaBarang),
            noAwal: Number(row.noAwal),
            noAkhir: Number(row.noAkhir),
            tglPerolehan: formatExcelDate(row.tglPerolehan as string | number),
            _headers: auth,
        }),
    },
    {
        key: "penjualan",
        label: "Penjualan",
        code: "911",
        description: "Bulk upload penjualan Barang Milik Negara",
        endpoint: "/api/penjualan",
        requiredCols: ["noSPPA", "kodeUakpb", "kodeBarang", "namaBarang", "noAwal", "noAkhir", "tglPerolehan"],
        hasKeterangan: true,
        docDefaults: {
            tglPembukuan: "2026-05-25",
            tglDasarMutasi: "2026-04-13",
            noDasarMutasi: "ND.49/MENHUT-SETJEN/ROUM/KAP.06.05/B/4/2026",
            keterangan: "Persetujuan Penjualan Barang Milik Negara pada Kantor Pusat Sekretariat Jenderal",
        },
        templateSample: {
            noSPPA: "J01263",
            kodeUakpb: "143010199693521001KP",
            kodeBarang: "3050101002",
            namaBarang: "Mesin Ketik Manual Standard (14-16 Inci)",
            noAwal: 1,
            noAkhir: 1,
            tglPerolehan: "2013-10-31",
        },
        buildBody: (row, doc, auth) => ({
            id: "",
            tahunAnggaran: 2026,
            kodeJenisTransaksi: "911",
            statusPersetujuan: 1,
            periode: 0,
            jenisDokumen: 41,
            ...docPart(doc, true),
            noSPPA: txt(row.noSPPA),
            kodeUakpb: txt(row.kodeUakpb),
            kodeBarang: txt(row.kodeBarang),
            namaBarang: txt(row.namaBarang),
            noAwal: Number(row.noAwal),
            noAkhir: Number(row.noAkhir),
            tglPerolehan: formatExcelDate(row.tglPerolehan as string | number),
            _headers: auth,
        }),
    },
]
