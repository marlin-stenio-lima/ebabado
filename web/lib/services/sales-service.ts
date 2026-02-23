import { createClient } from "../supabase/client";

const supabase = createClient();
import { CartItem } from "@/types";

export type Sale = {
    id: string;
    created_at: string;
    total_amount: number;
    payment_method: string;
    status: string;
};

export type SaleItem = {
    id: string;
    sale_id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
};

export const salesService = {
    async createSale(cart: CartItem[], totalAmount: number, paymentMethod: string) {
        // 1. Create Sale Record
        const { data: saleData, error: saleError } = await supabase
            .from("sales")
            .insert({
                total_amount: totalAmount,
                payment_method: paymentMethod,
                status: 'completed'
            })
            .select()
            .single();

        if (saleError) throw saleError;

        const sale = saleData as Sale;

        // 2. Create Sale Items
        const saleItems = cart.map(item => ({
            sale_id: sale.id,
            product_id: item.product.id,
            product_name: item.product.name,
            quantity: item.quantity,
            unit_price: item.product.price,
            total_price: item.product.price * item.quantity
        }));

        const { error: itemsError } = await supabase
            .from("sale_items")
            .insert(saleItems);

        if (itemsError) throw itemsError;

        return sale;
    },

    async getRecentSales(limit = 5) {
        const { data, error } = await supabase
            .from("sales")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data as Sale[];
    },

    async getDailyStats() {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // This is a simplified fetch. For production with massive data, rely on DB aggregation or RPCs.
        // Fetching all sales for today to calculate in JS for now (assuming low volume for MVP).
        const { data: sales, error } = await supabase
            .from("sales")
            .select("total_amount")
            .gte("created_at", `${today}T00:00:00.000Z`)
            .lte("created_at", `${today}T23:59:59.999Z`);

        if (error) throw error;

        const totalSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
        const orderCount = sales.length;
        const avgTicket = orderCount > 0 ? totalSales / orderCount : 0;

        return {
            totalSales,
            orderCount,
            avgTicket
        };
    },

    async getDailyPerformance() {
        const today = new Date().toISOString().split('T')[0];

        const { data: sales, error } = await supabase
            .from("sales")
            .select("total_amount, created_at")
            .gte("created_at", `${today}T00:00:00.000Z`)
            .lte("created_at", `${today}T23:59:59.999Z`)
            .order("created_at", { ascending: true });

        if (error) throw error;

        // Group by hour
        const performanceMap: Record<number, number> = {};
        // Initialize all hours
        for (let i = 0; i < 24; i++) performanceMap[i] = 0;

        sales.forEach(sale => {
            const hour = new Date(sale.created_at).getHours();
            performanceMap[hour] = (performanceMap[hour] || 0) + sale.total_amount;
        });

        return Object.entries(performanceMap).map(([hour, total]) => ({
            hour: `${String(hour).padStart(2, '0')}:00`,
            total
        }));
    }
};
