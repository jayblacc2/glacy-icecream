import express from 'express';
import { confirm, subscribe, unsubscribe } from '../controllers/newsletter.controller.js';

const router = express.Router();

router.route('/subscribe').post(subscribe);
router.route('/confirm').get(confirm);
router.route('/unsubscribe').post(unsubscribe);

export default router;
