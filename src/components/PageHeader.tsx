import * as React from "react"
import type { LucideIcon } from "lucide-react"

interface PageHeaderProps {
    icon: LucideIcon
    title: string
    description: string
    code?: string
}

export function PageHeader({ icon: Icon, title, description, code }: PageHeaderProps) {
    return (
        <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand/30 bg-brand/10 text-brand">
                <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold leading-tight">{title}</h2>
                    {code && (
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full border border-brand/30 bg-brand/10 text-brand">
                            {code}
                        </span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    )
}
