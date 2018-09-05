var controller = angular.module('Wargame3AutomationTool.controller.login', []);

controller.controller('Wargame3AutomationTool.controller.login', ['$rootScope', '$scope', '$state', 'socket', '$timeout', '$cookies', 
    function ($rootScope, $scope, $state, socket, $timeout, $cookies) {
        
    	$scope.loginAdmin = function(){
    	    socket.emit('login:admin', {
    	        Code: $rootScope.AdminCode,
    	    });
    	};

    	$scope.loginSelectTeam = function(){
    	    socket.emit('login:SelectTeam',{
    	        Code: $rootScope.SelectTeamCode,
    	    });
    	};
    }
])