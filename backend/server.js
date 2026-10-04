const express = require('express');
const path = require('path');

const app = express();
const frontendPath = path.join(__dirname, '..', 'frontend');

app.use(express.static(frontendPath));

app.listen(3000, () => {
  console.log('SmoothieFit está disponible en http://localhost:3000');
});
