//Requires
var express = require('express');
var mongoose = require('mongoose')
var bodyParser = require('body-parser');

//Inicializar variables
var app = express();

//Body parser
//parse application/x-www-from-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//Import Rutas
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var hospitalRoutes = require('./routes/hospital');
var doctorRoutes = require('./routes/doctor');
var searchRoutes = require('./routes/search');
var uploadRoutes = require('./routes/upload');
var imagesRoutes = require('./routes/images');
var loginRoutes = require('./routes/login');


//Conexion a base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', {useNewUrlParser: true, useUnifiedTopology: true},(err,res) => {
    
    if( err ) throw err;

    console.log('Base de datos \x1b[32m%s\x1b[0m' , 'online');
})

// mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});


//Rutas
app.use('/user', userRoutes);
app.use('/hospital',hospitalRoutes);
app.use('/doctor',doctorRoutes);
app.use('/search',searchRoutes);
app.use('/login', loginRoutes);
app.use('/upload',uploadRoutes);
app.use('/images',imagesRoutes);
app.use('/', appRoutes);

//Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m' , 'online');
});
