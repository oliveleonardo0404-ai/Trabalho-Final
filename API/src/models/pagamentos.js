import mongoose from 'mongoose';

const pagamentoSchema = new mongoose.Schema({
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
    valor: {
        type: Number,
        required: true,
        min: 0
    },
    metodo: {
        type: String,
        enum: ['PIX', 'CARTAO', 'DINHEIRO'],
        default: 'PIX'
    },
    status: {
        type: String,
        enum: ['PENDENTE', 'PAGO', 'CANCELADO'],
        default: 'PENDENTE'
    },
    data_pagamento: {
        type: Date
    }
}, { timestamps: true });

const Pagamento = mongoose.model('Pagamento', pagamentoSchema);

export default Pagamento;
