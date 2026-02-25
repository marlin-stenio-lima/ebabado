import { createClient } from "@/lib/supabase/client";
import { Product, ProductWithCategory, Category } from "@/types";

const supabase = createClient();

export const productService = {
    async getProducts() {
        const { data, error } = await supabase
            .from("products")
            .select("*, categories(*)")
            .order("name");
        if (error) throw error;
        return data as ProductWithCategory[];
    },
    async getCategories() {
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("name");
        if (error) throw error;
        return data as Category[];
    },
    async createProduct(product: Partial<Product>) {
        const { data, error } = await supabase
            .from("products")
            .insert(product)
            .select()
            .single();
        if (error) throw error;
        return data as Product;
    },
    async updateProduct(id: string, updates: Partial<Product>) {
        const { data, error } = await supabase
            .from("products")
            .update(updates)
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return data as Product;
    },
    async deleteProduct(id: string) {
        const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", id);
        if (error) throw error;
    },
    async decrementStock(productId: string, quantity: number) {
        const { error } = await supabase
            .rpc('decrement_stock', { product_id: productId, quantity });
        if (error) throw error;
    },
    async uploadImage(file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);
        return data.publicUrl;
    }
};
