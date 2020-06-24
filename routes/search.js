//Rutas
var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Doctor = require('../models/doctor');
var User = require('../models/user')

//========================================================================
//=============================Search by collection ======================
//========================================================================
app.get('/collection/:table/:search',(req, res) => {

    var table = req.params.table;
    var search = req.params.search;
    var regex = new RegExp(req.params.search,'i');

    var promise;
    

    switch(table){
        case 'user':
            promise = searchUsers(search,regex);
            break;
        case 'doctor':
            promise = searchDoctors(search,regex);
            break;
        case 'hospital':
            promise = searchHospitals(search,regex);
            break;
        default:
            return res.status(400).json({
                ok:true,
                msg:'Upz! Los tipos de busqueda solo son doctors,user and hospitals',
                error: { message:'collection no valida'}
            });
    }

    promise.then(data => {
        res.status(200).json({
            ok:true,
            [tabla]:data
        });
    })

});


//========================================================================
//==========Search all Doctors Hospitals User=============================
//========================================================================
app.get('/all/:search', (req,res,next) => {

    var search = req.params.search;
    var regex = new RegExp(req.params.search,'i');

    Promise.all( [ 
        searchHospitals(search,regex),
        searchDoctors(search,regex),
        searchUsers(search,regex) ])
    .then(response => {
        res.status(200).json({
            ok:true,
            hospitals: response[0],
            doctors:response[1],
            users: response[2]
        });
    })
});

function searchHospitals( search, regex){

    return new Promise( (resolve, reject) =>{

        Hospital.find({ name: regex })
            .populate('user','name email')
            .exec( (err,hospitals) => {

            if(err){
                reject('Error al cargar Hospitales',err);
            }else{
                resolve(hospitals);
            }
        });
    });
}

function searchDoctors( search, regex){

    return new Promise( (resolve, reject) =>{

        Doctor.find({ name: regex })
        .populate('user','name email')
        .populate('hospital')
        .exec((err,doctors) => {

            if(err){
                reject('Error al cargar doctores',err);
            }else{
                resolve(doctors);
            }
        });
    });
}

function searchUsers( search, regex){

    return new Promise( (resolve, reject) =>{

        User.find({},'name email role')
            .or([{name:regex}, {email:regex}])
            .exec( (err, users) => {
                if(err){
                    reject('Error al cargar usuarios',err);
                }else{
                    resolve(users);
                }
            });
    });
}
module.exports = app;