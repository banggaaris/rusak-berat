import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Stepper } from "@/components/ui/stepper"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Upload, Trash2, Play, CheckCircle } from "lucide-react"

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
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleFileUpload = (file: File) => {
        if (!file.name.match(/\.(xlsx|xls)$/i)) {
            toast.error("Format file tidak valid")
            return
        }

        setFileName(file.name)
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const arrayBuffer = e.target?.result as ArrayBuffer
                const uint8Array = new Uint8Array(arrayBuffer)
                // @ts-ignore
                const workbook = XLSX.read(uint8Array, { type: "array" })
                const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])

                if (jsonData.length === 0) {
                    toast.error("File kosong")
                    return
                }

                if (!("object" in jsonData[0])) {
                    toast.error("Kolom 'object' tidak ditemukan")
                    return
                }

                setData(jsonData as RowData[])
                setCurrentStep(1)
                toast.success(`${jsonData.length} data ditemukan`)
            } catch (error) {
                toast.error("Gagal membaca file")
            }
        }
        reader.readAsArrayBuffer(file)
    }

    const startDelete = async () => {
        if (!auth.sessionId || !auth.tokenId || !auth.timestamp) {
            toast.error("Autentikasi tidak lengkap")
            return
        }

        setCurrentStep(2)
        setProgress(0)
        setStats({ success: 0, error: 0 })

        let successCount = 0
        let errorCount = 0

        for (let i = 0; i < data.length; i++) {
            const row = data[i]
            try {
                const response = await fetch("/api/delete", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        object: Number(row.object),
                        _headers: auth
                    })
                })

                if (response.ok) {
                    successCount++
                } else {
                    errorCount++
                }
            } catch {
                errorCount++
            }

            setProgress(Math.round(((i + 1) / data.length) * 100))
            setStats({ success: successCount, error: errorCount })
            await new Promise((r) => setTimeout(r, 100))
        }

        setCurrentStep(3)
        toast.success("Delete selesai!", { description: `Sukses: ${successCount}, Gagal: ${errorCount}` })
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
                            <Trash2 className="w-5 h-5" />
                            Upload Excel - Delete
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Format: <code className="bg-muted px-1 rounded">object</code> (ID transaksi)
                        </p>
                        <div
                            className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-destructive transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                            />
                            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Klik untuk upload file Excel</p>
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
                        <div className="max-h-[400px] overflow-auto rounded-md border">
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
                            Delete Selesai!
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-green-500/10 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-green-500">{stats.success}</div>
                                <div className="text-sm">Sukses</div>
                            </div>
                            <div className="bg-red-500/10 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-red-500">{stats.error}</div>
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
