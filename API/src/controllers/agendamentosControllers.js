import AgendamentoModel from '../models/agendamento.js';

class agendamentosController {
    // Cria um novo agendamento ligando cliente, pet e serviço ao período informado.
    static async create(req, res) {
        try {
            const { cliente, pet, servico, data_entrada, data_saida, status } = req.body;

            if (!cliente || !pet || !servico || !data_entrada || !data_saida) {
                return res.status(400).json({ message: 'Todos os dados são obrigatórios.' });
            }

            const novoAgendamento = await AgendamentoModel.create({
                cliente,
                pet,
                servico,
                data_entrada,
                data_saida,
                status
            });

            return res.status(201).json({ message: 'Agendamento criado com sucesso', data: novoAgendamento });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao criar agendamento', error: error.message });
        }
    }

    // Lista todos os agendamentos com dados completos de cliente, pet e serviço.
    static async getAll(req, res) {
        try {
            const listaAgendamentos = await AgendamentoModel.find()
                .populate('cliente')
                .populate('pet')
                .populate('servico');
            return res.status(200).json(listaAgendamentos);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao buscar agendamentos', error: error.message });
        }
    }

    // Busca um agendamento específico pelo ID com os relacionamentos já populados.
    static async getById(req, res) {
        try {
            const agendamento = await AgendamentoModel.findById(req.params.id)
                .populate('cliente')
                .populate('pet')
                .populate('servico');
            if (!agendamento) return res.status(404).json({ message: 'Agendamento não encontrado' });
            return res.status(200).json(agendamento);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao buscar agendamento', error: error.message });
        }
    }

    // Atualiza dados de um agendamento existente, como status ou datas.
    static async update(req, res) {
        try {
            const agendamentoAtualizado = await AgendamentoModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
            return res.status(200).json(agendamentoAtualizado);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao atualizar agendamento', error: error.message });
        }
    }

    // Exclui um agendamento da base pelo ID.
    static async delete(req, res) {
        try {
            await AgendamentoModel.findByIdAndDelete(req.params.id);
            return res.status(200).json({ message: 'Agendamento removido com sucesso' });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao deletar agendamento', error: error.message });
        }
    }
}

export default agendamentosController;
