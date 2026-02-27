import { useState, useEffect } from "react";
import { productService } from "@/lib/services/product-service";
import { Product, Category } from "@/types";
import { Loader2, Search, MapPin, Clock, Info, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function Menu() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("Todos");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const [productsData, categoriesData] = await Promise.all([productService.getProducts(), productService.getCategories()]);
            setProducts(productsData.filter(p => p.active));
            setCategories(categoriesData);
        } catch (error) { console.error("Error loading menu data:", error); }
        finally { setLoading(false); }
    }

    const filteredProducts = products.filter(product => {
        const matchesCategory = activeCategory === "Todos" || product.categories?.name === activeCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-zinc-500 font-medium animate-pulse">Preparando cardápio...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fcfcfd] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-primary/20">
            {/* Hero Section */}
            <header className="relative h-[280px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center transition-transform duration-1000 scale-105" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent" />
                <div className="absolute inset-0 backdrop-blur-[2px]" />

                <div className="relative z-10 w-full max-w-4xl px-6 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-4">
                        <ShoppingBag className="w-3 h-3" /> Bem-vindo ao
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">Bloquinho é babado</h1>
                    <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-white/90">
                        <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                            <MapPin className="w-3.5 h-3.5 text-primary" /> Balcão Principal
                        </span>
                        <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" /> Aberto • Atendimento Rápido
                        </span>
                    </div>
                </div>
            </header>

            {/* Sticky Search & Navigation */}
            <div className="sticky top-0 z-50 bg-[#fcfcfd]/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
                <div className="max-w-4xl mx-auto p-4 space-y-4">
                    {/* Search Field */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            type="text"
                            placeholder="Pesquisar itens do cardápio..."
                            className="w-full h-12 pl-11 bg-zinc-100/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-2xl focus-visible:ring-primary focus-visible:ring-offset-0 transition-all text-base"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
                        <button
                            onClick={() => setActiveCategory("Todos")}
                            className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 transform active:scale-95 ${activeCategory === "Todos" ? "bg-primary text-white shadow-lg shadow-primary/25" : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
                        >
                            Todos
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.name)}
                                className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 transform active:scale-95 ${activeCategory === cat.name ? "bg-primary text-white shadow-lg shadow-primary/25" : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Menu Feed */}
            <main className="max-w-4xl mx-auto px-6 pt-8 pb-32">
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white capitalize">
                            {activeCategory === "Todos" ? "🔥 Destaques" : activeCategory}
                        </h2>
                        <p className="text-zinc-500 text-sm font-medium">Os melhores itens selecionados para você</p>
                    </div>
                    <Badge variant="outline" className="rounded-lg h-7 border-zinc-200 dark:border-zinc-800 font-bold text-zinc-500">
                        {filteredProducts.length} itens
                    </Badge>
                </div>

                <div className="grid gap-8 sm:grid-cols-2">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="group bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 flex flex-col animate-in fade-in slide-in-from-bottom-4">
                            <div className="h-60 relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-100 dark:bg-zinc-900/50">
                                        <Info className="w-8 h-8 opacity-20 mb-2" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Sem imagem disponível</span>
                                    </div>
                                )}

                                {/* Float Price Badge */}
                                <div className="absolute bottom-4 left-4">
                                    <div className="px-4 py-2 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xl border border-white/20 dark:border-zinc-800 flex flex-col">
                                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-tighter">Valor</span>
                                        <span className="text-lg font-black text-zinc-900 dark:text-white">R$ {product.price.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Availability Overlay */}
                                {product.stock <= 0 && (
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                                        <Badge className="bg-red-500 text-white shadow-2xl scale-125 px-4 rounded-full font-black border-none">ESGOTADO</Badge>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="font-black text-xl text-zinc-900 dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2 mb-6 flex-1 font-medium">
                                    {product.description || `Delicioso ${product.name}, ingrediente selecionado e preparado com o máximo padrão de qualidade.`}
                                </p>
                                <Button
                                    className="w-full rounded-[1.25rem] font-black h-14 text-base shadow-xl active:scale-95 transition-all shadow-primary/10 hover:shadow-primary/20"
                                    disabled={product.stock <= 0}
                                    variant={product.stock <= 0 ? "secondary" : "default"}
                                >
                                    {product.stock > 0 ? "Pedir Agora" : "Produto Indisponível"}
                                </Button>
                            </div>
                        </div>
                    ))}

                    {filteredProducts.length === 0 && (
                        <div className="col-span-full text-center py-20 px-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95">
                            <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-6 h-6 text-zinc-400" />
                            </div>
                            <h3 className="font-bold text-lg mb-1">Nenhum resultado</h3>
                            <p className="text-zinc-500 text-sm">Tente buscar por outro termo ou categoria.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Bottom Bar Info */}
            <footer className="mt-8 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-10 px-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div className="max-w-4xl mx-auto space-y-4">
                    <p className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest opacity-80">Bloquinho é babado</p>
                    <p className="text-xs text-zinc-400 font-medium">© 2026 • Cardápio Digital Premium • Todos os direitos reservados</p>
                    <div className="flex items-center justify-center gap-6 pt-4 grayscale opacity-40">
                        <div className="w-1 h-1 rounded-full bg-zinc-400" />
                        <div className="w-1 h-1 rounded-full bg-zinc-400" />
                        <div className="w-1 h-1 rounded-full bg-zinc-400" />
                    </div>
                </div>
            </footer>
        </div>
    );
}
