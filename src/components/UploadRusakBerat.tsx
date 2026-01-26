import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Stepper } from "@/components/ui/stepper"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Upload, FileSpreadsheet, Play, CheckCircle } from "lucide-react"

// Fixed request body values for rusak-berat
const FIXED_BODY = {
    kodeJenisTransaksi: "203",
    statusPersetujuan: 1,
    dasarHarga: 1,
    periode: 13,
    kodeKondisi: 3,
    tahunAnggaran: 2025,
    tglPembukuan: "2025-12-30T17:00:00.000Z",
    tglDasarMutasi: "2025-12-30T17:00:00.000Z",
    noDasarMutasi: "SK NOMOR 77 TAHUN 2025"
}

interface UploadRusakBeratProps {
    auth: { sessionId: string; tokenId: string; timestamp: string }
}

interface RowData {
    kodeUakpb: string
    kodeBarang: string
    noAwal: number
    noAkhir: number
    tglPerolehan: string
}

const steps = ["Upload Excel", "Preview Data", "Processing", "Selesai"]

export function UploadRusakBerat({ auth }: UploadRusakBeratProps) {
    const [currentStep, setCurrentStep] = React.useState(0)
    const [data, setData] = React.useState<RowData[]>([])
    const [fileName, setFileName] = React.useState("")
    const [progress, setProgress] = React.useState(0)
    const [stats, setStats] = React.useState({ success: 0, error: 0 })
    const [isProcessing, setIsProcessing] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleFileUpload = (file: File) => {
        if (!file.name.match(/\.(xlsx|xls)$/i)) {
            toast.error("Format file tidak valid", { description: "Harap upload file Excel (.xlsx atau .xls)" })
            return
        }

        setFileName(file.name)
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const arrayBuffer = e.target?.result as ArrayBuffer
                const uint8Array = new Uint8Array(arrayBuffer)
                // @ts-ignore - XLSX is loaded via CDN
                const workbook = XLSX.read(uint8Array, { type: "array" })
                const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])

                if (jsonData.length === 0) {
                    toast.error("File kosong", { description: "File Excel tidak memiliki data" })
                    return
                }

                const requiredCols = ["kodeUakpb", "kodeBarang", "noAwal", "noAkhir", "tglPerolehan"]
                const missingCols = requiredCols.filter((col) => !(col in jsonData[0]))
                if (missingCols.length > 0) {
                    toast.error("Kolom tidak lengkap", { description: `Kolom tidak ditemukan: ${missingCols.join(", ")}` })
                    return
                }

                setData(jsonData as RowData[])
                setCurrentStep(1)
                toast.success("File berhasil dibaca", { description: `${jsonData.length} baris data ditemukan` })
            } catch (error) {
                toast.error("Gagal membaca file", { description: String(error) })
            }
        }
        reader.readAsArrayBuffer(file)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0])
        }
    }

    const formatDate = (value: string | number): string => {
        if (typeof value === "number") {
            const excelEpoch = new Date(1899, 11, 30)
            return new Date(excelEpoch.getTime() + value * 86400000).toISOString()
        }
        return new Date(value).toISOString()
    }

    const startUpload = async () => {
        if (!auth.sessionId || !auth.tokenId || !auth.timestamp) {
            toast.error("Autentikasi tidak lengkap", { description: "Harap isi semua field autentikasi" })
            return
        }

        setCurrentStep(2)
        setIsProcessing(true)
        setProgress(0)
        setStats({ success: 0, error: 0 })

        let successCount = 0
        let errorCount = 0

        for (let i = 0; i < data.length; i++) {
            const row = data[i]
            try {
                const body = {
                    ...FIXED_BODY,
                    kodeUakpb: String(row.kodeUakpb),
                    kodeBarang: String(row.kodeBarang),
                    noAwal: Number(row.noAwal),
                    noAkhir: Number(row.noAkhir),
                    tglPerolehan: formatDate(row.tglPerolehan),
                    createdDateTime: new Date().toISOString(),
                    _headers: auth
                }

                const response = await fetch("/api/proxy", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                })

                if (response.ok) {
                    successCount++
                } else {
                    errorCount++
                    toast.error(`Gagal: ${row.kodeBarang}`, { description: `HTTP ${response.status}` })
                }
            } catch (error) {
                errorCount++
                toast.error(`Error: ${row.kodeBarang}`, { description: String(error) })
            }

            setProgress(Math.round(((i + 1) / data.length) * 100))
            setStats({ success: successCount, error: errorCount })
            await new Promise((r) => setTimeout(r, 100))
        }

        setCurrentStep(3)
        setIsProcessing(false)
        toast.success("Upload selesai!", { description: `Sukses: ${successCount}, Gagal: ${errorCount}` })
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
            <Stepper steps={steps} currentStep={currentStep} />

            {currentStep === 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5" />
                            Upload Excel - Rusak Berat
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Format: <code className="bg-muted px-1 rounded">kodeUakpb</code>, <code className="bg-muted px-1 rounded">kodeBarang</code>, <code className="bg-muted px-1 rounded">noAwal</code>, <code className="bg-muted px-1 rounded">noAkhir</code>, <code className="bg-muted px-1 rounded">tglPerolehan</code>
                        </p>
                        <div
                            className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
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
                                Drag & drop file Excel atau <span className="text-primary">klik untuk memilih</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {currentStep === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>📋 Preview Data ({data.length} baris) - {fileName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-[400px] overflow-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>kodeUakpb</TableHead>
                                        <TableHead>kodeBarang</TableHead>
                                        <TableHead>noAwal</TableHead>
                                        <TableHead>noAkhir</TableHead>
                                        <TableHead>tglPerolehan</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.slice(0, 100).map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{i + 1}</TableCell>
                                            <TableCell className="font-mono text-xs">{row.kodeUakpb}</TableCell>
                                            <TableCell className="font-mono text-xs">{row.kodeBarang}</TableCell>
                                            <TableCell>{row.noAwal}</TableCell>
                                            <TableCell>{row.noAkhir}</TableCell>
                                            <TableCell>{row.tglPerolehan}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <Button variant="outline" onClick={reset}>
                                ← Kembali
                            </Button>
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
                            <span className="text-green-500">✅ {stats.success}</span>
                            <span className="text-red-500">❌ {stats.error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {currentStep === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-500">
                            <CheckCircle className="w-5 h-5" />
                            Upload Selesai!
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-green-500/10 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-green-500">{stats.success}</div>
                                <div className="text-sm text-muted-foreground">Sukses</div>
                            </div>
                            <div className="bg-red-500/10 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-red-500">{stats.error}</div>
                                <div className="text-sm text-muted-foreground">Gagal</div>
                            </div>
                        </div>
                        <Button onClick={reset} className="w-full">
                            Upload Lagi
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
