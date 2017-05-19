var express = require('express');
var app = express();
var http = require('http').createServer(app)
var socket = require('socket.io');
var io = socket(http);
var bodyParser = require('body-parser');


app.set('view engine', 'ejs');
app.set('views', __dirname + '/static');

// body parser middleware // 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

users = [];
connections = [];

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/static/home.html');
});

app.get('/demo', (req, res) => {
    res.render('mainPage.ejs')
})

// ESTABLISHING CONNECTION WITH SOCKETS

io.on('connection', function (socket) {
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length)

    socket.on('login', (username) => {
        users[connections.indexOf(socket)] = {
            name: username,
            timer: '',
            id: connections.indexOf(socket)
        }
        io.emit('new user', users[connections.indexOf(socket)])
        var seconds = 0;
        setInterval(() => {
            seconds++;
            if (users[connections.indexOf(socket)]) {
                users[connections.indexOf(socket)].timer = seconds
                io.emit('login time', users[connections.indexOf(socket)]);
            }
        }, 1000);

    })

    // EVENT WILL FIRE WEN THE SOCKET IS DISCONNECTED

    socket.on('disconnect', function (data) {

        if (users[connections.indexOf(socket)]) {
            var user = users[connections.indexOf(socket)];
            console.log('id', user)
            var id = user.id;
            users.splice(connections.indexOf(socket), 1);
            var updatedUsers = {
                id: id,
                user: users
            }
            io.emit('update users', updatedUsers)
        }
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length)
    })
})

// LISTENING TO SERVER ON PORT 3000

http.listen('3000', function () {
    console.log('server is running');
})

