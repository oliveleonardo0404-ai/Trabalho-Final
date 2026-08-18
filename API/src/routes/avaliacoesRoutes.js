import express from 'express';
import avaliacoesController from '../controllers/avaliacoesControllers.js';

const router = express.Router();

router.post('/', avaliacoesController.create);
router.get('/', avaliacoesController.getAll);
router.get('/:id', avaliacoesController.getById);
router.put('/:id', avaliacoesController.update);
router.delete('/:id', avaliacoesController.delete);

export default router;
