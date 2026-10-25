const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    min: 1
  },
  esEjemplo: {
    type: Boolean,
    required: true,
    default: false
  },
  nombre: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80
  },
  descripcion: {
    type: String,
    required: true,
    trim: true,
    maxlength: 250
  },
  ingredientes: {
    type: [{
      type: String,
      trim: true,
      maxlength: 40
    }],
    required: true,
    validate: {
      validator: (ingredientes) => ingredientes.length >= 1 && ingredientes.length <= 10,
      message: 'Debe haber entre 1 y 10 ingredientes.'
    }
  },
  precio: {
    type: Number,
    required: true,
    min: Number.MIN_VALUE
  },
  imagen: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  categoria: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  votos: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  bufferCommands: false,
  versionKey: false,
  toJSON: {
    transform(document, result) {
      delete result._id;
      delete result.__v;
      return result;
    }
  }
});

module.exports = mongoose.model('Producto', productoSchema);
