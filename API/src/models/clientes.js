import mongoose from 'mongoose';

const clientesSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    numero: { type: String, required: true }, 
    nascimento: { type: Date, required: true },
    role: { type: String, enum: ['cliente', 'admin'], default: 'cliente' }
}, { timestamps: true }); 

const Clientes = mongoose.model('Clientes', clientesSchema);

export default Clientes;