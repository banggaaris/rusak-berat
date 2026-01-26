import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Stepper } from "@/components/ui/stepper"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Search, CheckCircle, Play } from "lucide-react"

const APPROVER_LOGIN_WRAPPER = {
    dekon2: "KP",
    dekonDesc: "Kantor Pusat",
    dekonId: "1",
    deptDesc: "KEMENTERIAN KEHUTANAN",
    deptId: "143",
    email: "bang0058@sakti.mail.go.id",
    jenisLogin: 1,
    jenisSatkerDesc: "PERMANEN-PUSAT (Fixed Satker in Central)",
    jenisSatkerId: "1",
    kanwilDjpbDesc: "JAKARTA",
    kanwilDjpbId: "11",
    kodeBaPelaksana: null,
    kodeEs1Pelaksana: null,
    kodeWilayah: "0199",
    kppnDesc: "Jakarta VII",
    kppnId: "182",
    levelNik: 100,
    listRoles: ["AST_UAKPB_APPROVER", "PER_APPROVER_INDUK"],
    lokasiSatker: "01.00",
    nama: "BANGGA ARI SAPUTRA",
    nik: "3175071004930006",
    nip: "199304102020121006",
    role: 3,
    satkerDesc: "KANTOR PUSAT SEKRETARIAT JENDERAL KEMENTERIAN  KEHUTANAN",
    satkerId: "693521",
    sessionId: null,
    status: false,
    tahunAnggaran: 2025,
    tahunAnggaranId: "2025",
    tahunAnggaranTanggalAkhir: "2025-12-31T01:23:42.785Z",
    tahunAnggaranTanggalAwal: "2025-01-01T01:23:42.785Z",
    telpon: "08978284085",
    uakpbId: "143010199693521007KP",
    unitDesc: "SEKRETARIAT JENDERAL",
    unitId: "143.01",
    unitKode: "01",
    unitTeknis: "69352100",
    userId: "apr_693521_199304102020121006"
}

interface ApproveFlowProps {
    auth: { sessionId: string; tokenId: string; timestamp: string }
}

interface DataItem {
    id: number
    noSPPA: string
    kodeBarang: string
    namaBarang: string
    noAwal: number
    noAkhir: number
    tglPerolehan: string
    [key: string]: unknown
}

const steps = ["Cari Data", "Pilih Item", "Approve", "Selesai"]

export function ApproveFlow({ auth }: ApproveFlowProps) {
    const [currentStep, setCurrentStep] = React.useState(0)
    const [kodeUakpb, setKodeUakpb] = React.useState("")
    const [pageSize, setPageSize] = React.useState("10")
    const [data, setData] = React.useState<DataItem[]>([])
    const [selected, setSelected] = React.useState<number[]>([])
    const [isLoading, setIsLoading] = React.useState(false)

    const searchData = async () => {
        if (!kodeUakpb) {
            toast.error("Harap isi Kode UAKPB")
            return
        }
        if (!auth.sessionId || !auth.tokenId) {
            toast.error("Autentikasi tidak lengkap")
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch("/api/find-approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    _headers: auth,
                    kodeUakpb,
                    currentPage: 1,
                    pageSize: Number(pageSize)
                })
            })

            const result = await response.json()
            if (result.status && result.object?.dataList) {
                setData(result.object.dataList)
                setCurrentStep(1)
                toast.success(`${result.object.dataList.length} data ditemukan`)
            } else {
                toast.error(result.message || "Tidak ada data")
            }
        } catch (error) {
            toast.error("Gagal mencari data")
        }
        setIsLoading(false)
    }

    const toggleSelect = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        )
    }

    const toggleAll = () => {
        if (selected.length === data.length) {
            setSelected([])
        } else {
            setSelected(data.map((d) => d.id))
        }
    }

    const startApproval = async () => {
        if (selected.length === 0) {
            toast.error("Pilih minimal 1 item")
            return
        }

        setCurrentStep(2)
        const selectedItems = data
            .filter((d) => selected.includes(d.id))
            .map((item) => ({
                ...item,
                selected: true,
                statusPersetujuan: "3",
                tglPembukuan: "2025-12-30T17:00:00.000Z"
            }))

        try {
            toast.info("Step 1/2: Validasi...")
            const valRes = await fetch("/api/validate-persetujuan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ _headers: auth, listPersetujuanWrapper: selectedItems })
            })
            const valResult = await valRes.json()

            if (!valResult.status) {
                toast.error("Validasi gagal: " + valResult.message)
                return
            }

            toast.info("Step 2/2: Menyimpan approval...")
            const saveRes = await fetch("/api/save-persetujuan", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    _headers: auth,
                    listPersetujuanWrapper: selectedItems,
                    loginWrapper: APPROVER_LOGIN_WRAPPER
                })
            })
            const saveResult = await saveRes.json()

            if (saveResult.status) {
                setCurrentStep(3)
                toast.success(`${selected.length} item berhasil di-approve!`)
            } else {
                toast.error("Gagal menyimpan: " + saveResult.message)
            }
        } catch (error) {
            toast.error("Error: " + String(error))
        }
    }

    const reset = () => {
        setCurrentStep(0)
        setData([])
        setSelected([])
    }

    return (
        <div className="space-y-6">
            <Stepper steps={steps} currentStep={currentStep} />

            {currentStep === 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="w-5 h-5" />
                            Cari Data Approve
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Kode UAKPB</label>
                                <Input
                                    placeholder="143010199693521007KP"
                                    value={kodeUakpb}
                                    onChange={(e) => setKodeUakpb(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Page Size</label>
                                <Input
                                    type="number"
                                    value={pageSize}
                                    onChange={(e) => setPageSize(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button onClick={searchData} disabled={isLoading} className="w-full">
                            <Search className="w-4 h-4 mr-2" />
                            {isLoading ? "Loading..." : "Cari Data"}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {currentStep === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>📋 Pilih Item ({selected.length}/{data.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-[400px] overflow-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selected.length === data.length && data.length > 0}
                                                onCheckedChange={toggleAll}
                                            />
                                        </TableHead>
                                        <TableHead>ID</TableHead>
                                        <TableHead>No SPPA</TableHead>
                                        <TableHead>Kode Barang</TableHead>
                                        <TableHead>Nama Barang</TableHead>
                                        <TableHead>No</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selected.includes(item.id)}
                                                    onCheckedChange={() => toggleSelect(item.id)}
                                                />
                                            </TableCell>
                                            <TableCell>{item.id}</TableCell>
                                            <TableCell>{item.noSPPA || "-"}</TableCell>
                                            <TableCell className="font-mono text-xs">{item.kodeBarang}</TableCell>
                                            <TableCell>{item.namaBarang}</TableCell>
                                            <TableCell>{item.noAwal}-{item.noAkhir}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <Button variant="outline" onClick={reset}>← Kembali</Button>
                            <Button onClick={startApproval} className="flex-1" disabled={selected.length === 0}>
                                <Play className="w-4 h-4 mr-2" />
                                Approve ({selected.length} item)
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {currentStep === 2 && (
                <Card>
                    <CardHeader><CardTitle>⏳ Processing...</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-center text-muted-foreground">Sedang memproses approval...</p>
                    </CardContent>
                </Card>
            )}

            {currentStep === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-500">
                            <CheckCircle className="w-5 h-5" />
                            Approval Selesai!
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center mb-4">{selected.length} item telah di-approve</p>
                        <Button onClick={reset} className="w-full">Mulai Lagi</Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
