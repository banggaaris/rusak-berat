import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface AuthFormProps {
    sessionId: string
    tokenId: string
    timestamp: string
    onSessionIdChange: (value: string) => void
    onTokenIdChange: (value: string) => void
    onTimestampChange: (value: string) => void
    onGenerateTimestamp: () => void
}

export function AuthForm({
    sessionId,
    tokenId,
    timestamp,
    onSessionIdChange,
    onTokenIdChange,
    onTimestampChange,
    onGenerateTimestamp,
}: AuthFormProps) {
    return (
        <Card className="mb-6">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">🔐 Autentikasi SAKTI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            SAKTI_SESSION_ID
                        </label>
                        <Input
                            placeholder="Session ID dari header request"
                            value={sessionId}
                            onChange={(e) => onSessionIdChange(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            SAKTI_TOKEN_ID
                        </label>
                        <Input
                            placeholder="Token ID dari header request"
                            value={tokenId}
                            onChange={(e) => onTokenIdChange(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            SAKTI_TIMESTAMP
                        </label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Timestamp"
                                value={timestamp}
                                onChange={(e) => onTimestampChange(e.target.value)}
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={onGenerateTimestamp}
                                title="Generate timestamp baru"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
