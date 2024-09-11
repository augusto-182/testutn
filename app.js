const EXPRESS = require('express');
const MYSQL = require('mysql');
const CORS = require('cors');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const APP = EXPRESS();
APP.use(EXPRESS.json());
//cors or CORS
APP.use(CORS());

//Establish parameters of connection

rl.question('Por favor, ingresa tu contraseña MySQL: ', (password) => {
    rl.question('Por favor, ingresa el nombre de la base de datos: ', (database) => {

        // Crear la conexión con los datos ingresados
        const CONNECTION = MYSQL.createConnection({
            host: 'localhost',
            user: 'root',      // El usuario que configuraste (usualmente "root")
            password: password,
            database: database  // Nombre de la base de datos ingresada
        });

        // Conectar con la base de datos
        CONNECTION.connect(function(error) {
            if (error) {
                console.error('Error conectando a la base de datos:', error);
                throw error;
            } else {
                console.log(`Conectado a la base de datos: ${database}`);
                
                // Aquí puedes empezar a definir tus rutas y lógica
                APP.get('/', (req, res) => {
                    res.send('¡Conexión exitosa!');
                });

                // Mostrar todos los productos
                APP.get('/api/products', (req, res) => {
                    // Renombra 'ID' como 'id' para que el frontend lo reciba en minúsculas
                    CONNECTION.query('SELECT ID as id, descripcion, precio, stock FROM products', (error, rows) => {
                        if (error) {
                            throw error;
                        } else {
                            res.send(rows);
                        }
                    });
                });

                // Crear
                APP.post('/api/products', (req,res)=>{
                    let data = {descripcion:req.body.descripcion, precio:req.body.precio, stock:req.body.stock}
                    let sql = "INSERT INTO products SET ?"
                    CONNECTION.query(sql, data, function(error,results){
                        if(error){
                            throw error
                        }else{
                            Object.assign(data,{id:results.insertId})
                            res.send(data)
                        }
                    })
                })

                // Editar
                APP.put('/api/products/:id', (req,res)=>{
                    let id = req.params.id
                    let descripcion = req.body.descripcion
                    let precio = req.body.precio
                    let stock = req.body.stock
                    let sql = "UPDATE products SET descripcion = ?, precio = ?, stock = ? WHERE id = ?"
                    CONNECTION.query(sql, [descripcion,precio,stock,id], function(error,results){
                        if(error){
                            throw error
                        }else{
                            res.send(results)
                        }
                    })
                })

                // Borrar
                APP.delete('/api/products/:id', (req,res)=>{
                    CONNECTION.query('DELETE FROM products WHERE id = ?', [req.params.id], function(error,filas){
                        if(error){
                            throw error
                        }else{
                            res.send(filas)
                        }
                    })
                })

                // Otras rutas y lógica...

                const PORT = process.env.PORT || 3000;

                APP.listen(PORT, function () {
                    console.log('Servidor corriendo en el puerto: ' + PORT);
                });
            }
        });

        rl.close();
    });
});

module.exports = APP;