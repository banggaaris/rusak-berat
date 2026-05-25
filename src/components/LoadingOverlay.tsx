import * as React from "react"
import { Loader2 } from "lucide-react"

interface LoadingOverlayProps {
    show: boolean
    message?: string
}

/**
 * Full-screen blocking overlay. While `show` is true it sits on top of everything
 * (high z-index, covers the viewport) so no element behind it can be clicked.
 */
export function LoadingOverlay({ show, message }: LoadingOverlayProps) {
    if (!show) return null

    return (
        <div
            role="alertdialog"
            aria-busy="true"
            aria-live="assertive"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-sm"
        >
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-8 py-6 shadow-lg">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
                <p className="text-sm text-muted-foreground">{message ?? "Memproses..."}</p>
            </div>
        </div>
    )
}
