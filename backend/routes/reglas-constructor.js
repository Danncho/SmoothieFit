const express = require('express');
const reglasConstructor = require('../config/constructorRules');

const router = express.Router();

router.get('/', (req, res) => {
  const { categorias, seleccion, tamanos } = reglasConstructor;
  return res.json({ categorias, seleccion, tamanos });
});

module.exports = router;
