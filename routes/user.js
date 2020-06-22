//Rutas
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

// var SEED = require('../config/config').SEED;

var mdAutentication = require('../middlewares/autentications');

var app = express();
var User = require('../models/user');

//========================================================================
//=============================Get  all Users=========================
//========================================================================
app.get('/', (req,res,next) => {

    User.find({}, 'name email img role')
    .exec(
        ( err, users ) => {
        if( err){
            return res.status(500).json({
                ok:false,
                msg: 'Error cargando Usuarios!',
                errors: err
            });
        }
        res.status(200).json({
            ok:true,
            users: users
        });
    });
});

//========================================================================
//=============================update User================================
//========================================================================
app.put('/:id', mdAutentication.verifyToken, (req, res) => {
   
    var id = req.params.id;
    var body = req.body;

    User.findById( id, (err, user) => {

        
        if( err){
            return res.status(500).json({
                ok:false,
                msg: 'Error al buscar el usuario!',
                errors: err
            });
        }

        if(!user){
            if( err){
                return res.status(400).json({
                    ok:false,
                    msg: `El usuario con el id ${id} no existe`,
                    errors: {message: 'No existe un usuario con ese ID'}
                });
            }
        }

       user.name = body.name;
       user.email = body.email;
       user.role = body.role;

       user.save( (err, userSave ) => {
            if( err){
                return res.status(500).json({
                    ok:false,
                    msg: 'Error al actualizar usuario',
                    errors: err
                });
            }

            userSave.password = ':)';
            res.status(200).json({
                ok:true,
                user: userSave
            });
       });
    });
});


//========================================================================
//=============================Create a new User=========================
//========================================================================

app.post('/', mdAutentication.verifyToken, (req, res) => {
    
    var body = req.body;

    var user = new User({
        name:body.name,
        email:body.email,
        password:bcrypt.hashSync(body.password,10),
        img:body.img,
        role:body.role
    });

    user.save( (err,userSave ) => {
        if( err){
            return res.status(400).json({
                ok:false,
                msg: 'Error al crear Usuario!',
                errors: err
            });
        }

        res.status(201).json({
            ok:true,
            user: userSave
        });
    });
});

//========================================================================
//=============================Delete User================================
//========================================================================
app.delete('/:id', mdAutentication.verifyToken, (req,res) => {
    var id = req.params.id;

    User.findByIdAndRemove(id, (err, userDelete) => {
        if( err){
            return res.status(400).json({
                ok:false,
                msg: 'Error al borrar Usuario!',
                errors: err
            });
        }

        if( !userDelete){
            return res.status(400).json({
                ok:false,
                msg: 'No existe un usuario con ese id!',
                errors: {message: 'NO existe usuario con ese id!'}
            });
        }

        res.status(200).json({
            ok:true,
            user: userDelete
        });
    })
})
module.exports = app;