// import postgres pool
const { Pool } = require('pg')

// setup connection pool
const dbPool = new Pool({
    database: 'personal-web-siang',
    port: 5432,
    user: 'postgres',
    paassword: 'root' // based on your password at pg config
})

//export db pool
module.exports = dbPool