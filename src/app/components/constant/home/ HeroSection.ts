import men from "@/src/app/components/assets/images/men.png"
import shutterstock from "@/src/app/components/assets/images/shutterstock.png"
import boy from "@/src/app/components/assets/images/boy.png"
import pexels from "@/src/app/components/assets/images/pexels.png"
import shirts from "@/src/app/components/assets/images/shirts.png"
import girl from "@/src/app/components/assets/images/girl.png"
import {StaticImageData} from "next/image";
export const slides = [
    {
        id: 1,
        image: men,
        bg: "#000",
    },
    {
        id: 2,
        image: shutterstock,
        bg: "#1a1a1a",
    },
    {
        id: 3,
        image: boy,
        bg: "#0a0a0a",
    },
    {
        id: 4,
        image: pexels,
        bg: "#000",
    },
    {
        id: 5,
        image: shirts,
        bg: "#1a1a1a",
    },
]

interface Producttype {
    id: number
    name: string
    image: StaticImageData
    titlenew:string
    oldPrice: number
    titleold:string
    price: number

}

export const products:Producttype[] = [
    {
        id: 1,
        name: "LED Light 90W Set of 2",
        image: girl,
        titlenew:"New Price",
        oldPrice: 480,
        titleold:"Old Price",
        price: 160,
    }
]
