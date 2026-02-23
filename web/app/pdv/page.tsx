
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Minus, Plus, ShoppingCart, Trash2, ArrowLeft, Loader2, CreditCard, Banknote, QrCode, Wallet, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ChangeCalculator } from "@/components/change-calculator";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { productService } from "@/lib/services/product-service";
import { salesService } from "@/lib/services/sales-service"; // Import salesService
import { Product, Category, CartItem } from "@/types";

type PaymentMethod = 'money' | 'credit' | 'debit' | 'pix' | null;

export default function PDVPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedCategory, setSelectedCategory] = useState("Todos");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    // UI State
    const [isCartOpen, setIsCartOpen] = useState(true);

    // Payment State
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
    const [processingPayment, setProcessingPayment] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const resetPaymentState = () => {
        setPaymentMethod(null);
        setProcessingPayment(false);
    };

    const handleOpenPayment = (open: boolean) => {
        setIsPaymentOpen(open);
        if (!open) resetPaymentState();
    };

    async function loadData() {
        try {
            const [productsData, categoriesData] = await Promise.all([
                productService.getProducts(),
                productService.getCategories()
            ]);
            setProducts(productsData.filter(p => p.active));
            setCategories(categoriesData);
        } catch (error) {
            console.error("Error loading PDV data:", error);
        } finally {
            setLoading(false);
        }
    }

    const filteredProducts = useMemo(() => {
        return selectedCategory === "Todos"
            ? products
            : products.filter(p => p.categories?.name === selectedCategory);
    }, [selectedCategory, products]);

    const addToCart = (product: Product) => {
        if (product.stock <= 0) {
            alert("Produto sem estoque!");
            return;
        }

        if (!isCartOpen) setIsCartOpen(true);
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);

            if (existing && existing.quantity >= product.stock) {
                alert("Estoque insuficiente!");
                return prev;
            }

            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => {
            return prev.map(item => {
                if (item.product.id === productId) {
                    const product = products.find(p => p.id === productId);
                    const newQty = item.quantity + delta;

                    if (product && delta > 0 && newQty > product.stock) {
                        alert("Estoque insuficiente!");
                        return item;
                    }

                    return newQty > 0 ? { ...item, quantity: newQty } : item;
                }
                return item;
            });
        });
    };

    const clearCart = () => setCart([]);
    const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    const handleFinishSale = async () => {
        setProcessingPayment(true);

        try {
            // 1. Decrement Stock
            await Promise.all(cart.map(item =>
                productService.decrementStock(item.product.id, item.quantity)
            ));

            // 2. Create Sale Record
            if (paymentMethod) {
                await salesService.createSale(cart, cartTotal, paymentMethod);
            }

            console.log("Venda Finalizada e Registrada:", { cart, total: cartTotal, method: paymentMethod });

            alert("Venda realizada com sucesso!");
            clearCart();
            setIsPaymentOpen(false);
            resetPaymentState();
            loadData(); // Reload stock
        } catch (error) {
            console.error("Error finishing sale:", error);
            alert("Erro ao finalizar venda. Tente novamente.");
        } finally {
            setProcessingPayment(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p>Carregando PDV...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 relative">

            {/* Esquerda: Catálogo de Produtos */}
            <div className={`flex-1 flex flex-col p-4 gap-4 overflow-hidden transition-all duration-300 ${isCartOpen ? "mr-[400px]" : ""}`}>
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="w-6 h-6" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">PDV Balcão</h1>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Caixa Aberto • Operador: Admin
                    </div>
                </header>

                <Tabs defaultValue="Todos" className="w-full flex-1 flex flex-col" onValueChange={setSelectedCategory}>
                    <TabsList className="w-full justify-start h-12 p-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4 overflow-x-auto">
                        <TabsTrigger value="Todos" className="px-6 py-2">Todos</TabsTrigger>
                        {categories.map(cat => (
                            <TabsTrigger
                                key={cat.id}
                                value={cat.name}
                                className="px-6 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all"
                            >
                                {cat.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <div className="flex-1 overflow-y-auto pr-2 pb-20">
                        <div className={`grid gap-4 transition-all duration-300 ${isCartOpen ? "grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"}`}>
                            {filteredProducts.map(product => (
                                <Card
                                    key={product.id}
                                    className="cursor-pointer hover:shadow-lg transition-all active:scale-95 border-none shadow-sm overflow-hidden group"
                                    onClick={() => addToCart(product)}
                                >
                                    <div className="aspect-square relative overflow-hidden bg-gray-200">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-muted-foreground">
                                                <span className="text-xs">Sem foto</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1">
                                            <div className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                                                R$ {product.price.toFixed(2)}
                                            </div>
                                            <div className={`text-xs font-bold px-2 py-0.5 rounded-full shadow-sm ${product.stock > 0 ? 'bg-white/90 text-gray-700' : 'bg-red-500 text-white'}`}>
                                                {product.stock > 0 ? `${product.stock} un` : 'Esgotado'}
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="p-3">
                                        <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                                        <p className="text-xs text-muted-foreground">{product.categories?.name || "Geral"}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </Tabs>
            </div>

            {/* Direita: Carrinho (Fixo no lado direito) */}
            <div
                className={`fixed top-0 right-0 h-full bg-white dark:bg-gray-800 border-l shadow-2xl flex flex-col z-20 transition-transform duration-300 ease-in-out w-[400px] ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Botão de Recolher (Aba Lateral) */}
                {isCartOpen && (
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="absolute top-1/2 -left-8 transform -translate-y-1/2 bg-white dark:bg-gray-800 border-l border-t border-b shadow-[-4px_0_8px_rgba(0,0,0,0.1)] h-16 w-8 rounded-l-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-30 flex items-center justify-center group"
                        title="Recolher Carrinho"
                    >
                        <ChevronRight className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    </button>
                )}

                <div className="p-4 border-b flex items-center justify-between bg-primary text-primary-foreground">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        <span className="font-bold text-lg">Carrinho</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 opacity-50">
                            <ShoppingCart className="w-16 h-16" />
                            <p>Carrinho vazio</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border">
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm">{item.product.name}</span>
                                    <span className="text-xs text-muted-foreground">R$ {item.product.price.toFixed(2)} un</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-md border px-1">
                                        <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 hover:text-red-500"><Minus className="w-3 h-3" /></button>
                                        <span className="text-sm font-mono w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 hover:text-green-500"><Plus className="w-3 h-3" /></button>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="font-bold text-sm min-w-[60px] text-right">
                                            R$ {(item.product.price * item.quantity).toFixed(2)}
                                        </span>
                                        <button onClick={() => updateQuantity(item.product.id, -item.quantity)} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 mt-1">
                                            <Trash2 className="w-3 h-3" /> Remover
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t space-y-4">
                    <div className="flex justify-between items-end border-b pb-4">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">R$ {cartTotal.toFixed(2)}</span>
                    </div>

                    <Dialog open={isPaymentOpen} onOpenChange={handleOpenPayment}>
                        <DialogTrigger asChild>
                            <Button className="w-full h-14 text-lg font-bold shadow-lg" size="lg" disabled={cart.length === 0}>
                                Finalizar Venda
                                <span className="ml-2 opacity-80 text-sm font-normal">(F12)</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            {!paymentMethod ? (
                                <>
                                    <DialogHeader>
                                        <DialogTitle>Selecione a Forma de Pagamento</DialogTitle>
                                        <DialogDescription>
                                            Escolha como o cliente deseja pagar o total de <b>R$ {cartTotal.toFixed(2)}</b>.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid grid-cols-2 gap-4 py-4">
                                        <Button
                                            variant="outline"
                                            className="h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all text-base"
                                            onClick={() => setPaymentMethod('money')}
                                        >
                                            <Banknote className="w-8 h-8" />
                                            Dinheiro
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all text-base"
                                            onClick={() => setPaymentMethod('pix')}
                                        >
                                            <QrCode className="w-8 h-8" />
                                            Pix
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all text-base"
                                            onClick={() => setPaymentMethod('debit')}
                                        >
                                            <CreditCard className="w-8 h-8" />
                                            Cartão Débito
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all text-base"
                                            onClick={() => setPaymentMethod('credit')}
                                        >
                                            <Wallet className="w-8 h-8" />
                                            Cartão Crédito
                                        </Button>
                                    </div>
                                </>
                            ) : paymentMethod === 'money' ? (
                                <ChangeCalculator
                                    fixedTotal={cartTotal}
                                    onBack={resetPaymentState}
                                    onFinish={handleFinishSale}
                                />
                            ) : (
                                <>
                                    <DialogHeader>
                                        <DialogTitle>Confirmar Pagamento</DialogTitle>
                                        <DialogDescription>
                                            Pagamento via {paymentMethod === 'pix' ? 'Pix' : paymentMethod === 'debit' ? 'Débito' : 'Crédito'}.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex flex-col items-center justify-center py-8 gap-4">
                                        <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center">
                                            {paymentMethod === 'pix' ? <QrCode className="w-10 h-10" /> : <CreditCard className="w-10 h-10" />}
                                        </div>
                                        <div className="text-center">
                                            <p className="text-muted-foreground text-sm">Valor total a cobrar</p>
                                            <p className="text-4xl font-bold mt-2">R$ {cartTotal.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="w-full" onClick={resetPaymentState}>
                                            Voltar
                                        </Button>
                                        <Button className="w-full" onClick={handleFinishSale} disabled={processingPayment}>
                                            {processingPayment ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                            Confirmar e Finalizar
                                        </Button>
                                    </div>
                                </>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Botão Flutuante (FAB) para Abrir Carrinho */}
            {!isCartOpen && (
                <div className="fixed bottom-6 right-6 z-30">
                    <Button
                        size="lg"
                        className="rounded-full shadow-2xl h-16 w-16 p-0 relative animate-in fade-in zoom-in duration-300 bg-primary hover:bg-primary/90"
                        onClick={() => setIsCartOpen(true)}
                    >
                        <ShoppingCart className="w-8 h-8 text-white" />
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm">
                                {totalItems}
                            </span>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
