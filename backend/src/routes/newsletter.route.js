import express from 'express';
import { subscribe } from '../controllers/newsletter.controller.js';

const router = express.Router();

router.route('/subscribe').post(subscribe);

export default router;
