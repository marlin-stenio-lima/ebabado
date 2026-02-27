import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, FilterX, Loader2, DollarSign, ShoppingBag, Receipt, ArrowRight } from "lucide-react";
import { salesService, Sale } from "@/lib/services/sales-service";

export default function DashboardSales() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        paymentMethod: "all",
        minAmount: "",
        maxAmount: "",
        searchTerm: ""
    });

    useEffect(() => { loadSales(); }, []);

    async function loadSales() {
        try {
            setLoading(true);
            const data = await salesService.getSalesWithFilters({
                startDate: filters.startDate,
                endDate: filters.endDate,
                paymentMethod: filters.paymentMethod,
                minAmount: filters.minAmount ? parseFloat(filters.minAmount) : undefined,
                maxAmount: filters.maxAmount ? parseFloat(filters.maxAmount) : undefined
            });
            setSales(data);
        } catch (error) {
            console.error("Error loading sales:", error);
        } finally {
            setLoading(false);
        }
    }

    const filteredSales = useMemo(() => {
        return sales.filter(sale =>
            sale.id.toLowerCase().includes(filters.searchTerm.toLowerCase())
        );
    }, [sales, filters.searchTerm]);

    const stats = useMemo(() => {
        const total = filteredSales.reduce((acc, sale) => acc + sale.total_amount, 0);
        const count = filteredSales.length;
        const avg = count > 0 ? total / count : 0;

        const byMethod = filteredSales.reduce((acc: any, sale) => {
            acc[sale.payment_method] = (acc[sale.payment_method] || 0) + sale.total_amount;
            return acc;
        }, {});

        return { total, count, avg, byMethod };
    }, [filteredSales]);

    const clearFilters = () => {
        setFilters({
            startDate: "",
            endDate: "",
            paymentMethod: "all",
            minAmount: "",
            maxAmount: "",
            searchTerm: ""
        });
        setTimeout(loadSales, 0);
    };

    return (
        <div className="flex h-full flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
            <header className="border-b bg-background px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Histórico de Vendas</h1>
                    <p className="text-sm text-muted-foreground">Consulte e filtre todas as transações realizadas</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
                        <FilterX className="h-4 w-4" /> Limpar Filtros
                    </Button>
                    <Button size="sm" onClick={loadSales} className="gap-2">
                        <Search className="h-4 w-4" /> Aplicar Filtros
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content - Filters and List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Advanced Filters */}
                    <Card>
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" /> Filtros Avançados
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Início</label>
                                    <Input type="date" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Fim</label>
                                    <Input type="date" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Forma de Pagamento</label>
                                    <Select value={filters.paymentMethod} onValueChange={val => setFilters({ ...filters, paymentMethod: val })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="money">Dinheiro</SelectItem>
                                            <SelectItem value="pix">Pix</SelectItem>
                                            <SelectItem value="credit">Cartão Crédito</SelectItem>
                                            <SelectItem value="debit">Cartão Débito</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Valor Mínimo</label>
                                    <Input type="number" placeholder="R$ 0.00" value={filters.minAmount} onChange={e => setFilters({ ...filters, minAmount: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Busca por ID</label>
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="ID da venda..." className="pl-8" value={filters.searchTerm} onChange={e => setFilters({ ...filters, searchTerm: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sales Table */}
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data / Hora</TableHead>
                                        <TableHead>ID da Venda</TableHead>
                                        <TableHead>Método</TableHead>
                                        <TableHead className="text-right">Valor Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                    <p>Buscando vendas...</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredSales.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                                                Nenhuma venda encontrada para os filtros aplicados.
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredSales.map((sale) => (
                                        <TableRow key={sale.id} className="hover:bg-muted/50 transition-colors">
                                            <TableCell className="text-xs">
                                                {new Date(sale.created_at).toLocaleString('pt-BR')}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                #{sale.id.slice(0, 8)}...
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase bg-secondary text-secondary-foreground">
                                                    {sale.payment_method === 'money' ? 'Dinheiro' :
                                                        sale.payment_method === 'pix' ? 'Pix' :
                                                            sale.payment_method === 'credit' ? 'Crédito' :
                                                                sale.payment_method === 'debit' ? 'Débito' : sale.payment_method}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-emerald-600">
                                                R$ {sale.total_amount.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Summary */}
                <aside className="w-80 border-l bg-background p-6 space-y-6 overflow-y-auto hidden xl:block">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-primary" /> Resumo do Período
                    </h2>

                    <div className="grid gap-4">
                        <Card className="bg-primary/5 border-none shadow-none">
                            <CardContent className="p-4 pt-4">
                                <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Total Vendido</div>
                                <div className="text-3xl font-bold">R$ {stats.total.toFixed(2)}</div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-muted/30 border-none shadow-none text-center">
                                <CardContent className="p-3 pt-3">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Transações</div>
                                    <div className="text-xl font-bold">{stats.count}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-muted/30 border-none shadow-none text-center">
                                <CardContent className="p-3 pt-3">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Ticket Médio</div>
                                    <div className="text-lg font-bold">R$ {stats.avg.toFixed(2)}</div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Distribuição por Método</h3>
                        <div className="space-y-3">
                            {Object.entries(stats.byMethod).map(([method, amount]: [any, any]) => (
                                <div key={method} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-8 bg-primary/20 rounded-full group-hover:bg-primary transition-colors" />
                                        <span className="text-sm font-medium capitalize">
                                            {method === 'money' ? 'Dinheiro' :
                                                method === 'pix' ? 'Pix' :
                                                    method === 'credit' ? 'Crédito' :
                                                        method === 'debit' ? 'Débito' : method}
                                        </span>
                                    </div>
                                    <div className="text-sm font-bold">R$ {amount.toFixed(2)}</div>
                                </div>
                            ))}
                            {Object.keys(stats.byMethod).length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-4">Sem dados</p>
                            )}
                        </div>
                    </div>

                    <div className="pt-6 border-t">
                        <Button className="w-full gap-2" variant="outline" size="sm" asChild>
                            <a href="/" target="_blank" rel="noopener noreferrer">
                                Ver Site Público <ArrowRight className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
