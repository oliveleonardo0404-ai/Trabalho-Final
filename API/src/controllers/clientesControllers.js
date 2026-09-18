import ClientesModel from '../models/clientes.js';
import bcrypt from 'bcryptjs';

const normalizeText = (value) => typeof value === 'string' ? value.trim() : '';

const isValidEmail = (value) => {
    const atIndex = value.indexOf('@');
    const domain = value.slice(atIndex + 1);
    return atIndex > 0 && atIndex === value.lastIndexOf('@') && domain.includes('.');
};

const isValidCpf = (value) => {
    const digits = value.replace(/\D/g, '');
    return digits.length === 11;
};

const isValidPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 11;
};

const isValidBirthDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;
    const today = new Date();
    return date <= today;
};

class ClientesController {
    static async create(req, res) {
        try {
            const nome = normalizeText(req.body.nome);
            const email = normalizeText(req.body.email).toLowerCase();
            const senha = normalizeText(req.body.senha);
            const cpf = normalizeText(req.body.cpf);
            const numero = normalizeText(req.body.numero);
            const nascimento = normalizeText(req.body.nascimento);

            if (!nome || !email || !senha || !cpf || !numero || !nascimento) {
                return res.status(400).json({ message: 'Todos os dados são obrigatórios.' });
            }

            if (!isValidEmail(email)) {
                return res.status(400).json({ message: 'Informe um e-mail válido.' });
            }

            if (!isValidCpf(cpf)) {
                return res.status(400).json({ message: 'Informe um CPF válido.' });
            }

            if (!isValidPhone(numero)) {
                return res.status(400).json({ message: 'Informe um telefone válido.' });
            }

            if (!isValidBirthDate(nascimento)) {
                return res.status(400).json({ message: 'Informe uma data de nascimento válida.' });
            }

            const clientesExiste = await ClientesModel.findOne({ $or: [{ email }, { cpf }] });
            if (clientesExiste) {
                return res.status(400).json({ message: 'Email ou CPF já cadastrados.' });
            }

            const salt = await bcrypt.genSalt(10);
            const senhaHash = await bcrypt.hash(senha, salt);

            const novocliente = await ClientesModel.create({
                nome,
                email,
                senha: senhaHash,
                cpf,
                numero,
                nascimento
            });

            novocliente.senha = undefined;

            return res.status(201).json({ message: 'Cliente criado com sucesso', data: novocliente });

        } catch (error) {
            return res.status(500).json({ message: 'Erro ao criar cliente', error: error.message });
        }
    }

    static async login(req, res) {
        try {
            const { email, senha } = req.body;

            if (!email || !senha) {
                return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
            }

            const cliente = await ClientesModel.findOne({ email });
            if (!cliente) {
                return res.status(401).json({ message: 'Credenciais inválidas.' });
            }

            const senhaValida = await bcrypt.compare(senha, cliente.senha);
            if (!senhaValida) {
                return res.status(401).json({ message: 'Credenciais inválidas.' });
            }

            const clienteSemSenha = cliente.toObject();
            delete clienteSemSenha.senha;

            return res.status(200).json({ message: 'Login realizado com sucesso.', data: clienteSemSenha });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao fazer login', error: error.message });
        }
    }

    static async getAll(req, res) {
        try {
            const listaClientes = await ClientesModel.find().select('-senha');
            return res.status(200).json(listaClientes);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao buscar clientes', error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const cliente = await ClientesModel.findById(req.params.id).select('-senha');
            if (!cliente) return res.status(404).json({ message: 'Cliente não encontrado' });
            return res.status(200).json(cliente);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao buscar cliente', error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const nome = normalizeText(req.body.nome);
            const email = normalizeText(req.body.email).toLowerCase();
            const cpf = normalizeText(req.body.cpf);
            const numero = normalizeText(req.body.numero);
            const nascimento = normalizeText(req.body.nascimento);

            if (!nome || !email || !cpf || !numero || !nascimento) {
                return res.status(400).json({ message: 'Todos os dados pessoais são obrigatórios.' });
            }

            if (!isValidEmail(email)) return res.status(400).json({ message: 'Informe um e-mail válido.' });
            if (!isValidCpf(cpf)) return res.status(400).json({ message: 'Informe um CPF válido.' });
            if (!isValidPhone(numero)) return res.status(400).json({ message: 'Informe um telefone válido.' });
            if (!isValidBirthDate(nascimento)) return res.status(400).json({ message: 'Informe uma data de nascimento válida.' });

            const duplicate = await ClientesModel.findOne({
                $or: [{ email }, { cpf }],
                _id: { $ne: req.params.id },
            });
            if (duplicate) return res.status(400).json({ message: 'Email ou CPF já cadastrados.' });

            const clienteAtualizado = await ClientesModel.findByIdAndUpdate(
                req.params.id,
                { nome, email, cpf, numero, nascimento },
                { new: true, runValidators: true }
            ).select('-senha');

            if (!clienteAtualizado) return res.status(404).json({ message: 'Cliente não encontrado' });
            return res.status(200).json(clienteAtualizado);
        } catch (error) {
            if (error.name === 'CastError') return res.status(400).json({ message: 'ID de cliente inválido.' });
            return res.status(500).json({ message: 'Erro ao atualizar cliente', error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const clienteRemovido = await ClientesModel.findByIdAndDelete(req.params.id);
            if (!clienteRemovido) return res.status(404).json({ message: 'Cliente não encontrado' });
            return res.status(200).json({ message: 'Cliente removido com sucesso' });
        } catch (error) {
            if (error.name === 'CastError') return res.status(400).json({ message: 'ID de cliente inválido.' });
            return res.status(500).json({ message: 'Erro ao deletar cliente', error: error.message });
        }
    }
}

export default ClientesController;