export interface IProductCategory {
    id: number;
    name: string;
}

export interface IProduct {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: string;
    image: string;
    category_id: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    Category?: IProductCategory;
}