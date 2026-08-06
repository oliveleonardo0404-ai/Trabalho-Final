import express from "express";
import productRoutes from "./routes/Productroutes.js"
import connectDatabase from "./database/connection.js";

const app = express();

console.log("ESTE É O SERVER.TS DA TECHSTORE");

const PORT = 3001;

app.use(express.json());

console.log("Rotas de produtos carregadas");

app.use("/products", productRoutes);



app.get("/", (req, res) => {
    res.json({
        message: "API está funcionando! "
    });
});


app.get("/teste", (req, res) => {
    res.send("Servidor de teste funcionando!");
});




const server = app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
