var controller = angular.module('Wargame3AutomationTool.controller.admin', []);

controller.controller('Wargame3AutomationTool.controller.admin', ['socket', 'socketMain','$rootScope', '$scope','uiSortableMultiSelectionMethods','$interval','$timeout', '$cookieStore', '$state', '$uibModal',
  function(socket, socketMain, $rootScope, $scope, uiSortableMultiSelectionMethods, $interval, $timeout, $cookieStore, $state, $uibModal){
    $scope.origin = window.location.origin;
    $scope.openPlayerDetail = function(){
      console.log('opening PlayerDetail pop up');
      if($scope.selectedItems.length == 1){
        var playerid = $scope.selectedItems[0];
        var player = $scope.players[playerid];
        console.log($scope.selectedItems[0]);
        var modalInstance = $uibModal.open({
          templateUrl: 'partials/playerDetailPopUp.html',
          controller: 'Wargame3AutomationTool.controller.playerDetailPopUp',
          resolve: {
            player: function(){
              return player;
            }
          }
        });
      }
    };

    $scope.Team1 = {};
    $scope.Team2 = {};
    $scope.Left = {};
    $scope.err = '';
    $scope.selectedItems = {};
    $scope.playersListOrderPropertyName = 'playerid';
    $scope.playersListOrderReverse = false;
    $scope.playersListSortBy = function(propertyName){
      $scope.playersListOrderReverse = ($scope.playersListOrderPropertyName === propertyName) ? !$scope.playersListOrderReverse : false;
      $scope.playersListOrderPropertyName = propertyName;
    };
    $scope.UnselectedPlayersListOrderPropertyName = 'playerid';
    $scope.UnselectedPlayersListOrderReverse = false;
    $scope.UnselectedPlayersListSortBy = function(propertyName){
      $scope.UnselectedPlayersListOrderReverse = ($scope.UnselectedPlayersListOrderPropertyName === propertyName) ? !$scope.UnselectedPlayersListOrderReverse : false;
      $scope.UnselectedPlayersListOrderPropertyName = propertyName;
    }

    socketMain.on('serverStateChanged', function(data){
      if(loadFromServer){
        $timeout.cancel(loadFromServer);
      }
      $scope.ServerSettings = data;
      $scope.players = data.players;
      socket.emit('infoChanged');
    });

    socket.on("infoChanged", (data)=>{
      $scope.selectTeamSettings = data;
      var tmpTeam1 = {};
      var tmpTeam2 = {};
      var tmpLeft = {};
      var playerids = Object.keys($scope.players);
      playerids.forEach(function(element,index,array){
         var value = parseInt(element);
         if($scope.selectTeamSettings.team1Selected.indexOf(value)>-1) {
             tmpTeam1[value] = $scope.players[value];
         } else if($scope.selectTeamSettings.team2Selected.indexOf(value)>-1) {
             tmpTeam2[value] = $scope.players[value];
         } else {
             tmpLeft[value] = $scope.players[value];
         }
      });
      $scope.Team1 = tmpTeam1;
      $scope.Team2 = tmpTeam2;
      $scope.Left = tmpLeft;
    })

    $scope.sortableOptions = uiSortableMultiSelectionMethods.extendOptions({
      'multiSelectionOnClick': true,
      stop: function(e, ui){
        console.log($scope.players);
      }
    });

    angular.element('[ui-sortable]').on('ui-sortable-selectionschanged', function(e, args){
      var $this = $(this);
      var selectedItemIndexes = $this.find('.ui-sortable-selected').map(function(i, element){
        return $(this).index();
      }).toArray();
      console.log(selectedItemIndexes);
    });

    var loadFromServer;

    $scope.changewhoisSelectTeam = function(side) {
      socket.emit('setWhoisTurn',{
        whoisTurn : side
      });
    };
    $scope.SetSelectTeamAccessCode = function(side, code){
      socket.emit('setTeamCode',{
        side: side,
        code: code
      });
    };
    $scope.resetSelectTeam = function(){
      socket.emit('resetSelectTeam',{});
    }

    $scope.yourTeam  = -1

    angular.element('[ui-sortable]').on('ui-sortable-selectionschanged', function(e, args){
        var $this = $(this);
        var selectedItemIndexes = $this.find('.ui-sortable-selected').map(function(i, element){
            return $(this).index();
        }).toArray();
        console.log(selectedItemIndexes);
        var selectedItems = [];
        var playerids = Object.keys($scope.Left);
        selectedItems = $.map(selectedItemIndexes, function(i) {
            return playerids[i];
        });
        console.log(selectedItems);
        $scope.selectedItems = selectedItems;
    });

    $scope.setSideInList = function(player, side){
      socket.emit('setTeam',{
        playerid: parseInt(player.playerid),
        side: side
      });
      $scope.selectedItems = [];
    };

    $scope.setSelectedSide = function(side){
      if($scope.selectedItems.length == 1){
        if($scope.Left[parseInt($scope.selectedItems[0])]){
          socket.emit('setTeam',{
            playerid: parseInt($scope.selectedItems[0]),
            side: side
          });
          $scope.selectedItems = [];
        }
      }
    };

    $scope.setApplyImmediately = function(value) {
      socket.emit('setImmediately', {
        immediately: value
      });
    };

    socketMain.emit('serverStateChanged');
  }
]);
