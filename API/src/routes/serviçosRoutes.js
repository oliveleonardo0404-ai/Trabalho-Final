import express from 'express';
import serviçosController from '../controllers/serviçosControllers.js';

const router = express.Router();

router.post('/', serviçosController.create);
router.get('/', serviçosController.getAll);
router.get('/:id', serviçosController.getById);
router.put('/:id', serviçosController.update);
router.delete('/:id', serviçosController.delete);

export default router;
