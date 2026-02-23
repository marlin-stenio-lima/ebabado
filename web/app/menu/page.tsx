
"use client";

import { useState, useEffect } from "react";
import { productService } from "@/lib/services/product-service";
import { Product, Category } from "@/types";
import { Loader2, Search, MapPin, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PublicMenuPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("Todos");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [productsData, categoriesData] = await Promise.all([
                productService.getProducts(),
                productService.getCategories()
            ]);
            setProducts(productsData.filter(p => p.active));
            setCategories(categoriesData);
        } catch (error) {
            console.error("Error loading menu data:", error);
        } finally {
            setLoading(false);
        }
    }

    const filteredProducts = products.filter(product => {
        const matchesCategory = activeCategory === "Todos" || product.categories?.name === activeCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Hero */}
            <header className="relative h-48 bg-gradient-to-r from-primary to-purple-800 text-white rounded-b-[2.5rem] shadow-lg overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-6">
                    <h1 className="text-3xl font-bold mb-2">Bloquinho ebabado</h1>
                    <div className="flex items-center gap-4 text-sm opacity-90">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Balcão Principal</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Aberto agora</span>
                    </div>
                </div>
            </header>

            {/* Search Bar - Floating */}
            <div className="px-6 -mt-6 relative z-20">
                <div className="bg-white rounded-full shadow-lg p-2 flex items-center border">
                    <Search className="w-5 h-5 text-muted-foreground ml-3" />
                    <input
                        type="text"
                        placeholder="O que você procura hoje?"
                        className="flex-1 bg-transparent border-none outline-none px-3 text-sm h-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Categories - Horizontal Scroll */}
            <div className="mt-8 px-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3">Categorias</h2>
                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                    <button
                        onClick={() => setActiveCategory("Todos")}
                        className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-all ${activeCategory === "Todos"
                            ? "bg-primary text-white shadow-md scale-105"
                            : "bg-white text-gray-600 border hover:bg-gray-100"
                            }`}
                    >
                        Todos
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.name)}
                            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat.name
                                ? "bg-primary text-white shadow-md scale-105"
                                : "bg-white text-gray-600 border hover:bg-gray-100"
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Grid */}
            <div className="px-6 mt-2">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                    {activeCategory === "Todos" ? "Destaques" : activeCategory}
                </h2>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
                            <div className="h-48 bg-gray-200 relative">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gray-100">
                                        Sem foto
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                                    <Badge className="bg-white/90 text-black backdrop-blur-sm shadow-sm hover:bg-white">
                                        R$ {product.price.toFixed(2)}
                                    </Badge>
                                    {product.stock <= 0 && (
                                        <Badge className="bg-red-500 text-white shadow-sm hover:bg-red-600">
                                            Esgotado
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                                    {product.description || `Delicioso ${product.name}, preparado especialmente para você.`}
                                </p>
                                <Button
                                    className="w-full rounded-xl font-bold h-12"
                                    disabled={product.stock <= 0}
                                    variant={product.stock <= 0 ? "secondary" : "default"}
                                >
                                    {product.stock > 0 ? "Ver Detalhes" : "Indisponível"}
                                </Button>
                            </div>
                        </div>
                    ))}

                    {filteredProducts.length === 0 && (
                        <div className="col-span-full text-center py-10 text-muted-foreground p-8 bg-white rounded-[2rem] border border-dashed">
                            Nenhum produto encontrado nesta categoria. 😕
                        </div>
                    )}
                </div>
            </div>

            <footer className="mt-12 text-center text-xs text-muted-foreground pb-8">
                <p>Cardápio Digital • Acess Vibe</p>
            </footer>
        </div>
    );
}
