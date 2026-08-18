import express from 'express';
import connectDatabase from './src/Database/connection.js';
import clientesRoutes from './src/routes/clientesRoutes.js';
import petsRoutes from './src/routes/petsRoutes.js';
import agendamentosRoutes from './src/routes/agendamentosRoutes.js';
import avaliacoesRoutes from './src/routes/avaliacoesRoutes.js';
import servicosRoutes from './src/routes/serviçosRoutes.js';
import pagamentosRoutes from './src/routes/pagamentosRoutes.js';
import dns from 'node:dns';

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const PORT = 3001;

const databaseReady = await connectDatabase();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API de Pets rodando com sucesso!');
});

app.get('/api/health', (req, res) => {
    res.status(databaseReady ? 200 : 503).json({
        status: databaseReady ? 'online' : 'offline',
        database: databaseReady ? 'conectado' : 'indisponível'
    });
});

// Rotas ativas da API
app.use('/api/clientes', clientesRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/agendamentos', agendamentosRoutes);
app.use('/api/avaliacoes', avaliacoesRoutes);
app.use('/api/servicos', servicosRoutes);
app.use('/api/pagamentos', pagamentosRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});