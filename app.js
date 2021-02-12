const express = require('express');
const http = require('http');
const WebSocket = require('ws')
const port  = process.env.PORT || 8080;  
const app = express();
const httpServer = http.createServer(app)
const wss = new WebSocket.Server({
    'server': httpServer
})
httpServer.listen(port)

// serve static files
app.get('/', function(req, res) {
  res.sendFile(__dirname+'/data/index.htm');
});
app.use('/', express.static(__dirname + '/data/'));





var round = {"question":"", "options":[""]};
var votes = [""];
var totalCounts = 0;

var newQuestion = function(message){
  round.question = message.question;
  round.options = message.options;

  totalCounts = 0;
  votes = Array();
  for (var i = 0; i < round.options.length; i++) {
    votes.push({"count":0, "percent":0});
  }

  wss.broadcast(JSON.stringify(round));
}

var addToScore = function(vote){
  totalCounts += 1;
  votes[vote].count += 1;

  for (var i = 0; i < round.options.length; i++) {
    votes[i].percent = Math.round(votes[i].count / totalCounts * 100);
  }
  
	wss.broadcast(JSON.stringify(votes));
}


wss.broadcast = function broadcast(msg) {
    console.log("broadcasting ", msg);
    wss.clients.forEach(function each(client) {
      client.send(msg);
    });
};

wss.on('connection', ws => {
  // runs for each new client connection
  ws.on('message', message => {
    if (message == "ping"){

    } else {
      console.log("Received message", message)

      if (typeof(JSON.parse(message)) == 'number'){
        //voting message
        addToScore(JSON.parse(message));
      } else {
        // new question message
        newQuestion(JSON.parse(message));
      }
    }
  })
    
  console.log("new connection");
  ws.send(JSON.stringify(round));
  ws.send(JSON.stringify(votes));
})


  

