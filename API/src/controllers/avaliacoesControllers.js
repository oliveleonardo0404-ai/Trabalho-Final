import AvaliacaoModel from '../models/avaliação.js';

class avaliacoesController {
    // Cria uma avaliação de um agendamento, evitando que o mesmo agendamento tenha mais de uma nota.
    static async create(req, res) {
        try {
            const { cliente, agendamento, estrelas, comentario } = req.body;

            if (!cliente || !agendamento || !estrelas) {
                return res.status(400).json({ message: 'Dados obrigatórios não informados.' });
            }

            // Impede que exista mais de uma avaliação para o mesmo agendamento.
            const avaliacaoExistente = await AvaliacaoModel.findOne({ agendamento });
            if (avaliacaoExistente) {
                return res.status(400).json({ message: 'Já existe uma avaliação para este agendamento.' });
            }

            const novaAvaliacao = await AvaliacaoModel.create({
                cliente,
                agendamento,
                estrelas,
                comentario
            });

            return res.status(201).json({ message: 'Avaliação criada com sucesso', data: novaAvaliacao });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao criar avaliação', error: error.message });
        }
    }

    // Lista todas as avaliações com os dados do cliente e do agendamento relacionado.
    static async getAll(req, res) {
        try {
            const listaAvaliacoes = await AvaliacaoModel.find()
                .populate('cliente')
                .populate('agendamento');
            return res.status(200).json(listaAvaliacoes);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao buscar avaliações', error: error.message });
        }
    }

    // Busca uma avaliação específica pelo ID e traz o contexto completo dela.
    static async getById(req, res) {
        try {
            const avaliacao = await AvaliacaoModel.findById(req.params.id)
                .populate('cliente')
                .populate('agendamento');
            if (!avaliacao) return res.status(404).json({ message: 'Avaliação não encontrada' });
            return res.status(200).json(avaliacao);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao buscar avaliação', error: error.message });
        }
    }

    // Atualiza os dados de uma avaliação existente.
    static async update(req, res) {
        try {
            const avaliacaoAtualizada = await AvaliacaoModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
            return res.status(200).json(avaliacaoAtualizada);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao atualizar avaliação', error: error.message });
        }
    }

    // Remove uma avaliação do sistema.
    static async delete(req, res) {
        try {
            await AvaliacaoModel.findByIdAndDelete(req.params.id);
            return res.status(200).json({ message: 'Avaliação removida com sucesso' });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao deletar avaliação', error: error.message });
        }
    }
}

export default avaliacoesController;
