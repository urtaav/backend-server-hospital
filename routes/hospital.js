//Rutas
var express = require('express');
var mdAutentication = require('../middlewares/autentications');

var app = express();
var Hospital = require('../models/hospital');

//========================================================================
//=============================Get  all Hospitals=========================
//========================================================================
app.get('/', (req,res,next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
    .populate('user','name email')
    .skip(desde)
    .limit(5)
    .exec(
        ( err, hospitals ) => {
        if( err){
            return res.status(500).json({
                ok:false,
                msg: 'Error cargando los Hospitales!',
                errors: err
            });
        }
        Hospital.count({},(err,conteo) =>{
            res.status(200).json({
                ok:true,
                hospitals:hospitals,
                total:conteo
            });
        });
    });
});
//========================================================================
//=============================update Hospital================================
//========================================================================
app.put('/:id', mdAutentication.verifyToken, (req, res) => {
   
    var id = req.params.id;
    var body = req.body;

    Hospital.findById( id, (err, hospital) => {

        
        if( err){
            return res.status(500).json({
                ok:false,
                msg: 'Error al buscar el hospital!',
                errors: err
            });
        }

        if(!hospital){
                return res.status(400).json({
                    ok:false,
                    msg: `El hospital con el id ${id} no existe`,
                    errors: {message: 'No existe un hospital con ese ID'}
                });
        }

       hospital.name = body.name;
       hospital.user = req.user._id;
       hospital.role = body.role;

       hospital.save( (err, hospitalSave ) => {
            if( err){
                return res.status(500).json({
                    ok:false,
                    msg: 'Error al actualizar hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok:true,
                hospital: hospitalSave
            });
       });
    });
});


//========================================================================
//=============================Create a new Hospital=========================
//========================================================================

app.post('/', mdAutentication.verifyToken, (req, res) => {
    
    var body = req.body;

    var hospital = new Hospital({
        name:body.name,
        user:req.user._id
    });

    hospital.save( (err,hospitalSave ) => {
        if( err){
            return res.status(400).json({
                ok:false,
                msg: 'Error al crear hospital!',
                errors: err
            });
        }

        res.status(201).json({
            ok:true,
            hospital: hospitalSave
        });
    });
});

//========================================================================
//=============================Delete Hospital================================
//========================================================================
app.delete('/:id', mdAutentication.verifyToken, (req,res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalDelete) => {
        if( err){
            return res.status(400).json({
                ok:false,
                msg: 'Error al borrar Hospital!',
                errors: err
            });
        }

        if( !hospitalDelete){
            return res.status(400).json({
                ok:false,
                msg: 'No existe un hospital con ese id!',
                errors: {message: 'NO existe hospital con ese id!'}
            });
        }

        res.status(200).json({
            ok:true,
            hospital: hospitalDelete
        });
    })
})
module.exports = app;