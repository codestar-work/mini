var express = require('express')
var ejs     = require('ejs')
var mongo   = require('mongodb')
var app     = express()
app.engine('html', ejs.renderFile)
app.listen(2000)

app.get('/', showIndex)
app.get('/register', showRegister)

app.use(express.static('public'))

function showIndex(req, res) {
    res.render('index.html')
}
function showRegister(req, res) {
    res.render('register.html')
}