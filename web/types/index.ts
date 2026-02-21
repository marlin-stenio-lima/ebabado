
export type Category = {
    id: string;
    name: string;
    icon: string | null;
    created_at?: string;
};

export type Product = {
    id: string;
    category_id: string | null;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    active: boolean;
    stock: number;
    categories?: Category | null;
    created_at?: string;
};

export type CartItem = {
    product: Product;
    quantity: number;
};
