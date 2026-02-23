export interface Category {
    id: string;
    name: string;
    icon: string | null;
    created_at?: string;
}

export interface Product {
    id: string;
    category_id: string | null;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    active: boolean;
    stock: number;
    created_at?: string;
    categories?: Category | null;
}

export type ProductWithCategory = Product;

export interface CartItem {
    product: Product;
    quantity: number;
}
