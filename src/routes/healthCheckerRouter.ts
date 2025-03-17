import { Router } from 'express';
import { healthcheck } from '../controllers/healthController';

const router = Router();

router.route('/health').get(healthcheck);

export default router;
