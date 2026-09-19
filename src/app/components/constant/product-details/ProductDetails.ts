export interface Product {
    id: number;
    name: string;
    price: number;
    oldPrice: number;
    rating: number;
    reviews: number;
    image: string;
}

export const thumbImages = [
    "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800",
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
];

export const colors = [
    { bg: 'bg-[#A0BCE0]', ring: 'ring-[#5A8FC0]' },
    { bg: 'bg-[#DB4444]', ring: 'ring-[#DB4444]' },
];

export const relatedProducts: Product[] = [
    { id: 1, name: "The North Coat", price: 260, oldPrice: 360, rating: 5, reviews: 1, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400" },
    { id: 2, name: "The North Coat", price: 260, oldPrice: 360, rating: 3, reviews: 2, image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400" },
    { id: 3, name: "The North Coat", price: 260, oldPrice: 360, rating: 5, reviews: 2, image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400" },
    { id: 4, name: "The North Coat", price: 260, oldPrice: 360, rating: 0, reviews: 0, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400" },
];