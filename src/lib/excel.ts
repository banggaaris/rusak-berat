// Shared helpers for the Excel-driven bulk flows (rusak-berat, henti-guna, delete).
// XLSX is loaded globally via CDN in index.astro.

declare const XLSX: any

/**
 * Convert an Excel serial date (or a date string) into the ISO string SAKTI expects.
 * The calendar date is resolved in UTC (timezone-independent), then encoded as
 * midnight WIB (UTC+7) — e.g. acquisition date 2013-10-30 -> "2013-10-29T17:00:00.000Z" —
 * matching how tglPembukuan/tglDasarMutasi are stored.
 */
export function formatExcelDate(value: string | number): string {
    let dateStr: string
    if (typeof value === "number") {
        // Excel serial dates count days from 1899-12-30; compute in UTC to avoid TZ drift.
        dateStr = new Date(Date.UTC(1899, 11, 30) + value * 86400000).toISOString().slice(0, 10)
    } else {
        const parsed = new Date(value)
        dateStr = isNaN(parsed.getTime()) ? String(value) : parsed.toISOString().slice(0, 10)
    }
    return new Date(`${dateStr}T00:00:00+07:00`).toISOString()
}

/**
 * Generate and download an .xlsx template containing the given header columns.
 * An optional sample row is added below the header so users see the expected format.
 */
export function downloadExcelTemplate(
    filename: string,
    columns: string[],
    sampleRow?: Record<string, string | number>,
): void {
    const aoa: (string | number)[][] = [columns]
    if (sampleRow) {
        aoa.push(columns.map((col) => sampleRow[col] ?? ""))
    }

    const worksheet = XLSX.utils.aoa_to_sheet(aoa)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template")
    XLSX.writeFile(workbook, filename)
}

export interface ParseError {
    title: string
    description?: string
}

export type ParseResult<T> =
    | { ok: true; rows: T[] }
    | { ok: false; error: ParseError }

/**
 * Read an Excel file, validate that the required columns exist, and return the rows.
 * Never throws — failures are returned as `{ ok: false, error }` so callers can toast them.
 */
export function parseExcelFile<T>(file: File, requiredCols: string[]): Promise<ParseResult<T>> {
    return new Promise((resolve) => {
        if (!file.name.match(/\.(xlsx|xls)$/i)) {
            resolve({ ok: false, error: { title: "Format file tidak valid", description: "Harap upload file Excel (.xlsx atau .xls)" } })
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const arrayBuffer = e.target?.result as ArrayBuffer
                const uint8Array = new Uint8Array(arrayBuffer)
                const workbook = XLSX.read(uint8Array, { type: "array" })
                // raw:false -> read each cell as the text shown in Excel, so codes like
                // noSPPA keep leading zeros and long IDs aren't mangled into numbers.
                // dateNF normalises date cells to a parseable "yyyy-mm-dd" form.
                const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
                    raw: false,
                    dateNF: "yyyy-mm-dd",
                })

                if (jsonData.length === 0) {
                    resolve({ ok: false, error: { title: "File kosong", description: "File Excel tidak memiliki data" } })
                    return
                }

                const missingCols = requiredCols.filter((col) => !(col in jsonData[0]))
                if (missingCols.length > 0) {
                    resolve({ ok: false, error: { title: "Kolom tidak lengkap", description: `Kolom tidak ditemukan: ${missingCols.join(", ")}` } })
                    return
                }

                resolve({ ok: true, rows: jsonData as T[] })
            } catch (error) {
                resolve({ ok: false, error: { title: "Gagal membaca file", description: String(error) } })
            }
        }
        reader.onerror = () => {
            resolve({ ok: false, error: { title: "Gagal membaca file" } })
        }
        reader.readAsArrayBuffer(file)
    })
}

/**
 * Process rows one at a time (with a small throttle), reporting progress as it goes.
 * `handler` returns true on success, false on failure; thrown errors count as failures.
 */
export async function processRows<T>(
    rows: T[],
    handler: (row: T, index: number) => Promise<boolean>,
    onProgress: (progress: number, success: number, error: number) => void,
    delayMs = 100,
): Promise<{ success: number; error: number }> {
    let success = 0
    let error = 0

    for (let i = 0; i < rows.length; i++) {
        try {
            if (await handler(rows[i], i)) {
                success++
            } else {
                error++
            }
        } catch {
            error++
        }

        onProgress(Math.round(((i + 1) / rows.length) * 100), success, error)
        await new Promise((r) => setTimeout(r, delayMs))
    }

    return { success, error }
}
