//Rutas
var express = require('express');
var app = express();
const path = require('path');
const fs = require('fs');
const { response } = require('./upload');

app.get('/:type/:image', (req,res,next) => {

    var type = req.params.type;
    var image = req.params.image;

    var pathImg = path.resolve( __dirname, `../uploads/${type}/${image}`);
    if(fs.existsSync( pathImg )){
        res.sendFile( pathImg );
    }else{
        var pathNoImage = path.resolve(__dirname,'../assets/no-image.svg');
        res.sendFile( pathNoImage );
    }
});


module.exports = app;