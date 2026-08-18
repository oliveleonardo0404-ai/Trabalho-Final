import mongoose from 'mongoose';

const agendamentoSchema = new mongoose.Schema({
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clientes',
        required: true
    },
    pet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pets',
        required: true
    },
    servico: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Servico',
        required: true
    },
    data_entrada: {
        type: Date,
        required: true
    },
    data_saida: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDENTE', 'CONFIRMADO', 'CANCELADO', 'FINALIZADO'],
        default: 'PENDENTE'
    }
}, { timestamps: true });

const Agendamento = mongoose.model('Agendamento', agendamentoSchema);

export default Agendamento;
