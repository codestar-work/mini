var express = require('express')
var ejs     = require('ejs')
var mongo   = require('mongodb')
var app     = express()
app.engine('html', ejs.renderFile)
app.listen(2000)

app.get('/', showIndex)
app.get('/register', showRegister)
// app.get('/register-user', saveNewUser)
app.post('/register-user', registerUser)

app.use(express.static('public'))

function showIndex(req, res) {
    res.render('index.html')
}
function showRegister(req, res) {
    res.render('register.html')
}
function registerUser(req, res) {
    var s = ''
    req.on('data', chunk => {
        s += chunk;
    })
    req.on('end', () => {
        s = decodeURIComponent(s)
        s = s.replace(/\+/g, ' ')
        console.log(s)
    })
}

function saveNewUser(req, res) {
    var info = {}
    info.name = req.query.name
    info.email = req.query.email
    info.password = req.query.password
    mongo.MongoClient.connect('mongodb://127.0.0.1/minishop',
        (error, db) => {
            db.collection('user').insert(info)
            res.redirect('/')
        }
    )
}

