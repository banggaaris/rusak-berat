import * as React from "react"
import { Header } from "@/components/Header"
import { AuthForm } from "@/components/AuthForm"
import { BulkUpload } from "@/components/BulkUpload"
import { DeleteFlow } from "@/components/DeleteFlow"
import { ValidasiFlow } from "@/components/ValidasiFlow"
import { ApproveFlow } from "@/components/ApproveFlow"
import { Toaster } from "@/components/ui/sonner"

export function App() {
    const [activeTab, setActiveTab] = React.useState("upload")
    const [sessionId, setSessionId] = React.useState("")
    const [tokenId, setTokenId] = React.useState("")
    const [timestamp, setTimestamp] = React.useState(Date.now().toString())

    const auth = { sessionId, tokenId, timestamp }

    const generateTimestamp = () => {
        setTimestamp(Date.now().toString())
    }

    return (
        <div className="min-h-screen bg-background">
            <Header activeTab={activeTab} onTabChange={setActiveTab} />

            <main className="container mx-auto px-4 py-6 max-w-4xl">
                <AuthForm
                    sessionId={sessionId}
                    tokenId={tokenId}
                    timestamp={timestamp}
                    onSessionIdChange={setSessionId}
                    onTokenIdChange={setTokenId}
                    onTimestampChange={setTimestamp}
                    onGenerateTimestamp={generateTimestamp}
                />

                {activeTab === "upload" && <BulkUpload auth={auth} />}
                {activeTab === "delete" && <DeleteFlow auth={auth} />}
                {activeTab === "validasi" && <ValidasiFlow auth={auth} />}
                {activeTab === "approve" && <ApproveFlow auth={auth} />}

                <footer className="mt-8 text-center text-sm text-muted-foreground">
                    <p>⚠️ Pastikan Anda sudah login di SAKTI sebelum menggunakan tool ini</p>
                </footer>
            </main>

            <Toaster position="top-right" />
        </div>
    )
}
