import { Router } from "express";

const router = Router();

console.log("Arquivo productRoutes carregado");

const products = [
    {
        id: 1,
        name: "Notebook Gamer",
        price: 5000
    },
    {
        id: 2,
        name: "Memoria ram 3200mh 16gb",
        price: 2000
    },
    {
        id: 3,
        name: "mouse",
        price: 1250
    },
    {
        id: 4,
        name: "cadeira ergonomica",
        price: 890
    },
    {
        id: 5,
        name: "monitor 4k",
        price: 2700
    }
];

router.get("/", (req, res) => {
    console.log("Entrou na rota GET /products");

    res.json(products);
});

router.post("/", (req, res) => {
    const newProduct = {
        id: products.length + 1,
        name: req.body.name,
        price: req.body.price
    };

    products.push(newProduct);

    res.status(201).json({
        message: "Produto criado com sucesso!",
        product: newProduct
    });
});
export default router;
