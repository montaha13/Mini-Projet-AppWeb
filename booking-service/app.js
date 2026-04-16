require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

app.get('/health', (req, res) => res.status(200).send('Booking Service OK'));

app.listen(PORT, () => {
    console.log(`Booking Service running on port ${PORT}`);
});
