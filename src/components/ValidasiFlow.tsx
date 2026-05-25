import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Stepper } from "@/components/ui/stepper"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/PageHeader"
import { LoadingOverlay } from "@/components/LoadingOverlay"
import { toast } from "sonner"
import { Search, CheckCircle, Play } from "lucide-react"

const LOGIN_WRAPPER = {
    dekon2: "KP",
    dekonDesc: "Kantor Pusat",
    dekonId: "1",
    deptDesc: "KEMENTERIAN KEHUTANAN",
    deptId: "143",
    email: "lenn0029@sakti.mail.go.id",
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
    listRoles: ["AST_UAKPB_VALIDATOR"],
    lokasiSatker: "01.00",
    nama: "LENNY JUANITA SARI",
    nik: "3175016406750001",
    nip: "197506242000032003",
    role: 2,
    satkerDesc: "KANTOR PUSAT SEKRETARIAT JENDERAL KEMENTERIAN  KEHUTANAN",
    satkerId: "693521",
    sessionId: null,
    status: false,
    tahunAnggaran: 2025,
    tahunAnggaranId: "2025",
    tahunAnggaranTanggalAkhir: "2025-12-31T23:59:59.708Z",
    tahunAnggaranTanggalAwal: "2025-01-01T23:59:59.708Z",
    telpon: "081291129872",
    uakpbId: "143010199693521007KP",
    unitDesc: "SEKRETARIAT JENDERAL",
    unitId: "143.01",
    unitKode: "01",
    unitTeknis: "69352100",
    userId: "val_693521_197506242000032003"
}

interface ValidasiFlowProps {
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

const steps = ["Cari Data", "Pilih Item", "Validasi", "Selesai"]

export function ValidasiFlow({ auth }: ValidasiFlowProps) {
    const [currentStep, setCurrentStep] = React.useState(0)
    const [kodeUakpb, setKodeUakpb] = React.useState("")
    const [pageSize, setPageSize] = React.useState("10")
    const [data, setData] = React.useState<DataItem[]>([])
    const [selected, setSelected] = React.useState<number[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [busy, setBusy] = React.useState(false)
    const [busyMsg, setBusyMsg] = React.useState("Memproses...")

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
        setBusyMsg("Mencari data...")
        setBusy(true)
        try {
            const response = await fetch("/api/find-persetujuan", {
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
        } finally {
            setIsLoading(false)
            setBusy(false)
        }
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

    const startValidation = async () => {
        if (selected.length === 0) {
            toast.error("Pilih minimal 1 item")
            return
        }

        setCurrentStep(2)
        setBusyMsg("Memproses validasi...")
        setBusy(true)
        const selectedItems = data
            .filter((d) => selected.includes(d.id))
            .map((item) => ({
                ...item,
                selected: true,
                statusPersetujuan: "2",
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

            toast.info("Step 2/2: Menyimpan...")
            const saveRes = await fetch("/api/save-persetujuan", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    _headers: auth,
                    listPersetujuanWrapper: selectedItems,
                    loginWrapper: LOGIN_WRAPPER
                })
            })
            const saveResult = await saveRes.json()

            if (saveResult.status) {
                setCurrentStep(3)
                toast.success(`${selected.length} item berhasil divalidasi!`)
            } else {
                toast.error("Gagal menyimpan: " + saveResult.message)
            }
        } catch (error) {
            toast.error("Error: " + String(error))
        } finally {
            setBusy(false)
        }
    }

    const reset = () => {
        setCurrentStep(0)
        setData([])
        setSelected([])
    }

    return (
        <div className="space-y-6">
            <LoadingOverlay show={busy} message={busyMsg} />
            <PageHeader
                icon={CheckCircle}
                title="Validasi"
                description="Cari dan validasi data persetujuan aset"
            />
            <Stepper steps={steps} currentStep={currentStep} />

            {currentStep === 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="w-5 h-5" />
                            Cari Data Validasi
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
                        <div className="max-h-100 overflow-auto rounded-md border">
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
                            <Button onClick={startValidation} className="flex-1" disabled={selected.length === 0}>
                                <Play className="w-4 h-4 mr-2" />
                                Validasi ({selected.length} item)
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {currentStep === 2 && (
                <Card>
                    <CardHeader><CardTitle>⏳ Processing...</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-center text-muted-foreground">Sedang memproses validasi...</p>
                    </CardContent>
                </Card>
            )}

            {currentStep === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <CheckCircle className="w-5 h-5" />
                            Validasi Selesai!
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center mb-4">{selected.length} item telah divalidasi</p>
                        <Button onClick={reset} className="w-full">Mulai Lagi</Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
