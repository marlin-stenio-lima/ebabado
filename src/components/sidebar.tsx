import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ShoppingCart, Package, Settings, UtensilsCrossed, LogOut } from "lucide-react";
import { Outlet } from "react-router-dom";

const MENU_ITEMS = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Produtos", icon: Package, href: "/dashboard/products" },
    { name: "Vendas", icon: ShoppingCart, href: "/dashboard/sales" },
    { name: "PDV / Balcão", icon: ShoppingCart, href: "/pdv" },
    { name: "Cardápio Digital", icon: UtensilsCrossed, href: "/dashboard/menu" },
    { name: "Configurações", icon: Settings, href: "/dashboard/settings" },
];

export function Sidebar() {
    const { pathname } = useLocation();

    return (
        <div className="flex h-full min-h-screen w-64 flex-col border-r bg-card text-card-foreground">
            <div className="flex h-14 items-center border-b px-6">
                <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
                    <span>Bloquinho é babado</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid gap-1 px-2">
                    {MENU_ITEMS.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={index}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                    isActive ? "bg-muted text-primary font-medium" : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="mt-auto border-t p-4 space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all text-xs" asChild>
                    <a href="/" target="_blank" rel="noopener noreferrer">
                        <ShoppingCart className="h-4 w-4" />
                        Ver Site Público
                    </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive">
                    <LogOut className="h-4 w-4" />
                    Sair
                </Button>
            </div>
        </div>
    );
}

export function MobileHeader() {
    return (
        <header className="flex h-14 lg:hidden items-center gap-4 border-b bg-muted/40 px-6">
            <div className="flex items-center gap-2 font-semibold">
                <span>Bloquinho ebabado</span>
            </div>
        </header>
    );
}
