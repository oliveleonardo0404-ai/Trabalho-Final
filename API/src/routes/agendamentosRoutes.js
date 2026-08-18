import express from 'express';
import agendamentosController from '../controllers/agendamentosControllers.js';

const router = express.Router();

router.post('/', agendamentosController.create);
router.get('/', agendamentosController.getAll);
router.get('/:id', agendamentosController.getById);
router.put('/:id', agendamentosController.update);
router.delete('/:id', agendamentosController.delete);

export default router;
