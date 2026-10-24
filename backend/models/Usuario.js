const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  correo: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true,
    select: false
  },
  rol: {
    type: String,
    required: true,
    enum: ['admin'],
    default: 'admin'
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
}, {
  bufferCommands: false,
  versionKey: false
});

module.exports = mongoose.model('Usuario', usuarioSchema);
