const express = require('express');
const cors = require('cors');

class Server {

    constructor () {

        // Configuración express.
        this.app = express();
        this.port = process.env.PORT;
        this.paths = {
            mercadoPago: '/api/mercadopago',
        };

        // Middlewares.
        this.middlewares();
        
        // Rutas de mi aplicación.
        this.routes();

        // Listen.
        this.listen();
    };

    middlewares () {

        // Cors.
        this.app.use( cors(({
            origin: "*", 
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            credentials: true,
            allowedHeaders: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        })) );

        // Lectura y parseo del body.
        this.app.use( express.json() );
        this.app.use( express.urlencoded( { extended: false } ) )

        // Directorio público.
        this.app.use( express.static ('public') );
    };

    routes () {
        
        this.app.use( this.paths.mercadoPago, require('../routes/mercado-pago') );
    };

    listen() {
        this.app.listen(this.port, () => {
            console.log(`Servidor corriendo en http://localhost:${this.port}.`);
        });
    };
};

module.exports = Server;