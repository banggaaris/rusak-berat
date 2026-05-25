import * as React from "react"
import { cn } from "@/lib/utils"
import { Upload, Trash2, CheckCircle, ThumbsUp, type LucideIcon } from "lucide-react"

interface HeaderProps {
    activeTab: string
    onTabChange: (tab: string) => void
}

const TABS: { key: string; label: string; icon: LucideIcon }[] = [
    { key: "upload", label: "Bulk Upload", icon: Upload },
    { key: "delete", label: "Delete", icon: Trash2 },
    { key: "validasi", label: "Validasi", icon: CheckCircle },
    { key: "approve", label: "Approve", icon: ThumbsUp },
]

export function Header({ activeTab, onTabChange }: HeaderProps) {
    return (
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col gap-4">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-foreground">🚀 SAKTI Bulk Tool</h1>
                        <p className="text-sm text-muted-foreground">Pengembangan Aset Tetap</p>
                    </div>

                    <nav className="flex flex-wrap justify-center gap-1">
                        {TABS.map(({ key, label, icon: Icon }) => {
                            const active = activeTab === key
                            return (
                                <button
                                    key={key}
                                    onClick={() => onTabChange(key)}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                                        active
                                            ? "bg-brand/15 text-brand border border-brand/30"
                                            : "border border-transparent hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            )
                        })}
                    </nav>
                </div>
            </div>
        </header>
    )
}
