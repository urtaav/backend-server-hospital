var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
var app = express();
var User = require('../models/user');

//google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);
//========================================================================
//===============autenticacion de google==================================
//========================================================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];


    return{
        name:payload.name,
        email:payload.email,
        img:payload.picture,
        google:true
    }
  }


app.post('/google', async (req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
    .catch(e => {
        res.status(403).json({
            ok:false,
            msg: 'Token no valido!',
            errors: e
        });
    });

    User.findOne({email:googleUser.email}, (err,userDB) => {
        if( err){
            return res.status(500).json({
                ok:false,
                msg: 'Error al buscar usuario!',
                errors: err
            });
        }

        if(userDB){
            if(!userDB.google){
                    return res.status(400).json({
                        ok:false,
                        msg: 'Debe usar su autenticación normal'
                    });
            }else{
            //Crear un token!
                var token = jwt.sign({  user:userDB }, SEED, { expiresIn: 14400 });
    
    
                res.status(200).json({
                    ok:true,
                    user:userDB,
                    token:token,
                    id: userDB._id
                });
            }
        }else{
            //el usario no existe hay que crearlo
            var user = new User();
            user.name = googleUser.name;
            user.email= googleUser.email;
            user.img = googleUser.img;
            user.google = true;
            user.password = ';)';
    
            user.save((err, userDB) => {
                var token = jwt.sign({  user:userDB }, SEED, { expiresIn: 14400 });
    
    
                res.status(200).json({
                    ok:true,
                    user:userDB,
                    token:token,
                    id: userDB._id
                });
            });
    
        }
    });



    // res.status(200).json({
    //     ok:true,
    //     msg: 'Petición realizada correctamente!',
    //     googleUser: googleUser
    // });
});

//autenticación normal
app.post('/', (req, res) => {

    var body = req.body;

    User.findOne( { email: body.email }, (err, userDB ) =>{
      
        if( err){
            return res.status(500).json({
                ok:false,
                msg: 'Error al buscar usuario!',
                errors: err
            });
        }

        if(!userDB){
            return res.status(400).json({
                ok:false,
                msg: 'Credenciales incorrectas! email',
                errors: err
            });
        }

        if(!bcrypt.compareSync( body.password, userDB.password )){
          return res.status(400).json({
                    ok:false,
                    msg: 'Credenciales incorrectas! password',
                    errors: err
                });
        }

        //Crear un token!
        userDB.password = ':)p';
        var token = jwt.sign({  user:userDB }, SEED, { expiresIn: 14400 });


        res.status(200).json({
            ok:true,
            user:userDB,
            token:token,
            id: userDB._id
        });
    });
});

module.exports = app;