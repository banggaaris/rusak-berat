import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Convert a "YYYY-MM-DD" date (interpreted as midnight WIB / UTC+7) into the
 * ISO string SAKTI expects, e.g. "2026-05-25" -> "2026-05-24T17:00:00.000Z".
 */
export function wibDateToIso(dateStr: string): string {
    return new Date(`${dateStr}T00:00:00+07:00`).toISOString()
}
