const mongoose = require('mongoose');

const solicitudSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  correo: {
    type: String,
    required: true,
    trim: true
  },
  telefono: {
    type: String,
    trim: true
  },
  tipo: {
    type: String,
    required: true,
    enum: ['consulta', 'colegio', 'tienda', 'pedido']
  },
  organizacion: {
    type: String,
    trim: true
  },
  mensaje: {
    type: String,
    required: true,
    trim: true
  },
  estado: {
    type: String,
    default: 'nueva'
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
}, {
  bufferCommands: false,
  versionKey: false
});

module.exports = mongoose.model('Solicitud', solicitudSchema);
