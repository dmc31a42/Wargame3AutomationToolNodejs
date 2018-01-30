'use strict';

var app = angular.module('Wargame3AutomationTool', [
]);

app.run(['socket','$rootScope',
  function(socket, $rootScope){
    
    socket.emit('login', {
      name: "test",
      userid: "test@test.com"
    });

    socket.on('chat', function(data){
      $rootScope.ServerSettings = data.ServerSettings;
      $rootScope.players = data.players;
    });


}]);


app.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});

app.filter('parseInt',function(){
  return function(input){
    return parseInt(input);
  }
});