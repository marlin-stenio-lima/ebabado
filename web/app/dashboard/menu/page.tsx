
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, Download, ExternalLink, QrCode as QrIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { productService } from "@/lib/services/product-service";
import { Product } from "@/types";

export default function MenuSettingsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [menuUrl, setMenuUrl] = useState("");

    useEffect(() => {
        // Construct the full URL for the digital menu
        if (typeof window !== "undefined") {
            setMenuUrl(`${window.location.origin}/menu`);
        }
        loadProducts();
    }, []);

    async function loadProducts() {
        try {
            const data = await productService.getProducts();
            // Filter only active products if you have an 'active' flag, 
            // for now we assume all fetched are intended for the menu
            setProducts(data);
        } catch (error) {
            console.error("Error loading products:", error);
        } finally {
            setLoading(false);
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(menuUrl);
        alert("Link copiado para a área de transferência!");
    };

    const downloadQRCode = () => {
        const svg = document.getElementById("menu-qrcode");
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx?.drawImage(img, 0, 0);
                const pngFile = canvas.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.download = "cardapio-qrcode.png";
                downloadLink.href = pngFile;
                downloadLink.click();
            };
            img.src = "data:image/svg+xml;base64," + btoa(svgData);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Cardápio Digital</h2>
                <p className="text-muted-foreground">
                    Configure e compartilhe o cardápio digital do seu estabelecimento.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* QR Code e Link */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <QrIcon className="w-5 h-5 text-primary" /> Compartilhamento
                        </CardTitle>
                        <CardDescription>
                            Seu cliente pode escanear o QR Code abaixo ou acessar pelo link direto.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border shadow-sm w-fit mx-auto">
                            {menuUrl && (
                                <QRCodeSVG
                                    id="menu-qrcode"
                                    value={menuUrl}
                                    size={200}
                                    level={"H"}
                                    includeMargin={true}
                                />
                            )}
                        </div>

                        <div className="flex gap-2 justify-center">
                            <Button variant="outline" onClick={downloadQRCode} className="gap-2">
                                <Download className="w-4 h-4" /> Baixar QR Code
                            </Button>
                            <Link href="/menu" target="_blank">
                                <Button variant="outline" className="gap-2">
                                    <ExternalLink className="w-4 h-4" /> Testar Cardápio
                                </Button>
                            </Link>
                        </div>

                        <div className="flex gap-2">
                            <Input value={menuUrl} readOnly className="font-mono text-sm" />
                            <Button size="icon" onClick={copyToClipboard} title="Copiar Link">
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Preview de Itens */}
                <Card>
                    <CardHeader>
                        <CardTitle>Itens Visíveis ({products.length})</CardTitle>
                        <CardDescription>
                            Estes são os produtos que aparecerão no seu cardápio digital.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-muted/30 rounded-lg p-4 h-[400px] overflow-y-auto space-y-3">
                            {loading ? (
                                <p className="text-center text-muted-foreground py-10">Carregando produtos...</p>
                            ) : products.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    Nenhum produto cadastrado.
                                    <br />
                                    <Link href="/dashboard/products" className="text-primary underline">Cadastre produtos aqui</Link>.
                                </div>
                            ) : (
                                products.map((product) => (
                                    <div key={product.id} className="flex items-center gap-3 bg-card p-3 rounded-md border shadow-sm">
                                        <div className="h-12 w-12 rounded-md bg-muted overflow-hidden shrink-0">
                                            {product.image_url ? (
                                                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">Foto</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{product.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{product.categories?.name}</span>
                                                <span>•</span>
                                                <span className="font-semibold text-primary">R$ {product.price.toFixed(2)}</span>
                                                <span>•</span>
                                                <span className={`text-xs ${product.stock > 0 ? 'text-muted-foreground' : 'text-red-500 font-bold'}`}>
                                                    {product.stock} un
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            className={`h-2 w-2 rounded-full ${product.active ? 'bg-green-500' : 'bg-red-300'}`}
                                            title={product.active ? "Visível no Menu" : "Oculto no Menu"}
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="mt-4 text-center">
                            <Link href="/dashboard/products" className="text-sm text-primary hover:underline">
                                Gerenciar Produtos no Catálogo &rarr;
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
