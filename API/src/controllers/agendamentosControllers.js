import AgendamentoModel from '../models/agendamento.js';

const parseValidDate = (value) => {
    const dateText = String(value).slice(0, 10);
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateText);
    const date = new Date(value);

    if (!match || Number.isNaN(date.getTime())) return null;

    const expectedDate = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    if (
        expectedDate.getUTCFullYear() !== Number(match[1])
        || expectedDate.getUTCMonth() !== Number(match[2]) - 1
        || expectedDate.getUTCDate() !== Number(match[3])
    ) return null;

    return date;
};

class AgendamentosController {
    static async create(req, res) {
        try {
            const { cliente, pet, servico, data_entrada, data_saida, status } = req.body;

            if (!cliente || !pet || !servico || !data_entrada || !data_saida) {
                return res.status(400).json({ message: 'Todos os dados são obrigatórios.' });
            }

            const dataEntrada = parseValidDate(data_entrada);
            const dataSaida = parseValidDate(data_saida);
            if (!dataEntrada || !dataSaida || dataSaida <= dataEntrada) {
                return res.status(400).json({ message: 'Informe um período de datas válido.' });
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

    static async update(req, res) {
        try {
            const agendamento = await AgendamentoModel.findById(req.params.id);
            if (!agendamento) return res.status(404).json({ message: 'Agendamento não encontrado' });

            const dataEntrada = req.body.data_entrada ?? agendamento.data_entrada;
            const dataSaida = req.body.data_saida ?? agendamento.data_saida;
            const parsedEntrada = parseValidDate(dataEntrada);
            const parsedSaida = parseValidDate(dataSaida);
            if (!parsedEntrada || !parsedSaida || parsedSaida <= parsedEntrada) {
                return res.status(400).json({ message: 'Informe um período de datas válido.' });
            }

            if (req.body.status && !['PENDENTE', 'PAGO', 'CONFIRMADO', 'CANCELADO', 'FINALIZADO'].includes(req.body.status)) {
                return res.status(400).json({ message: 'Status de agendamento inválido.' });
            }

            const allowedFields = new Set(['pet', 'servico', 'data_entrada', 'data_saida', 'status']);
            const updates = Object.fromEntries(
                Object.entries(req.body).filter(([field]) => allowedFields.has(field)),
            );
            const agendamentoAtualizado = await AgendamentoModel.findByIdAndUpdate(req.params.id, updates, { new: true });
            return res.status(200).json(agendamentoAtualizado);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao atualizar agendamento', error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const agendamento = await AgendamentoModel.findByIdAndDelete(req.params.id);
            if (!agendamento) return res.status(404).json({ message: 'Agendamento não encontrado' });
            return res.status(200).json({ message: 'Agendamento removido com sucesso' });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao deletar agendamento', error: error.message });
        }
    }
}

export default AgendamentosController;
