export interface Product {
    id: number;
    slug: string;
    name: string;
    price: number;
    oldPrice?: number;
    rating: number;
    reviewCount: number;
    category: string;
    brand: string;
    shortDescription: string;
    description: string;
    imageUrl: string;
    tags: string[];
    inStock: boolean;
}

export type IProduct = Product;