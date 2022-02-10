// Pemanggilan package express
const express = require('express')

// Menggunakan package express
const app = express()

// set template engine
app.set('view engine', 'hbs')

app.use('/public', express.static(__dirname + '/public'))
app.use(express.urlencoded({ extended: false }))

// true => sudah login
// false => belum login
const isLogin = true

const blogs = [
    {
        title: "Pasar Coding di Indonesia Dinilai Masih Menjanjikan",
        content: "Ketimpangan sumber daya manusia (SDM) di sektor digital masih menjadi isu yang belum terpecahkan. Berdasarkan penelitian ManpowerGroup, ketimpangan SDM global, termasuk Indonesia, meningkat dua kali lipat dalam satu dekade terakhir. Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quam, molestiae numquam! Deleniti maiores expedita eaque deserunt quaerat! Dicta, eligendi debitis?",
        author: "Ichsan Emrald Alamsyah",
        posted_at: "12 Jul 2021 22:30 WIB"
    }
]

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

    console.log(blogs) // hanya ada 4 properti

    let dataBlogs = blogs.map(function (data) {
        return {
            ...data,
            isLogin: isLogin
        }
    })

    res.render('blog', { isLogin: isLogin, blogs: dataBlogs })
})

app.get('/add-blog', function (req, res) {
    res.render('form-blog')
})

app.post('/blog', function (req, res) {
    let title = req.body.title
    let content = req.body.content
    let date = new Date()

    let blog = {
        title: title,
        content,
        author: "Ichsan Emrald Alamsyah",
        posted_at: getFullTime(date)
    }

    blogs.push(blog)

    res.redirect('/blog')

})

app.get('/blog/:id', function (req, res) {
    let id = req.params.id
    console.log(`Id dari client : ${id}`)

    res.render('blog-detail', { id: id })
})

app.get('/contact-me', function (req, res) {
    res.render('contact')
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