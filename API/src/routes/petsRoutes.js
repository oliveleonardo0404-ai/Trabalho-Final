import express from 'express';
import petsController from '../controllers/petsControllers.js';

const router = express.Router();

router.post('/', petsController.create);
router.get('/', petsController.getAll);
router.get('/:id', petsController.getById);
router.put('/:id', petsController.update);
router.delete('/:id', petsController.delete);

export default router;
