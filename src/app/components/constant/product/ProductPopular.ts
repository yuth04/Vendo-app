import gg from "@/src/app/components/assets/images/products/gg.png"
import men from "@/src/app/components/assets/images/products/Men.png"
import girl from "@/src/app/components/assets/images/products/girl.png"
import women from "@/src/app/components/assets/images/products/Women.png"
import factorie from "@/src/app/components/assets/images/products/Factorie.png"

import {StaticImageData} from "next/image";


interface Product {
    id: number
    name: string
    image: StaticImageData,
    price: number
    oldPrice: number | null
    rating: number
    reviews: number
}


export const products:Product[] = [
    {
        id: 1,
        name: "The north coat",
        image:men,
        price: 260,
        oldPrice: 360,
        rating: 5,
        reviews: 65,
    },
    {
        id: 2,
        name: "Gucci duffle bag",
        image:gg,
        price: 960,
        oldPrice: 1160,
        rating: 4.5,
        reviews: 65,
    },
    {
        id: 3,
        name: "RGB liquid CPU Cooler",
        image: factorie,
        price: 160,
        oldPrice: 170,
        rating: 4.5,
        reviews: 65,
    },
    {
        id: 4,
        name: "Small Bookshelf",
        image: girl,
        price: 360,
        oldPrice: null,
        rating: 5,
        reviews: 65,
    },
    {
        id: 5,
        name: "Small ",
        image: men,
        price: 360,
        oldPrice: null,
        rating: 5,
        reviews: 65,
    },
    {
        id: 6,
        name: "Small Bookshelf",
        image: girl,
        price: 360,
        oldPrice: null,
        rating: 5,
        reviews: 65,
    },
    {
        id: 7,
        name: "Small Bookshelf",
        image: girl,
        price: 360,
        oldPrice: null,
        rating: 5,
        reviews: 65,
    },
    {
        id: 8,
        name: "Small Bookshelf",
        image: women,
        price: 360,
        oldPrice: null,
        rating: 5,
        reviews: 65,
    },
];
