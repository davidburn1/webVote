const express = require('express');
//const app = express();
const http = require('http');//.Server(app);
const WebSocket = require('ws')
// const wss = new WebSocket.Server({ port: 81 })

const port  = process.env.PORT || 8080;  

const app = express();

const httpServer = http.createServer(app)
const wss = new WebSocket.Server({
    'server': httpServer
})
httpServer.listen(port)

//const { Server } = require('ws');
//const wss = new Server({ server });


app.get('/', function(req, res) {
  res.sendFile(__dirname+'/data/index.htm');
});
app.use('/', express.static(__dirname + '/data/'));





wss.broadcast = function broadcast(msg) {
    console.log("broadcasting ", msg);
    wss.clients.forEach(function each(client) {
      client.send(msg);
    });
};

wss.on('connection', ws => {
  // runs for each new client connection
  ws.on('message', message => {
    console.log("Received message", message)
    //if (message == "next round") nextRound();
    wss.broadcast(message);
  })
    
  console.log("new connection");
  //ws.send("welcome message");
    
})


  

// const server = http.listen(port, function() {
//     console.log('listening on *:80');
// });

