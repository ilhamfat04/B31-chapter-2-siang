// Pemanggilan package express
const express = require('express')

// Menggunakan package express
const app = express()

// Set endpoint
app.get('/', function (req, res) {
    res.send("Hello World")
})

// Konfigurasi port aplikasi
const port = 5000
app.listen(port, function () {
    console.log(`Server running on port ${port}`);
})