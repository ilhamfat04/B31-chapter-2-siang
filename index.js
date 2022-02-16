// Pemanggilan package express
const express = require('express')

// Import package bcrypt
const bcrypt = require('bcrypt')

// import package express-flash and express-session
const flash = require('express-flash')
const session = require('express-session')

// import db connection
const db = require('./connection/db')

// Menggunakan package express
const app = express()

// set template engine
app.set('view engine', 'hbs')

app.use('/public', express.static(__dirname + '/public'))
app.use(express.urlencoded({ extended: false }))

// use express-flash
app.use(flash())

// setup session midleware
app.use(
    session({
        cookie: {
            maxAge: 1000 * 60 * 60 * 2,
            secure: false,
            httpOnly: true
        },
        store: new session.MemoryStore(),
        saveUninitialized: true,
        resave: false,
        secret: "secretValue"
    })
)

const isLogin = true

let month = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
]

// Set endpoint
app.get('/', function (req, res) {
    res.send("Hello World")
})

app.get('/home', function (req, res) {
    res.render('index')
})

app.get('/blog', function (req, res) {

    let query = 'SELECT * FROM tb_blog ORDER BY id DESC'

    db.connect((err, client, done) => {
        if (err) throw err

        client.query(query, (err, result) => {
            done()

            if (err) throw err
            let data = result.rows

            data = data.map((blog) => {
                return {
                    ...blog,
                    post_at: getFullTime(blog.post_at),
                    post_age: getDistanceTime(blog.post_at),
                    isLogin: isLogin
                }
            })

            res.render('blog', { isLogin: isLogin, blogs: data })
        })
    })
})

app.get('/add-blog', function (req, res) {

    if (!isLogin) {
        res.redirect('/home')
    }

    res.render('form-blog')
})

app.post('/blog', function (req, res) {
    // let title = req.body.title
    // let content = req.body.content

    let { title, content } = req.body


    let blog = {
        title: title,
        content,
        image: 'image.png'
    }

    db.connect((err, client, done) => {
        if (err) throw err

        let query = `INSERT INTO tb_blog(title, content, image) VALUES
                        ('${blog.title}', '${blog.content}', '${blog.image}')`

        client.query(query, (err, result) => {
            done()
            if (err) throw err

            res.redirect('/blog')
        })
    })
})

app.get('/blog/:id', function (req, res) {
    // let id = req.params.id
    let { id } = req.params

    db.connect((err, client, done) => {
        if (err) throw err

        let query = `SELECT * FROM tb_blog WHERE id=${id}`
        client.query(query, (err, result) => {
            done()
            if (err) throw err

            result = result.rows[0]
            res.render('blog-detail', { blog: result })
        })
    })
})

app.get('/delete-blog/:id', function (req, res) {
    let { id } = req.params

    db.connect((err, client, done) => {
        if (err) throw err

        let query = `DELETE FROM tb_blog WHERE id=${id}`

        client.query(query, (err, result) => {
            done()
            if (err) throw err

            res.redirect('/blog')
        })
    })
})

app.get('/update-blog/:id', function (req, res) {
    let { id } = req.params

    db.connect((err, client, done) => {
        if (err) throw err

        let query = `SELECT * FROM tb_blog WHERE id=${id}`

        client.query(query, (err, result) => {
            done()
            if (err) throw err

            result = result.rows[0]

            res.render('blog-update', { blog: result })
        })
    })
})

app.post('/update-blog/:id', function (req, res) {
    let { id } = req.params
    let { title, content } = req.body

    let query = `UPDATE tb_blog SET title='${title}', content='${content}' WHERE id=${id}`

    db.connect((err, client, done) => {
        if (err) throw err

        client.query(query, (err, result) => {
            done()
            if (err) throw err

            res.redirect('/blog')
        })
    })
})

app.get('/contact-me', function (req, res) {
    res.render('contact')
})

app.get('/register', function (req, res) {
    res.render('register')
})

app.post('/register', function (req, res) {
    let { name, email, password } = req.body

    let hashPassword = bcrypt.hashSync(password, 10)

    db.connect((err, client, done) => {
        if (err) throw err

        let query = `INSERT INTO tb_user(name, email, password) VALUES
                        ('${name}','${email}','${hashPassword}')`

        client.query(query, (err, result) => {
            done()
            if (err) throw err
            req.flash('success', 'Account succesfully registered ')
            res.redirect('/login')
        })
    });
})

app.get('/login', function (req, res) {
    res.render('login')
})

app.post('/login', function (req, res) {
    let { email, password } = req.body

    db.connect((err, client, done) => {
        if (err) throw err

        let query = `SELECT * FROM tb_user WHERE email='${email}'`

        client.query(query, (err, result) => {
            done()
            if (err) throw err

            if (result.rows.length == 0) {
                req.flash('danger', 'Account not found!')
                return res.redirect('/login')
            }

            let isMatch = bcrypt.compareSync(password, result.rows[0].password)

            if (isMatch) {
                req.flash('success', 'Login Success')
                res.redirect('/blog')
            } else {
                res.redirect('/login')
            }
        })
    })

})

// Konfigurasi port aplikasi
const port = 5000
app.listen(port, function () {
    console.log(`Server running on port ${port}`);
})

function getFullTime(time) {
    let date = time.getDate()
    let monthIndex = time.getMonth()
    let year = time.getFullYear()

    let hours = time.getHours()
    let minutes = time.getMinutes()

    if (minutes < 10) {
        minutes = '0' + minutes
    }

    return `${date} ${month[monthIndex]} ${year} ${hours}:${minutes} WIB`
}

function getDistanceTime(time) {
    // waktu saat ini - waktu postingan
    const distance = new Date() - new Date(time)
    //Convert to day
    const miliseconds = 1000
    const secondsInMinute = 60
    const minutesInHour = 60
    const secondsInHour = secondsInMinute * minutesInHour
    const hoursInDay = 23

    let dayDistance = distance / (miliseconds * secondsInHour * hoursInDay)

    if (dayDistance >= 1) {
        return Math.floor(dayDistance) + ' day ago'
    } else {
        // convert to hour
        let hourDistance = Math.floor(distance / (miliseconds * secondsInHour))
        if (hourDistance > 0) {
            return hourDistance + ' hour ago'
        } else {
            // convert to minute
            const minuteDistance = Math.floor(distance / (miliseconds * secondsInMinute))
            return minuteDistance + ' minute ago'
        }
    }
}