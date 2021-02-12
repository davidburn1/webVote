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
		if ($scope.ws.readyState === WebSocket.OPEN){
			$scope.ws.send("ping");
		}
	}

	$scope.interval = $interval($scope.ping,30000);
});




app.controller('participantController', function($scope, $location, $http) {
	$scope.question = "Hello";
	$scope.options = [];
	$scope.selected = null;

	$scope.ws.onmessage = function(evt){
		//console.log(evt.data);
		data = JSON.parse(evt.data);
		if (typeof(data.question) == "undefined") {return;}

		$scope.round = data;
		
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
	$scope.rounds[0].options[0] = {answer:"English"};
	$scope.rounds[0].options[1] = {answer:"German"};
	$scope.rounds[0].options[2] = {answer:"French"};
	$scope.rounds[0].options[3] = {answer:"Romanian"};

	$scope.rounds[1] = {};
	$scope.rounds[1].question = "What is the the best snack?";
	$scope.rounds[1].options = Array();
	$scope.rounds[1].options[0] = {answer:"Chocolate"};
	$scope.rounds[1].options[1] = {answer:"Nuts"};
	$scope.rounds[1].options[2] = {answer:"Cheesie straws"};
	$scope.rounds[1].options[3] = {answer:"Chrisps"};


	$scope.activate = function(roundID){
		$scope.roundID = roundID;
		$scope.ws.send(JSON.stringify($scope.rounds[$scope.roundID]));	
	}

	$scope.addRound = function(){
		$scope.rounds.push({question:"", options:[{answer:""}]})
	}

	$scope.addAnswer = function(round){
		$scope.rounds[round].options.push({answer:""});
	}
});



app.controller('displayController', function($scope, $location, $http) {
	$scope.round = {};

	$scope.ws.onmessage = function(evt){
		data = JSON.parse(evt.data);
		if (typeof(data.question) == "undefined") {
			for (var i = 0; i < $scope.round.options.length; i++) {
				$scope.round.options[i].count = data[i].count;
				$scope.round.options[i].percent = data[i].percent;
			}
		} else {
			// new question
			$scope.round = data;
			for (var i = 0; i < $scope.round.options.length; i++) {
				$scope.round.options[i].count = 0;
				$scope.round.options[i].percent = 0;
			}
		}
		
		$scope.$applyAsync();
	}	
});