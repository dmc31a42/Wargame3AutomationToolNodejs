'use strict';

var app = angular.module('Wargame3AutomationTool', [
  'ui.sortable',
  'ui.sortable.multiselection',
]);

app.run(['socket','$rootScope','uiSortableMultiSelectionMethods',
  function(socket, $rootScope, uiSortableMultiSelectionMethods){
    
    socket.emit('login', {
      name: "test",
      userid: "test@test.com"
    });

    socket.on('chat', function(data){
      $rootScope.ServerSettings = data.ServerSettings;
      $rootScope.players = data.players;
    });

    $rootScope.sortableOptions = uiSortableMultiSelectionMethods.extendOptions({
      'multiSelectionOnClick': true,
      stop: function(e, ui){
        console.log($rootScope.players);
      }
    });

    angular.element('[ui-sortable]').on('ui-sortable-selectionschanged', function(e, args){
      var $this = $(this);
      var selectedItemIndexes = $this.find('.ui-sortable-selected').map(function(i, element){
        return $(this).index();
      }).toArray();
      console.log(selectedItemIndexes);
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