import * as React from "react"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { Upload, Trash2, CheckCircle, ThumbsUp } from "lucide-react"

interface HeaderProps {
    activeTab: string
    onTabChange: (tab: string) => void
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
    const isUploadActive = activeTab === "rusak-berat" || activeTab === "henti-guna"

    return (
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col gap-4">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                            🚀 SAKTI Bulk Tool
                        </h1>
                        <p className="text-sm text-muted-foreground">Pengembangan Aset Tetap</p>
                    </div>

                    <NavigationMenu className="mx-auto">
                        <NavigationMenuList className="flex flex-wrap justify-center gap-1">
                            {/* Bulk Upload Dropdown */}
                            <NavigationMenuItem>
                                <NavigationMenuTrigger
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium",
                                        isUploadActive && "bg-primary text-primary-foreground"
                                    )}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Bulk Upload
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[200px] gap-1 p-2">
                                        <li>
                                            <NavigationMenuLink
                                                className={cn(
                                                    "block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors cursor-pointer",
                                                    "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                                    activeTab === "rusak-berat" && "bg-accent"
                                                )}
                                                onClick={() => onTabChange("rusak-berat")}
                                            >
                                                <div className="text-sm font-medium">📤 Rusak-Berat</div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Kode transaksi 203
                                                </p>
                                            </NavigationMenuLink>
                                        </li>
                                        <li>
                                            <NavigationMenuLink
                                                className={cn(
                                                    "block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors cursor-pointer",
                                                    "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                                    activeTab === "henti-guna" && "bg-accent"
                                                )}
                                                onClick={() => onTabChange("henti-guna")}
                                            >
                                                <div className="text-sm font-medium">📤 Henti-Guna</div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Kode transaksi 401
                                                </p>
                                            </NavigationMenuLink>
                                        </li>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>

                            {/* Delete */}
                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-2",
                                        activeTab === "delete"
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-accent hover:text-accent-foreground"
                                    )}
                                    onClick={() => onTabChange("delete")}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            {/* Validasi */}
                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-2",
                                        activeTab === "validasi"
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-accent hover:text-accent-foreground"
                                    )}
                                    onClick={() => onTabChange("validasi")}
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Validasi
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            {/* Approve */}
                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-2",
                                        activeTab === "approve"
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-accent hover:text-accent-foreground"
                                    )}
                                    onClick={() => onTabChange("approve")}
                                >
                                    <ThumbsUp className="w-4 h-4" />
                                    Approve
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
            </div>
        </header>
    )
}
