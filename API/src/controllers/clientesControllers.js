import ClientesModel from '../models/clientes.js';
import bcrypt from 'bcryptjs';

const normalizeText = (value) => typeof value === 'string' ? value.trim() : '';

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// Validação didática do CPF: o sistema só exige 11 números e rejeita sequências repetidas.
// Por exemplo, 111.111.111-11 não entra, mas 123.456.789-09 passa.
const isValidCpf = (value) => {
    const digits = value.replace(/\D/g, '');

    if (digits.length !== 11) return false;
    if (/^(\d)\1+$/.test(digits)) return false;

    return true;
};

// Validação simples do telefone: ele precisa ter DDD + número, sem espaços ou letras.
// Em outras palavras, é um número de celular ou fixo com 10 ou 11 dígitos úteis.
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

class clientesController {
    // Cria um novo cliente, valida campos e salva a senha em formato seguro.
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

            if (nome.length < 3 || !/^[A-Za-zÀ-ÖØ-öø-ÿ\s']+$/.test(nome)) {
                return res.status(400).json({ message: 'Informe um nome válido.' });
            }

            if (!isValidEmail(email)) {
                return res.status(400).json({ message: 'Informe um e-mail válido.' });
            }

            if (senha.length < 6) {
                return res.status(400).json({ message: 'A senha precisa ter pelo menos 6 caracteres.' });
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

    // Realiza o login do cliente verificando e-mail e senha criptografada.
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

    // Busca todos os clientes cadastrados no sistema.
    static async getAll(req, res) {
        try {
            const listaClientes = await ClientesModel.find().select('-senha');
            return res.status(200).json(listaClientes);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao buscar clientes', error: error.message });
        }
    }

    // Busca um cliente específico pelo ID.
    static async getById(req, res) {
        try {
            const cliente = await ClientesModel.findById(req.params.id).select('-senha');
            if (!cliente) return res.status(404).json({ message: 'Cliente não encontrado' });
            return res.status(200).json(cliente);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao buscar cliente', error: error.message });
        }
    }

    // Atualiza os dados de um cliente já existente.
    static async update(req, res) {
        try {
            const clienteAtualizado = await ClientesModel.findByIdAndUpdate(
                req.params.id, 
                req.body, 
                { new: true }
            ).select('-senha');
            return res.status(200).json(clienteAtualizado);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao atualizar cliente', error: error.message });
        }
    }

    // Remove um cliente do banco pelo ID.
    static async delete(req, res) {
        try {
            await ClientesModel.findByIdAndDelete(req.params.id);
            return res.status(200).json({ message: 'Cliente removido com sucesso' });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao deletar cliente', error: error.message });
        }
    }
}

export default clientesController;