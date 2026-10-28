const mongoose = require('mongoose');

const creacionSchema = new mongoose.Schema({
  nombre: {
    type: String,
    trim: true,
    maxlength: 40
  },
  tamano: {
    type: String,
    required: true
  },
  base: {
    type: String,
    required: true
  },
  ingredientes: {
    type: [String],
    required: true
  }
}, {
  _id: false
});

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
  creacion: {
    type: creacionSchema,
    default: undefined
  },
  precioCalculado: {
    type: Number,
    min: 0
  },
  sucursalId: {
    type: String
  },
  codigo: {
    type: String,
    unique: true,
    sparse: true
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
