import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Package, Loader2, ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { productService } from "@/lib/services/product-service";
import { Product, Category } from "@/types";

export default function DashboardProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newPrice, setNewPrice] = useState("");
    const [newStock, setNewStock] = useState("");
    const [newCategoryId, setNewCategoryId] = useState("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            setLoading(true);
            const [productsData, categoriesData] = await Promise.all([productService.getProducts(), productService.getCategories()]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (error) { console.error("Error loading data:", error); }
        finally { setLoading(false); }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { setSelectedImage(file); setPreviewUrl(URL.createObjectURL(file)); }
    };

    function openCreateDialog() {
        setEditingProduct(null);
        setNewName("");
        setNewPrice("");
        setNewStock("");
        setNewCategoryId("");
        setSelectedImage(null);
        setPreviewUrl(null);
        setIsDialogOpen(true);
    }

    function openEditDialog(product: Product) {
        setEditingProduct(product);
        setNewName(product.name);
        setNewPrice(product.price.toString());
        setNewStock(product.stock.toString());
        setNewCategoryId(product.category_id);
        setSelectedImage(null);
        setPreviewUrl(product.image_url || null);
        setIsDialogOpen(true);
    }

    async function handleSave() {
        if (!newName || !newPrice || !newCategoryId) { alert("Preencha todos os campos obrigatórios"); return; }
        try {
            setSaving(true);
            let imageUrl = previewUrl;
            if (selectedImage) imageUrl = await productService.uploadImage(selectedImage);

            const productData = {
                name: newName,
                price: parseFloat(newPrice),
                stock: parseInt(newStock) || 0,
                category_id: newCategoryId,
                image_url: imageUrl,
                active: true
            };

            if (editingProduct) {
                await productService.updateProduct(editingProduct.id, productData);
            } else {
                await productService.createProduct(productData);
            }

            setIsDialogOpen(false);
            loadData();
        } catch (error) { console.error("Error saving product:", error); alert("Erro ao salvar produto."); }
        finally { setSaving(false); }
    }

    async function toggleActive(product: Product) {
        try {
            const updatedProduct = await productService.updateProduct(product.id, { active: !product.active });
            setProducts(products.map(p => p.id === product.id ? { ...p, active: updatedProduct.active } : p));
        } catch (error) { console.error("Error toggling active status:", error); alert("Erro ao atualizar status do produto."); }
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir este produto?")) return;
        try {
            await productService.deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) { console.error("Error deleting product:", error); alert("Erro ao excluir produto."); }
    }

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
            <header className="sticky top-0 z-10 border-b bg-background px-6 py-4 flex items-center justify-between">
                <div><h1 className="text-xl font-bold">Gestão de Produtos</h1><p className="text-sm text-muted-foreground">Gerencie o cardápio do seu evento</p></div>
                <div className="flex gap-4">
                    <div className="relative w-64"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar produto..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild><Button onClick={openCreateDialog} className="gap-2"><Plus className="h-4 w-4" /> Novo Produto</Button></DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader><DialogTitle>{editingProduct ? "Editar Produto" : "Adicionar Novo Produto"}</DialogTitle><DialogDescription>{editingProduct ? "Altere as informações do produto abaixo." : "Preencha os detalhes do produto e adicione uma imagem."}</DialogDescription></DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="flex flex-col items-center justify-center gap-4 mb-4">
                                    <div className="relative flex h-32 w-32 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/50 hover:bg-muted transition-colors overflow-hidden" onClick={() => fileInputRef.current?.click()}>
                                        {previewUrl ? <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" /> : <div className="flex flex-col items-center gap-1 text-muted-foreground"><ImageIcon className="h-8 w-8" /><span className="text-xs font-medium">Add Foto</span></div>}
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Nome</Label><Input id="name" value={newName} onChange={e => setNewName(e.target.value)} className="col-span-3" placeholder="Ex: Cerveja Heineken" /></div>
                                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="price" className="text-right">Preço</Label><Input id="price" type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="col-span-3" placeholder="0.00" /></div>
                                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="stock" className="text-right">Estoque</Label><Input id="stock" type="number" value={newStock} onChange={e => setNewStock(e.target.value)} className="col-span-3" placeholder="0" /></div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="category" className="text-right">Categoria</Label>
                                    <Select onValueChange={setNewCategoryId} value={newCategoryId}><SelectTrigger className="col-span-3"><SelectValue placeholder="Selecione a categoria" /></SelectTrigger><SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent></Select>
                                </div>
                            </div>
                            <DialogFooter><Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">{saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Salvando...</> : "Salvar Produto"}</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            <main className="flex-1 p-6">
                <Card><CardContent className="p-0">
                    <Table>
                        <TableHeader><TableRow><TableHead className="w-[80px]">Imagem</TableHead><TableHead>Nome</TableHead><TableHead>Categoria</TableHead><TableHead>Preço</TableHead><TableHead>Estoque</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={7} className="h-24 text-center"><div className="flex justify-center items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Carregando produtos...</div></TableCell></TableRow>
                            ) : filteredProducts.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Nenhum produto encontrado.</TableCell></TableRow>
                            ) : filteredProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell><Avatar className="h-10 w-10 rounded-lg"><AvatarImage src={product.image_url || ""} alt={product.name} className="object-cover" /><AvatarFallback className="rounded-lg"><Package className="h-5 w-5 text-muted-foreground" /></AvatarFallback></Avatar></TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell><span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">{product.categories?.name || "Sem Categoria"}</span></TableCell>
                                    <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                                    <TableCell><span className={`font-mono ${product.stock <= 5 ? 'text-red-500 font-bold' : ''}`}>{product.stock}</span></TableCell>
                                    <TableCell><div className="flex items-center gap-2"><Switch checked={product.active} onCheckedChange={() => toggleActive(product)} /><span className="text-sm text-muted-foreground">{product.active ? 'Ativo' : 'Inativo'}</span></div></TableCell>
                                    <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(product.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent></Card>
            </main>
        </div>
    );
}
