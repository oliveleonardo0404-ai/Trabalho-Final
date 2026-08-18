import express from 'express';
import pagamentosController from '../controllers/pagamentosControllers.js';

const router = express.Router();

router.post('/', pagamentosController.create);
router.get('/', pagamentosController.getAll);
router.get('/:id', pagamentosController.getById);
router.put('/:id', pagamentosController.update);
router.delete('/:id', pagamentosController.delete);

export default router;
