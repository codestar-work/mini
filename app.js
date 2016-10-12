var crypto  = require('crypto')
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
app.get ('/login', showLogin)
app.post('/login', doLogin)

app.use(express.static('public'))

function showIndex(req, res) {
	res.render('index.html')
}
function showRegister(req, res) {
	res.render('register.html')
}
function registerUser(req, res) {
	var s = ''
	req.on('data', (piece) => {
		s += piece // s = s + piece
	})
	req.on('end', () => {
		console.log(s)
		var t = s.split('&')
		var info = {}
		for (var f of t) {
			var d = f.split('=')
			info[d[0]] = decodeURIComponent(d[1])
			if (d[0] == 'name') {
				info.name = info.name.replace(/\+/g, ' ')
			}
			if (d[0] == 'password') {
				info.password = crypto.createHmac('sha512',
									info.password)
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
	res.render('login.html')
}

function doLogin(req, res) {

}
