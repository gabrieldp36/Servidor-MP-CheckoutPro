const crypto = require('crypto');
const { response, request } = require('express');
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

const client = new MercadoPagoConfig({
	accessToken: process.env.ACCESSTOKEN,
});

const crearPreferencia = async (req = request, res = response) => {
    try {

		const body = {
			items: req.body.items,
			back_urls: {
				"success": "http://localhost:4200/#/resultado-compra",
				"failure": "http://localhost:4200/#/resultado-compra",
				"pending": "http://localhost:4200/#/resultado-compra",
			},
			notification_url: '',
			auto_return: "approved",
		};
		const preference = new Preference(client);
		const result = await preference.create({body});
		res.status(201).json({
			id: result.id,
		});

	} catch (error) {

		res.status(500).json({
			msg: error,
		});
	};
};

const webhooksMP = async (req = request, res = response) => { 

	// Obtenemos el x-signature de los headers.
	const xSignature = req.headers['x-signature']; 
	const xRequestId = req.headers['x-request-id'];

	// Obtenemos los Query params relacionados con la request URL.
	const urlParams = req.query;
	const {'data.id': dataID} = urlParams;

	// Separating the x-signature into parts
	const parts = xSignature.split(',');

	// Inicializamos las variables ts and hash.
	let ts;
	let hash;

	// Iteramos sobre los valores para obtener ts and v1.
	parts.forEach(part => {
		// Hacemos un Split para partir en key and value.
		const [key, value] = part.split('=');
		if (key && value) {
			const trimmedKey = key.trim();
			const trimmedValue = value.trim();
			if (trimmedKey === 'ts') {
				ts = trimmedValue;
			} else if (trimmedKey === 'v1') {
				hash = trimmedValue;
			}
		}
	});

	// Generamos el manifest string.
	const manifest = `id:${dataID};request-id:${xRequestId};ts:${ts};`;

	// Creamos el HMAC signature
	const hmac = crypto.createHmac('sha256', process.env.MPSECRET);
	hmac.update(manifest);

	// Obtenmos el hash resultante como un hexadecimal string.
	const sha = hmac.digest('hex');

	if (sha === hash) {
		// Verificación exitosa.
		console.log(req.body);
		res.sendStatus(200);

	} else {
		// Verificación inválida.
		console.log(`Fallo Webhooks - dataID: ${dataID}`);
		res.sendStatus(400);
	};
};

const notificarPago = async (req = request, res = response) => { 
	try {
		
		// Obtenemos el id del pago para solicitar la información del mismo.
		const { id: paymentID } = req.query;

		// Hacemos la consulta mediante la api de MP que incluye la SDK.
		const paymentClient = new Payment(client)
		const payment = await paymentClient.get({ id: paymentID });

		// Mostramos por consola el detalle actualizado del pago.
		console.log({
			id: payment.id,
			merchant_number: payment.merchant_number,
			payment_method: payment.payment_method,
			status:payment.status,
			data_approved: payment.date_approved,
			transaction_amount: payment.transaction_amount
		});

		// Enviamos la respuesta a MP para avisar que se recepciono correctamente la notificación del pago.
		res.sendStatus(200);

	} catch (error) {
		res.sendStatus(400);
	};
};

module.exports = {
    crearPreferencia,
	webhooksMP,
	notificarPago,
};