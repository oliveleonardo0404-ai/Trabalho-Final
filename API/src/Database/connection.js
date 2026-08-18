import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function connectDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const db = mongoose.connection.db;
        if (db) {
            try {
                const indexes = await db.collection('clientes').indexes();
                const legacyIndex = indexes.find((index) => index.name === 'user_id_1');

                if (legacyIndex) {
                    await db.collection('clientes').dropIndex('user_id_1');
                    console.log('🧹 Índice legado user_id_1 removido da coleção clientes.');
                }
            } catch (indexError) {
                console.warn('⚠️ Não foi possível verificar/remover índice legado da coleção clientes:', indexError.message || indexError);
            }
        }

        console.log("✅ Banco de dados conectado com sucesso!");
        return true;
    } catch (error) {
        console.error("❌ Erro ao conectar ao banco:", error.message || error);
        return false;
    }
}

export default connectDatabase;