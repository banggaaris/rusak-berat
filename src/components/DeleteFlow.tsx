import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Stepper } from "@/components/ui/stepper"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { PageHeader } from "@/components/PageHeader"
import { LoadingOverlay } from "@/components/LoadingOverlay"
import { Upload, Trash2, CheckCircle, Download } from "lucide-react"
import { parseExcelFile, processRows, downloadExcelTemplate } from "@/lib/excel"

interface DeleteFlowProps {
    auth: { sessionId: string; tokenId: string; timestamp: string }
}

interface RowData {
    object: number
}

const steps = ["Upload Excel", "Preview Data", "Processing", "Selesai"]

export function DeleteFlow({ auth }: DeleteFlowProps) {
    const [currentStep, setCurrentStep] = React.useState(0)
    const [data, setData] = React.useState<RowData[]>([])
    const [fileName, setFileName] = React.useState("")
    const [progress, setProgress] = React.useState(0)
    const [stats, setStats] = React.useState({ success: 0, error: 0 })
    const [busy, setBusy] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleFileUpload = async (file: File) => {
        const result = await parseExcelFile<RowData>(file, ["object"])
        if (!result.ok) {
            toast.error(result.error.title, result.error.description ? { description: result.error.description } : undefined)
            return
        }

        setFileName(file.name)
        setData(result.rows)
        setCurrentStep(1)
        toast.success(`${result.rows.length} data ditemukan`)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0])
        }
    }

    const downloadTemplate = () => {
        downloadExcelTemplate("template-delete.xlsx", ["object"], { object: 123456 })
    }

    const startDelete = async () => {
        if (!auth.sessionId || !auth.tokenId || !auth.timestamp) {
            toast.error("Autentikasi tidak lengkap")
            return
        }

        setCurrentStep(2)
        setProgress(0)
        setStats({ success: 0, error: 0 })
        setBusy(true)

        try {
            const { success, error } = await processRows(
                data,
                async (row) => {
                    const response = await fetch("/api/delete", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            object: Number(row.object),
                            _headers: auth
                        })
                    })
                    return response.ok
                },
                (p, s, e) => {
                    setProgress(p)
                    setStats({ success: s, error: e })
                }
            )

            setCurrentStep(3)
            toast.success("Delete selesai!", { description: `Sukses: ${success}, Gagal: ${error}` })
        } finally {
            setBusy(false)
        }
    }

    const reset = () => {
        setCurrentStep(0)
        setData([])
        setFileName("")
        setProgress(0)
        setStats({ success: 0, error: 0 })
    }

    return (
        <div className="space-y-6">
            <LoadingOverlay show={busy} message={`Menghapus data... ${progress}%`} />
            <PageHeader
                icon={Trash2}
                title="Delete Transaksi"
                description="Hapus transaksi aset berdasarkan Object ID"
            />
            <Stepper steps={steps} currentStep={currentStep} />

            {currentStep === 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trash2 className="w-5 h-5" />
                            Upload Excel - Delete
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                            <p className="text-sm text-muted-foreground">
                                Format: <code className="bg-muted px-1 rounded">object</code> (ID transaksi)
                            </p>
                            <Button variant="outline" size="sm" onClick={downloadTemplate} className="shrink-0">
                                <Download className="w-4 h-4 mr-2" />
                                Download Template
                            </Button>
                        </div>
                        <div
                            className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-destructive transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                            />
                            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Drag &amp; drop file Excel atau klik untuk memilih</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {currentStep === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>📋 Preview ({data.length} data) - {fileName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-100 overflow-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Object ID</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.slice(0, 100).map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{i + 1}</TableCell>
                                            <TableCell className="font-mono">{row.object}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <Button variant="outline" onClick={reset}>← Kembali</Button>
                            <Button variant="destructive" onClick={startDelete} className="flex-1">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete ({data.length} data)
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {currentStep === 2 && (
                <Card>
                    <CardHeader><CardTitle>⏳ Deleting...</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <Progress value={progress} className="h-3" />
                        <div className="flex justify-between text-sm">
                            <span>{progress}%</span>
                            <span className="text-foreground">✅ {stats.success}</span>
                            <span className="text-muted-foreground">❌ {stats.error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {currentStep === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <CheckCircle className="w-5 h-5" />
                            Delete Selesai!
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-muted rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-foreground">{stats.success}</div>
                                <div className="text-sm">Sukses</div>
                            </div>
                            <div className="bg-muted rounded-lg p-4 text-center border border-border">
                                <div className="text-3xl font-bold text-muted-foreground">{stats.error}</div>
                                <div className="text-sm">Gagal</div>
                            </div>
                        </div>
                        <Button onClick={reset} className="w-full">Mulai Lagi</Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
