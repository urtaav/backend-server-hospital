//Rutas
var express = require('express');
var fileUpload = require('express-fileUpload');
var fs = require('fs');

var app = express();

var User = require('../models/user');
var Doctor = require('../models/doctor');
var Hospital = require('../models/hospital');


//default options middleware
app.use(fileUpload());

app.put('/:type/:id', (req,res,next) => {
   
    var type = req.params.type;
    var id = req.params.id;

    //tipos de collections
    var typesValids = ['hospitals','doctors','users'];

    if(typesValids.indexOf(type) < 0){
        return res.status(400).json({
            ok:false,
            msg: 'tipo coleccion no valida',
            errors: {message:'tipo coleccion no valida'}
        });
    }

    if(!req.files){
        return res.status(400).json({
                ok:false,
                msg: 'No selecciono ningún archivo',
                errors: {message:'Debe seleccionar una imagen'}
        });
    }

    //obtener nombre de archivo
    var file = req.files.imagen;
    var cutName = file.name.split('.');
    var extFile = cutName[cutName.length -1];

    //Extensiónes permitidas
    var extensionsValids =  ['png', 'jpg', 'gif', 'jpeg','svg'];

    if(extensionsValids.indexOf(extFile) < 0){
        return res.status(400).json({
            ok:false,
            msg: 'Extención no válida',
            errors: {message:'Solo se permiten las siguientes extensiones ' + extensionsValids.join(', ')}
        });
    }

    //Nombre perzonalizado
    var nameFile = `${id}-${new Date().getMilliseconds()}.${extFile}`;



    //mover imagen del temporal a un path
    var path =`./uploads/${type}/${nameFile}`;

    file.mv( path,err =>{

        if(err){
            return res.status(500).json({
                ok:false,
                msg: 'Error al mover el archivo',
                errors: err
            });
        }

        uploadByType(type, id, nameFile, res);
        // res.status(200).json({
        //     ok:true,
        //     msg: 'Petición realizada correctamente!'
        // });
    });


});

function uploadByType(type, id, nameFile, res){

    if(type === 'users'){

        User.findById( id, (err,user) => {

            if (!user) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }

            var pathOld = './uploads/users/' + user.img;

            //Si existe elimina la imagen anterior
            if(fs.existsSync(pathOld)){
                fs.unlink(pathOld, (err) => {
                    if (err) throw err;
                    console.log('path users not found');
                  });
            }

            user.img = nameFile;

            user.save((err, userUpdate) => {

                userUpdate.password = ':)';

                return res.status(200).json({
                    ok:true,
                    msg: 'Imagen de usuario actualizada correctamente!',
                    user:userUpdate
                });
            });
        });
    }
    
    if(type === 'doctors'){
        Doctor.findById( id, (err,doctor) => {

            if (!doctor) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'doctor no existe',
                    errors: { message: 'doctor no existe' }
                });
            }

            var pathOld = './uploads/doctors/' + doctor.img;

            //Si existe elimina la imagen anterior
            if(fs.existsSync(pathOld)){
                fs.unlink(pathOld, (err) => {
                    if (err) throw err;
                    console.log('path doctors not found');
                  });
            }

            doctor.img = nameFile;

            doctor.save( (err, doctorUpdate) =>{
                return res.status(200).json({
                    ok:true,
                    msg: 'Imagen de doctor actualizada correctamente!',
                    user:doctorUpdate
                });
            });
        });
    }
    
    if(type === 'hospitals'){
        Hospital.findById( id, (err,hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'hospital no existe',
                    errors: { message: 'hospital no existe' }
                });
            }

            var pathOld = './uploads/hospitals/' + hospital.img;

            //Si existe elimina la imagen anterior
            if(fs.existsSync(pathOld)){
                fs.unlink(pathOld, (err) => {
                    if (err) throw err;
                    console.log('path hospitals not found');
                  });
            }

            hospital.img = nameFile;

            hospital.save( (err, hospitalUpdate) =>{
                return res.status(200).json({
                    ok:true,
                    msg: 'Imagen de hospital actualizada correctamente!',
                    user:hospitalUpdate
                });
            });
        });
    }
}

module.exports = app;