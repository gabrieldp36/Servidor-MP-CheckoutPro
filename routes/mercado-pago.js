const {Router} = require('express');
const { crearPreferencia, webhooksMP, notificarPago } = require('../controllers/mercado-pago');
const router = Router();

router.post('/create-preference', crearPreferencia);
router.post('/webhooks', webhooksMP);
router.post('/notification-payment', notificarPago);

module.exports = router;