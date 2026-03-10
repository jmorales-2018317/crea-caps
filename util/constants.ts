import { Category } from "@/services/Category";
import { Product } from "@/services/Product";
import { DiscountType } from "@/services/Discounts";

export const CATEGORIES: Category[] = [
    {
        id: "ropa",
        name: "Ropa",
        value: "ropa",
        icon: "ShirtIcon",
    },
    {
        id: "electronica",
        name: "Electrónica",
        value: "electronica",
        icon: "LaptopIcon",
    },
    {
        id: "zapatos",
        name: "Zapatos",
        value: "zapatos",
        icon: "FootprintsIcon",
    },
    {
        id: "relojes",
        name: "Relojes",
        value: "relojes",
        icon: "ClockIcon",
    },
]

export const PLACEHOLDER_PRODUCTS: Product[] = [
    {
        id: "1",
        name: "Producto 1",
        price: 100.00,
        images: [
            "https://img.pikbest.com/origin/10/52/11/48IpIkbEsThqg.png!sw800",
            "https://img.pikbest.com/origin/10/52/11/48IpIkbEsThqg.png!sw800",
            "https://img.pikbest.com/origin/10/52/11/48IpIkbEsThqg.png!sw800"
        ],
        categories: CATEGORIES,
        discounts: [
            {
                id: "1",
                name: "Descuento 1",
                value: 10,
                type: DiscountType.PERCENTAGE,
                startDate: new Date(),
                endDate: new Date(),
            },
        ],
    },
    {
        id: "2",
        name: "Producto 2",
        price: 200.00,
        images: [
            "https://img.pikbest.com/origin/10/52/11/48IpIkbEsThqg.png!sw800",
            "https://img.pikbest.com/origin/10/52/11/48IpIkbEsThqg.png!sw800",
            "https://img.pikbest.com/origin/10/52/11/48IpIkbEsThqg.png!sw800"
        ],
        categories: [],
    },
    {
        id: "3",
        name: "Producto 3",
        price: 300.00,
        images: [
            "https://img.pikbest.com/origin/10/52/11/48IpIkbEsThqg.png!sw800",
            "https://img.pikbest.com/origin/10/52/11/48IpIkbEsThqg.png!sw800",
            "https://img.pikbest.com/origin/10/52/11/48IpIkbEsThqg.png!sw800"
        ],
        categories: CATEGORIES,
    },
    {
        id: "4",
        name: "Producto 4",
        price: 400.00,
        images: [
            "https://img.pikbest.com/origin/10/52/11/48IpIkbEsThqg.png!sw800",
            "https://img.pikbest.com/origin/10/52/11/48IpIkbEsThqg.png!sw800",
            "https://img.pikbest.com/origin/10/52/11/48IpIkbEsThqg.png!sw800"
        ],
        categories: CATEGORIES,
    },
]