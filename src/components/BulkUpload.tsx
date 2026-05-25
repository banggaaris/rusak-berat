import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Stepper } from "@/components/ui/stepper"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/PageHeader"
import { toast } from "sonner"
import { Upload, FileSpreadsheet, Play, CheckCircle, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { parseExcelFile, processRows, downloadExcelTemplate } from "@/lib/excel"
import { UPLOAD_TYPES, type DocState, type UploadType } from "@/lib/uploadConfigs"

interface BulkUploadProps {
    auth: { sessionId: string; tokenId: string; timestamp: string }
}

const steps = ["Upload Excel", "Preview Data", "Processing", "Selesai"]

export function BulkUpload({ auth }: BulkUploadProps) {
    const [typeKey, setTypeKey] = React.useState(UPLOAD_TYPES[0].key)
    const config = UPLOAD_TYPES.find((t) => t.key === typeKey) as UploadType

    const [currentStep, setCurrentStep] = React.useState(0)
    const [data, setData] = React.useState<Record<string, unknown>[]>([])
    const [fileName, setFileName] = React.useState("")
    const [progress, setProgress] = React.useState(0)
    const [stats, setStats] = React.useState({ success: 0, error: 0 })
    const [doc, setDoc] = React.useState<DocState>(UPLOAD_TYPES[0].docDefaults)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const reset = () => {
        setCurrentStep(0)
        setData([])
        setFileName("")
        setProgress(0)
        setStats({ success: 0, error: 0 })
    }

    const changeType = (key: string) => {
        if (key === typeKey) return
        const next = UPLOAD_TYPES.find((t) => t.key === key) as UploadType
        setTypeKey(key)
        setDoc(next.docDefaults)
        reset()
    }

    const setDocField = (field: keyof DocState, value: string) => {
        setDoc((prev) => ({ ...prev, [field]: value }))
    }

    const handleFileUpload = async (file: File) => {
        const result = await parseExcelFile<Record<string, unknown>>(file, config.requiredCols)
        if (!result.ok) {
            toast.error(result.error.title, result.error.description ? { description: result.error.description } : undefined)
            return
        }
        setFileName(file.name)
        setData(result.rows)
        setCurrentStep(1)
        toast.success("File berhasil dibaca", { description: `${result.rows.length} baris data ditemukan` })
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0])
        }
    }

    const downloadTemplate = () => {
        downloadExcelTemplate(`template-${config.key}.xlsx`, config.requiredCols, config.templateSample)
    }

    const startUpload = async () => {
        if (!auth.sessionId || !auth.tokenId || !auth.timestamp) {
            toast.error("Autentikasi tidak lengkap", { description: "Harap isi semua field autentikasi" })
            return
        }

        setCurrentStep(2)
        setProgress(0)
        setStats({ success: 0, error: 0 })

        const { success, error } = await processRows(
            data,
            async (row) => {
                try {
                    const body = config.buildBody(row, doc, auth)
                    const response = await fetch(config.endpoint, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                    })
                    if (!response.ok) {
                        toast.error(`Gagal: ${row.kodeBarang}`, { description: `HTTP ${response.status}` })
                        return false
                    }
                    return true
                } catch (err) {
                    toast.error(`Error: ${row.kodeBarang}`, { description: String(err) })
                    return false
                }
            },
            (p, s, e) => {
                setProgress(p)
                setStats({ success: s, error: e })
            }
        )

        setCurrentStep(3)
        toast.success("Upload selesai!", { description: `Sukses: ${success}, Gagal: ${error}` })
    }

    return (
        <div className="space-y-6">
            <PageHeader
                icon={Upload}
                title="Bulk Upload"
                code={config.code}
                description={config.description}
            />

            {/* Transaction type selector */}
            <div className="grid grid-cols-3 gap-2">
                {UPLOAD_TYPES.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => changeType(t.key)}
                        className={cn(
                            "rounded-lg border p-3 text-left transition-colors",
                            t.key === typeKey
                                ? "border-brand/40 bg-brand/10"
                                : "border-border hover:bg-accent"
                        )}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium">{t.label}</span>
                            <span
                                className={cn(
                                    "text-[10px] font-mono px-1.5 py-0.5 rounded-full border",
                                    t.key === typeKey
                                        ? "border-brand/40 text-brand"
                                        : "border-border text-muted-foreground"
                                )}
                            >
                                {t.code}
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            <Stepper steps={steps} currentStep={currentStep} />

            {currentStep === 0 && (
                <>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">📄 Detail Dokumen</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Berlaku untuk semua baris dalam satu kali upload.
                            </p>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Tgl Pembukuan (WIB)</label>
                                    <Input type="date" value={doc.tglPembukuan} onChange={(e) => setDocField("tglPembukuan", e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Tgl Dasar Mutasi (WIB)</label>
                                    <Input type="date" value={doc.tglDasarMutasi} onChange={(e) => setDocField("tglDasarMutasi", e.target.value)} />
                                </div>
                                <div className={cn("space-y-2", !config.hasKeterangan && "md:col-span-2")}>
                                    <label className="text-sm font-medium text-muted-foreground">No Dasar Mutasi</label>
                                    <Input value={doc.noDasarMutasi} onChange={(e) => setDocField("noDasarMutasi", e.target.value)} placeholder="Nomor SK/ND dasar mutasi" />
                                </div>
                                {config.hasKeterangan && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Keterangan</label>
                                        <Input value={doc.keterangan} onChange={(e) => setDocField("keterangan", e.target.value)} placeholder="Keterangan transaksi" />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5" />
                                Upload Excel - {config.label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                                <p className="text-sm text-muted-foreground">
                                    Kolom: {config.requiredCols.map((c) => (
                                        <code key={c} className="bg-muted px-1 rounded mr-1">{c}</code>
                                    ))}
                                </p>
                                <Button variant="outline" size="sm" onClick={downloadTemplate} className="shrink-0">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Template
                                </Button>
                            </div>
                            <div
                                className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-brand transition-colors"
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
                                <p className="text-muted-foreground">
                                    Drag &amp; drop file Excel atau <span className="text-brand">klik untuk memilih</span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {currentStep === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>📋 Preview Data ({data.length} baris) - {fileName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-100 overflow-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        {config.requiredCols.map((c) => (
                                            <TableHead key={c}>{c}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.slice(0, 100).map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{i + 1}</TableCell>
                                            {config.requiredCols.map((c) => (
                                                <TableCell key={c} className="font-mono text-xs">{String(row[c] ?? "")}</TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <Button variant="outline" onClick={reset}>← Kembali</Button>
                            <Button onClick={startUpload} className="flex-1">
                                <Play className="w-4 h-4 mr-2" />
                                Mulai Upload ({data.length} data)
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {currentStep === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle>⏳ Processing...</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Progress value={progress} className="h-3" />
                        <div className="flex justify-between text-sm">
                            <span>Progress: {progress}%</span>
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
                            Upload Selesai!
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-muted rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-foreground">{stats.success}</div>
                                <div className="text-sm text-muted-foreground">Sukses</div>
                            </div>
                            <div className="bg-muted rounded-lg p-4 text-center border border-border">
                                <div className="text-3xl font-bold text-muted-foreground">{stats.error}</div>
                                <div className="text-sm text-muted-foreground">Gagal</div>
                            </div>
                        </div>
                        <Button onClick={reset} className="w-full">Upload Lagi</Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
