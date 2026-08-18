import ServicoModel from '../models/serviços.js';

class serviçosController {
    // Cria um novo tipo de serviço oferecido pela pet shop, como hotel, creche ou escola.
    static async create(req, res) {
        try {
            const { nome, descricao, preco_diaria } = req.body;

            if (!nome || preco_diaria === undefined) {
                return res.status(400).json({ message: 'Nome e preço diário são obrigatórios.' });
            }

            const novoServico = await ServicoModel.create({
                nome,
                descricao,
                preco_diaria
            });

            return res.status(201).json({ message: 'Serviço criado com sucesso', data: novoServico });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao criar serviço', error: error.message });
        }
    }

    // Busca todos os serviços cadastrados para exibir na interface.
    static async getAll(req, res) {
        try {
            const listaServicos = await ServicoModel.find();
            return res.status(200).json(listaServicos);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao buscar serviços', error: error.message });
        }
    }

    // Busca um serviço específico pelo ID.
    static async getById(req, res) {
        try {
            const servico = await ServicoModel.findById(req.params.id);
            if (!servico) return res.status(404).json({ message: 'Serviço não encontrado' });
            return res.status(200).json(servico);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao buscar serviço', error: error.message });
        }
    }

    // Atualiza as informações de um serviço já cadastrado.
    static async update(req, res) {
        try {
            const servicoAtualizado = await ServicoModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
            return res.status(200).json(servicoAtualizado);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao atualizar serviço', error: error.message });
        }
    }

    // Remove um serviço da base de dados.
    static async delete(req, res) {
        try {
            await ServicoModel.findByIdAndDelete(req.params.id);
            return res.status(200).json({ message: 'Serviço removido com sucesso' });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao deletar serviço', error: error.message });
        }
    }
}

export default serviçosController;
