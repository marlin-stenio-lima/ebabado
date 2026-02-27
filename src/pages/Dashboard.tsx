import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ShoppingCart, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { salesService, Sale } from "@/lib/services/sales-service";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalSales: 0, orderCount: 0, avgTicket: 0 });
    const [performance, setPerformance] = useState<{ hour: string; total: number }[]>([]);
    const [recentSales, setRecentSales] = useState<Sale[]>([]);

    useEffect(() => { loadDashboardData(); }, []);

    async function loadDashboardData() {
        try {
            const [statsData, salesData, performanceData] = await Promise.all([salesService.getDailyStats(), salesService.getRecentSales(5), salesService.getDailyPerformance()]);
            setStats(statsData);
            setRecentSales(salesData);
            setPerformance(performanceData);
        } catch (error) { console.error("Error loading dashboard:", error); }
        finally { setLoading(false); }
    }

    if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
            <header className="sticky top-0 z-10 border-b bg-background px-6 py-4 flex items-center justify-between shadow-sm">
                <div>
                    <h1 className="text-xl font-bold">Bloquinho é babado <span className="text-primary font-light">Admin</span></h1>
                    <p className="text-xs text-muted-foreground">Visão geral do dia</p>
                </div>
                <div className="flex gap-4">
                    <Link to="/pdv"><Button className="gap-2 shadow-sm hover:shadow-md transition-all"><ShoppingCart className="w-4 h-4" /> Ir para o PDV</Button></Link>
                    <Button variant="ghost" size="sm">Sair</Button>
                </div>
            </header>

            <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Vendas Totais (Hoje)</CardTitle><DollarSign className="h-4 w-4 text-emerald-500" /></CardHeader>
                        <CardContent><div className="text-2xl font-bold">R$ {stats.totalSales.toFixed(2)}</div><p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-500" />Atualizado agora</p></CardContent>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pedidos (Hoje)</CardTitle><ShoppingCart className="h-4 w-4 text-primary" /></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{stats.orderCount}</div><p className="text-xs text-muted-foreground mt-1">vendas realizadas</p></CardContent>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Ticket Médio</CardTitle><BarChart3 className="h-4 w-4 text-blue-500" /></CardHeader>
                        <CardContent><div className="text-2xl font-bold">R$ {stats.avgTicket.toFixed(2)}</div><p className="text-xs text-muted-foreground mt-1">por pedido</p></CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4 hover:shadow-md transition-shadow">
                        <CardHeader><CardTitle>Desempenho de Vendas (Hoje)</CardTitle></CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full pt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={performance}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                        <XAxis dataKey="hour" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                                        <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }} formatter={(value: any) => [`R$ ${value.toFixed(2)}`, "Vendas"]} />
                                        <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-3 hover:shadow-md transition-shadow">
                        <CardHeader><CardTitle>Vendas Recentes</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {recentSales.length === 0 ? (
                                    <p className="text-center text-sm text-muted-foreground py-8">Nenhuma venda registrada hoje.</p>
                                ) : recentSales.map((sale) => (
                                    <div key={sale.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">Venda #{sale.id.slice(0, 8)}</p>
                                            <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">Forma de Pagamento: <span className="font-semibold text-primary">{sale.payment_method || 'N/A'}</span></p>
                                        </div>
                                        <div className="font-bold text-sm text-emerald-600">+R$ {sale.total_amount.toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
