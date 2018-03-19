'use strict'
var OrientDB = require('orientjs');

var server = OrientDB({
    host:       'localhost',
    port:       2424,
    username:   'root',
    password:   'root'
});



var db = server.use('GratefulDeadConcerts')


db.emit('db-open',function (result) {
    console.log(result)
})

db.emit('db-close',function (result) {
    console.log(result)
})
db.emit('db-reload',function (result) {
    console.log(result)
})

db.open().then(function () {
    console.log("open")

}).catch(function () {
    console.log("err")

})
