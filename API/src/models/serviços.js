import mongoose from 'mongoose';

const servicoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        enum: ['Hotel', 'Escola', 'Creche']
    },
    descricao: {
        type: String,
        trim: true
    },
    preco_diaria: {
        type: Number,
        required: true,
        min: 0
    }
}, { timestamps: true });

const Servico = mongoose.model('Servico', servicoSchema);

export default Servico;
