var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un role permitido'
}

var userSchema = new Schema({
    name: { type: String, required: [true,'Name is required'] },
    email: { type: String, unique:true, required: [true,'Email is required'] },
    password: { type: String, required: [true,'Password is required'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum:rolesValidos },
});

userSchema.plugin(uniqueValidator, { message: '{PATH} El correo debe de ser unico' })

module.exports = mongoose.model('User',userSchema);