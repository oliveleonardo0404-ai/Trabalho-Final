import mongoose from 'mongoose';

const avaliacaoSchema = new mongoose.Schema({
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clientes',
        required: true
    },
    agendamento: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agendamento',
        required: true
    },
    estrelas: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comentario: {
        type: String,
        trim: true,
        maxlength: 500
    }
}, { timestamps: true });

// Garante que exista no máximo 1 avaliação por agendamento
avaliacaoSchema.index({ agendamento: 1 }, { unique: true });

const Avaliacao = mongoose.model('Avaliacao', avaliacaoSchema);

export default Avaliacao;
