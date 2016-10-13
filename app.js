var crypto  = require('crypto')
var express = require('express')
var ejs     = require('ejs')
var mongo   = require('mongodb')
var multer  = require('multer')

var upload  = multer( {dest: 'uploaded'} )
var app     = express()
var valid   = [ ]
app.engine('html', ejs.renderFile)
app.listen(2000)

app.get('/', showIndex)
app.get('/register', showRegister)
// app.get('/register-user', saveNewUser)
app.post('/register-user', registerUser)
app.get ('/login', showLogin)
app.post('/login', doLogin)
app.get('/profile', showProfile)
app.get('/logout', showLogout)
app.post('/save-profile', upload.single('photo'), makeProfile)

app.use(express.static('public'))

function showIndex(req, res) {
	res.render('index.html')
}
function showRegister(req, res) {
	res.render('register.html')
}
function registerUser(req, res) {
	var s = ''
	req.on('data', piece => {
		s += piece
	})
	req.on('end', () => {
		var t = s.split('&')
		var info = {}
		for (var f of t) {
			var d = f.split('=')
			info[d[0]] = decodeURIComponent(d[1])
			if (d[0] == 'name') {
				info.name = info.name.replace(/\+/g, ' ')
			}
			if (d[0] == 'password') {
				info.password = crypto.createHmac('sha512', info.password)
									.update('mini-password')
									.digest('hex')
			}
		}
		
		mongo.MongoClient.connect('mongodb://127.0.0.1/minishop',
			(error, db) => {
				var c = { email: info.email }
				db.collection('user').find(c).toArray(
					(error, data) => {
						if (data.length == 0) {
							db.collection('user').insert(info)
							res.redirect('/login')
						} else {
							res.redirect('/register?Duplicated')
						}
					}
				)
			}
		)
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

function showLogin(req, res) {
	var card = extractSession(req.get('cookie'))
	if (valid[card]) {
		res.redirect('/profile')
	} else {
		res.render('login.html')
	}
}

function doLogin(req, res) {
	var s = ''
	req.on('data', piece => { s += piece })
	req.on('end', () => {
		var t = s.split('&')
		var info = { }
		for (var f of t) {
			var d = f.split('=')
			info[d[0]] = decodeURIComponent(d[1])
		}
		info.password = crypto.createHmac('sha512', info.password)
						.update('mini-password')
						.digest('hex')
		mongo.MongoClient.connect('mongodb://127.0.0.1/minishop',
			(error, db) => {
				db.collection('user').find(info).toArray(
					(error, data) => {
						if (data.length == 0) {
							console.log("INCORRECT")
							res.redirect("/login?Invalid Password")
						} else {
							console.log("CORRECT")
							var card = generateSession()
							valid[card] = data[0] // this card is valid
							res.set('Set-Cookie', 'session=' + card)
							res.redirect("/profile")
						}
					}
				)
			}
		)
	})
}

function generateSession() {
	var a = Math.random() * 1000000
	var b = Math.random() * 1000000
	var c = Math.random() * 1000000
	a = parseInt(a)
	b = parseInt(b)
	c = parseInt(c)
	return a + '-' + b + '-' + c
}

function extractSession(cookie) {
	cookie += ';'
	var start = cookie.indexOf('session=') + 8
	var stop  = cookie.indexOf(';', start)
	return cookie.substring(start, stop)
}

function showProfile(req, res) {
	var card = extractSession(req.get('cookie'))
	if (valid[card]) {
		res.render('profile.html')
	} else {
		res.redirect('/login')
	}
}

function showLogout(req, res) {
	var card = extractSession(req.get('cookie'))
	delete valid[card]
	res.render('logout.html')
}

function makeProfile(req, res) {
	console.log(req.file)
	res.redirect('/profile')
}