var app = angular.module("myApp", ["ui.router"]);

app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider.state("participant", {
        url: "/",
		templateUrl: "participant.htm",
		controller: "participantController"
    });

	$stateProvider.state("host", {
        url: "/host",
		templateUrl: "host.htm",
		controller: "hostController"
    });

	$stateProvider.state("display", {
        url: "/display",
		templateUrl: "display.htm",
		controller: "displayController"
    });
	
    $urlRouterProvider.otherwise('/');
});







app.controller('mainController', function($scope, $interval, $location, $http) {
	$scope.host = window.location.hostname;
	$scope.url = location.origin.replace(/^http/, 'ws')

	$scope.ws = new WebSocket($scope.url); 

	$scope.ws.onerror = function() {
		console.log("ws error, closing");
		$scope.ws.close();
	};

	$scope.ping = function(){
		console.log("ping");
		console.log($scope.ws.readyState);
		if ($scope.ws.readyState === WebSocket.OPEN){
			$scope.ws.send("ping");
		}
	}

	$scope.interval = $interval($scope.ping,30000);
	//setInterval($scope.ping(), 4000);
});




app.controller('participantController', function($scope, $location, $http) {
	$scope.question = "Hello";
	$scope.options = [];
	$scope.selected = null;

	$scope.ws.onmessage = function(evt){
		// console.log(evt.data);
		if (typeof(JSON.parse(evt.data)) == 'number') {return;}
		$scope.round = JSON.parse(evt.data);
		
		console.log($scope.round);
		$scope.question = $scope.round.question;
		$scope.options = $scope.round.options;
		$scope.selected = null;
		$scope.$applyAsync();
	}	

	$scope.selectAnswer = function(index){
		$scope.selected = index;
		$scope.ws.send(JSON.stringify($scope.selected));
	}
});




app.controller('hostController', function($scope, $location, $http) {
	$scope.rounds = Array();
	$scope.rounds[0] = {};
	$scope.rounds[0].question = "What is the best language?";
	$scope.rounds[0].options = Array();
	$scope.rounds[0].options[0] = {answer:"English", count:0};
	$scope.rounds[0].options[1] = {answer:"German", count:0};
	$scope.rounds[0].options[2] = {answer:"French", count:0};
	$scope.rounds[0].options[3] = {answer:"Romanian", count:0};

	$scope.rounds[1] = {};
	$scope.rounds[1].question = "What is the the best snack?";
	$scope.rounds[1].options = Array();
	$scope.rounds[1].options[0] = {answer:"Chocolate", count:0};
	$scope.rounds[1].options[1] = {answer:"Nuts", count:0};
	$scope.rounds[1].options[2] = {answer:"Cheesie straws", count:0};
	$scope.rounds[1].options[3] = {answer:"Chrisps", count:0};


	$scope.activate = function(roundID){
		$scope.roundID = roundID;
		$scope.ws.send(JSON.stringify($scope.rounds[$scope.roundID]));	
	}

	$scope.ws.onmessage = function(evt){
		if (typeof(JSON.parse(evt.data)) == 'number') {
			data = JSON.parse(evt.data);
			$scope.rounds[$scope.roundID].options[data].count += 1;
			$scope.$applyAsync();
		}	
	}

	$scope.addRound = function(){
		$scope.rounds.push({question:"", options:[{answer:"",count:0}]})
	}

	$scope.addAnswer = function(round){
		$scope.rounds[round].options.push({answer:"",count:0});
	}
});



app.controller('displayController', function($scope, $location, $http) {
	$scope.round = {};
	$scope.totalCounts = 0;

	$scope.ws.onmessage = function(evt){
		if (typeof(JSON.parse(evt.data)) == 'number') {
			data = JSON.parse(evt.data);
			$scope.round.options[data].count += 1;
			$scope.totalCounts += 1;
		} else {
			$scope.round = JSON.parse(evt.data);
			$scope.totalCounts = 0;
		}
		
		$scope.$applyAsync();
	}	
});