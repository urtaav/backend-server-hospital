//Rutas
var express = require('express');
var mdAutentication = require('../middlewares/autentications');

var app = express();
var Doctor = require('../models/doctor');

//========================================================================
//=============================Get  all Hospitals=========================
//========================================================================
app.get('/', (req,res,next) => {
   
    var desde = req.query.desde || 0;
    desde = Number(desde);


    Doctor.find({})
    .populate('user','name email')
    .populate('hospital')
    .skip(desde)
    .limit(5)
    .exec(
        ( err, doctors ) => {
        if( err){
            return res.status(500).json({
                ok:false,
                msg: 'Error cargando los medicos!',
                errors: err
            });
        }
        Doctor.count({},(err,conteo) =>{   
            res.status(200).json({
                ok:true,
                doctors:doctors,
                total:conteo
            });
        });


    });
});
//========================================================================
//=============================update Dcotor================================
//========================================================================
app.put('/:id', mdAutentication.verifyToken, (req, res) => {
   
    var id = req.params.id;
    var body = req.body;

    Doctor.findById( id, (err, doctor) => {

        
        if( err){
            return res.status(500).json({
                ok:false,
                msg: 'Error al buscar el medico!',
                errors: err
            });
        }

        if(!doctor){
                return res.status(400).json({
                    ok:false,
                    msg: `El doctor con el id ${id} no existe`,
                    errors: {message: 'No existe un doctor con ese ID'}
                });
        }

        doctor.name = body.name;
        doctor.user = req.user._id;
        doctor.hospital = body.hospital;

        doctor.save( (err, doctorSave ) => {
            if( err){
                return res.status(500).json({
                    ok:false,
                    msg: 'Error al actualizar doctor',
                    errors: err
                });
            }
            res.status(200).json({
                ok:true,
                doctor: doctorSave
            });
       });
    });
});


//========================================================================
//=============================Create a new Doctor=========================
//========================================================================

app.post('/', mdAutentication.verifyToken, (req, res) => {
    
    var body = req.body;

    var doctor = new Doctor({
        name: body.name,
        user: req.user._id,
        hospital: body.hospital
    });

    doctor.save( (err,doctorSave ) => {
        if( err){
            return res.status(400).json({
                ok:false,
                msg: 'Error al crear doctor!',
                errors: err
            });
        }

        res.status(201).json({
            ok:true,
            doctor: doctorSave
        });
    });
});

//========================================================================
//=============================Delete Doctor================================
//========================================================================
app.delete('/:id', mdAutentication.verifyToken, (req,res) => {
    var id = req.params.id;

    Doctor.findByIdAndRemove(id, (err, doctorDelete) => {
        if( err){
            return res.status(400).json({
                ok:false,
                msg: 'Error al borrar doctor!',
                errors: err
            });
        }

        if( !doctorDelete){
            return res.status(400).json({
                ok:false,
                msg: 'No existe un doctor con ese id!',
                errors: {message: 'NO existe doctor con ese id!'}
            });
        }

        res.status(200).json({
            ok:true,
            doctor: doctorDelete
        });
    })
})
module.exports = app;