import PagamentoModel from '../models/pagamentos.js';
import ClientesModel from '../models/clientes.js';
import AgendamentoModel from '../models/agendamento.js';

class PagamentosController {
    static async create(req, res) {
        try {
            const { cliente, agendamento, valor, metodo, status, data_pagamento } = req.body;

            if (!cliente || !agendamento || valor === undefined) {
                return res.status(400).json({ message: 'Dados obrigatórios não informados.' });
            }

            const clienteExists = await ClientesModel.findById(cliente);
            if (!clienteExists) return res.status(400).json({ message: 'Cliente não encontrado.' });

            const agendamentoExists = await AgendamentoModel.findById(agendamento);
            if (!agendamentoExists) return res.status(400).json({ message: 'Agendamento não encontrado.' });

            if (String(agendamentoExists.cliente) !== String(cliente)) {
                return res.status(403).json({ message: 'O agendamento não pertence a este cliente.' });
            }

            const novoPagamento = await PagamentoModel.create({ cliente, agendamento, valor, metodo, status, data_pagamento });

            if (status === 'PAGO') {
                await AgendamentoModel.findByIdAndUpdate(agendamento, { status: 'PAGO' });
            }

            return res.status(201).json({ message: 'Pagamento criado com sucesso', data: novoPagamento });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao criar pagamento', error: error.message });
        }
    }

    static async getAll(req, res) {
        try {
            const listaPagamentos = await PagamentoModel.find()
                .populate('cliente')
                .populate('agendamento');
            return res.status(200).json(listaPagamentos);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao buscar pagamentos', error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const pagamento = await PagamentoModel.findById(req.params.id)
                .populate('cliente')
                .populate('agendamento');
            if (!pagamento) return res.status(404).json({ message: 'Pagamento não encontrado' });
            return res.status(200).json(pagamento);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao buscar pagamento', error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const pagamentoAtualizado = await PagamentoModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
            return res.status(200).json(pagamentoAtualizado);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao atualizar pagamento', error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            await PagamentoModel.findByIdAndDelete(req.params.id);
            return res.status(200).json({ message: 'Pagamento removido com sucesso' });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao deletar pagamento', error: error.message });
        }
    }
}

export default PagamentosController;
