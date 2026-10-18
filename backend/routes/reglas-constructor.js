const express = require('express');
const reglasConstructor = require('../config/constructorRules');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(reglasConstructor);
});

module.exports = router;
