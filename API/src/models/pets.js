import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    foto_url: { type: String, default: '' },
    raca: { type: String, required: true },
    porte: { type: String, required: true },
    data_nascimento: { type: Date, required: true },
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clientes',
        required: true
    }
}, { timestamps: true });

const Pets = mongoose.model('Pets', petSchema);

export default Pets;