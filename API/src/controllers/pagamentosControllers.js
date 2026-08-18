import PagamentoModel from '../models/pagamentos.js';
import ClientesModel from '../models/clientes.js';
import AgendamentoModel from '../models/agendamento.js';

class pagamentosController {
    // Registra um pagamento vinculado a um cliente e a um agendamento específico.
    static async create(req, res) {
        try {
            const { cliente, agendamento, valor, metodo, status, data_pagamento } = req.body;

            if (!cliente || !agendamento || valor === undefined) {
                return res.status(400).json({ message: 'Dados obrigatórios não informados.' });
            }

            // Valida se o cliente e o agendamento realmente existem antes de gravar o pagamento.
            const clienteExists = await ClientesModel.findById(cliente);
            if (!clienteExists) return res.status(400).json({ message: 'Cliente não encontrado.' });

            const agendamentoExists = await AgendamentoModel.findById(agendamento);
            if (!agendamentoExists) return res.status(400).json({ message: 'Agendamento não encontrado.' });

            const novoPagamento = await PagamentoModel.create({ cliente, agendamento, valor, metodo, status, data_pagamento });

            return res.status(201).json({ message: 'Pagamento criado com sucesso', data: novoPagamento });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao criar pagamento', error: error.message });
        }
    }

    // Lista todos os pagamentos com os dados completos do cliente e do agendamento.
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

    // Busca um pagamento específico pelo ID com informações relacionadas.
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

    // Atualiza os dados de um pagamento, como valor, método ou status.
    static async update(req, res) {
        try {
            const pagamentoAtualizado = await PagamentoModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
            return res.status(200).json(pagamentoAtualizado);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao atualizar pagamento', error: error.message });
        }
    }

    // Exclui um pagamento do banco pelo ID.
    static async delete(req, res) {
        try {
            await PagamentoModel.findByIdAndDelete(req.params.id);
            return res.status(200).json({ message: 'Pagamento removido com sucesso' });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao deletar pagamento', error: error.message });
        }
    }
}

export default pagamentosController;
