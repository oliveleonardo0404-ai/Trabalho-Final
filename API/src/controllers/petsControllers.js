import PetsModel from '../models/pets.js';

const normalizeText = (value) => typeof value === 'string' ? value.trim() : '';

const isValidUrl = (value) => {
    if (!value) return true;
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
};

class petsController {
    // Cria um novo pet e valida dados como nome, raça, porte e data de nascimento.
    static async create(req, res) {
        try {
            const nome = normalizeText(req.body.nome);
            const foto_url = normalizeText(req.body.foto_url);
            const raca = normalizeText(req.body.raca);
            const porte = normalizeText(req.body.porte);
            const data_nascimento = normalizeText(req.body.data_nascimento);
            const cliente = normalizeText(req.body.cliente);

            if (!nome || !raca || !porte || !data_nascimento || !cliente) {
                return res.status(400).json({ message: 'Todos os dados são obrigatórios.' });
            }

            if (nome.length < 2 || !/^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s'-]+$/.test(nome)) {
                return res.status(400).json({ message: 'Informe um nome de pet válido.' });
            }

            if (raca.length < 2 || !/^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s'-]+$/.test(raca)) {
                return res.status(400).json({ message: 'Informe uma raça válida.' });
            }

            if (!['Pequeno', 'Médio', 'Grande'].includes(porte)) {
                return res.status(400).json({ message: 'Selecione um porte válido.' });
            }

            const dataPet = new Date(data_nascimento);
            if (Number.isNaN(dataPet.getTime()) || dataPet > new Date()) {
                return res.status(400).json({ message: 'Informe uma data de nascimento válida.' });
            }

            if (foto_url && !isValidUrl(foto_url)) {
                return res.status(400).json({ message: 'A URL da foto deve ser válida.' });
            }

            const novoPet = await PetsModel.create({
                nome,
                foto_url,
                raca,
                porte,
                data_nascimento: dataPet,
                cliente
            });

            return res.status(201).json({ message: 'Pet criado com sucesso', data: novoPet });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao criar pet', error: error.message });
        }
    }

    // Busca todos os pets e inclui também os dados do cliente relacionado.
    static async getAll(req, res) {
        try {
            const listaPets = await PetsModel.find().populate('cliente');
            return res.status(200).json(listaPets);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao buscar pets', error: error.message });
        }
    }

    // Busca um pet específico pelo ID e traz o cliente vinculado.
    static async getById(req, res) {
        try {
            const pet = await PetsModel.findById(req.params.id).populate('cliente');
            if (!pet) return res.status(404).json({ message: 'Pet não encontrado' });
            return res.status(200).json(pet);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao buscar pet', error: error.message });
        }
    }

    // Atualiza os dados de um pet já cadastrado.
    static async update(req, res) {
        try {
            const petAtualizado = await PetsModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
            return res.status(200).json(petAtualizado);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao atualizar pet', error: error.message });
        }
    }

    // Exclui um pet da base de dados pelo ID.
    static async delete(req, res) {
        try {
            await PetsModel.findByIdAndDelete(req.params.id);
            return res.status(200).json({ message: 'Pet removido com sucesso' });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao deletar pet', error: error.message });
        }
    }
}

export default petsController;
