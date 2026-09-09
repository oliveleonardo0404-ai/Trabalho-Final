import mongoose from "mongoose";
import dotenv from "dotenv";


dotenv.config();


async function connectDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Banco de dados conectado com sucesso!');
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar ao banco:', error.message);
        return false;
    }
}


export default connectDatabase;

