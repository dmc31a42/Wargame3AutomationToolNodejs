var controller = angular.module('Wargame3AutomationTool.controller.admin', []);

controller.controller('Wargame3AutomationTool.controller.admin', ['socket','$rootScope', '$scope','uiSortableMultiSelectionMethods','$interval','$timeout', '$cookieStore', '$state', '$uibModal',
  function(socket, $rootScope, $scope, uiSortableMultiSelectionMethods, $interval, $timeout, $cookieStore, $state, $uibModal){
    $scope.origin = window.location.origin;
    if($rootScope.AdminLoginResult == 'OK'){
    } else {
      if($cookieStore.get('AdminCode')){
        socket.emit('login:admin', {
          Code: $cookieStore.get('AdminCode'),
        });
      } else {
        $state.go('login');
      }
    }
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

    socket.on('Admin', function(data){
      if(loadFromServer){
        $timeout.cancel(loadFromServer);
      }
      $scope.ServerSettings = data.ServerSettings;
      $scope.players = data.players;
      $scope.customModSettings = data.customModSettings;
      $scope.customModSettingsAdmin = data.customModSettingsAdmin;
      if(!$scope.AutoLaunchCond && $scope.ServerSettings.NbMinPlayer){
        $scope.AutoLaunchCond = $scope.ServerSettings.NbMinPlayer - $scope.ServerSettings.NbMaxPlayer;  
      }


      var tmpTeam1 = {};
      var tmpTeam2 = {};
      var tmpLeft = {};
      var playerids = Object.keys($scope.players);
      playerids.forEach(function(element,index,array){
         var value = parseInt(element);
         if($scope.customModSettings.SelectTeam.Team1Selected.indexOf(value)>-1) {
             tmpTeam1[value] = $scope.players[value];
         } else if($scope.customModSettings.SelectTeam.Team2Selected.indexOf(value)>-1) {
             tmpTeam2[value] = $scope.players[value];
         } else {
             tmpLeft[value] = $scope.players[value];
         }
      });
      $scope.Team1 = tmpTeam1;
      $scope.Team2 = tmpTeam2;
      $scope.Left = tmpLeft;
    });

    $scope.$watch('ServerSettings.NbMaxPlayer', function(){
        if($scope.ServerSettings && $scope.ServerSettings.hasOwnProperty('NbMaxPlayer') && !isNaN($scope.AutoLaunchCond)){
            $scope.ServerSettings.NbMinPlayer = $scope.ServerSettings.NbMaxPlayer + $scope.AutoLaunchCond;
            socket.emit('Admin:SendServerSetting', {
                Property: 'NbMinPlayer',
                value: $scope.ServerSettings.NbMinPlayer
            });
        }
    });

    $scope.$watch('ServerSettings.NbMinPlayer', function(){
      if($scope.ServerSettings && $scope.ServerSettings.hasOwnProperty('NbMaxPlayer')) {
        $scope.AutoLaunchCond = $scope.ServerSettings.NbMinPlayer - $scope.ServerSettings.NbMaxPlayer;
      }
    });

    $scope.$watch('ServerSettings.VictoryCond', function(){
      if($scope.ServerSettings && $scope.ServerSettings.hasOwnProperty('VictoryCond')) {
        var VictoryCond = $scope.Wargame3SelectOptions.VictoryCond.find(item=>item.value == $scope.ServerSettings.VictoryCond);
        if(!VictoryCond) {
          VictoryCond = $scope.Wargame3SelectOptions.VictoryCond.find(item=>item.value == 1);
          $scope.ServerSettings.VictoryCond = VictoryCond.mapKey + '_' + val; 
        }
      }
    });

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

    $scope.SendServerSetting = function(Property, value){
      if(loadFromServer){
        $timeout.cancel(loadFromServer);
      }
      loadFromServer = $timeout(function(){
        socket.emit('Admin:requestServerSetting');
      },500);
      socket.emit('Admin:SendServerSetting', {
        Property: Property,
        value: value
      });
      if(Property == 'VictoryCond'){
        if($scope.ServerSettings && $scope.ServerSettings.hasOwnProperty('VictoryCond')) {
          var val = $scope.ServerSettings.Map;
          $rootScope.Wargame3SelectOptions.VictoryCond.forEach(function (value, index, array){
            val = val.replace(value.mapKey + '_', '');
          })
          var VictoryCond = $rootScope.Wargame3SelectOptions.VictoryCond.find(item=>item.value == $scope.ServerSettings.VictoryCond);
          if(!VictoryCond) {
            VictoryCond = $rootScope.Wargame3SelectOptions.VictoryCond.find(item=>item.value == 1);
          }
          var value2 = VictoryCond.mapKey + '_' + val;
          socket.emit('Admin:SendServerSetting', {
            Property: 'Map',
            value: value2
          });
        }
      }
    }
    socket.emit('Admin:requestServerSetting');

    $scope.changeSide = function(player, side){
      socket.emit('Admin:setpvar', {
        playerid: player.playerid, 
        Property: 'PlayerAlliance',
        value: side
      });
    };

    $scope.changewhoisSelectTeam = function(side) {
      socket.emit('Admin:changewhoisSelectTeam',{
        whoisSelectTeam : side
      });
    };


    $scope.SetSelectTeamAccessCode = function(key, value){
      socket.emit('Admin:SetSelectTeamAccessCode',{
        key: key,
        value: value
      });
    };

    $scope.resetSelectTeam = function(){
      socket.emit('Admin:resetSelectTeam',{});
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

    $scope.command = function(_command){
      socket.emit('Admin:command', {
        command: _command
      });
    }

    /*$scope.changeSelectedSide = function(){
      if($scope.selectedItems.length == 1){
        if($scope.Team1[parseInt($scope.selectedItems[0])]){
          socket.emit('Admin:setTeam',{
            playerid: parseInt($scope.selectedItems[0]),
            side: 1
          });
          $scope.selectedItems = [];
        } else if($scope.Team2[parseInt($scope.selectedItems[0])]){
          socket.emit('Admin:setTeam',{
            playerid: parseInt($scope.selectedItems[0]),
            side: 0
          });
          $scope.selectedItems = [];
        }
      }
    };*/

    $scope.setSideInList = function(player, side){
      socket.emit('Admin:setTeam',{
        playerid: parseInt(player.playerid),
        side: side
      });
      $scope.selectedItems = [];
    };
    
    /*$scope.unSelectSide = function(){
      if($scope.selectedItems.length == 1){
        if($scope.Team1[parseInt($scope.selectedItems[0])]){
          socket.emit('Admin:setTeam',{
            playerid: parseInt($scope.selectedItems[0]),
            side: -1
          });
          $scope.selectedItems = [];
        } else if($scope.Team2[parseInt($scope.selectedItems[0])]){
          socket.emit('Admin:setTeam',{
            playerid: parseInt($scope.selectedItems[0]),
            side: -1
          });
          $scope.selectedItems = [];
        }
      }
    };*/

    $scope.setSelectedSide = function(side){
      if($scope.selectedItems.length == 1){
        if($scope.Left[parseInt($scope.selectedItems[0])]){
          socket.emit('Admin:setTeam',{
            playerid: parseInt($scope.selectedItems[0]),
            side: side
          });
          $scope.selectedItems = [];
        }
      }
    };

    $scope.setApplyImmediately = function(value) {
      socket.emit('Admin:SetSelectTeamSetting', {
        'property': 'ApplyImmediately',
        'value': value
      });
    };

    $scope.changeNbMaxPlayer = function(NbMaxPlayer){
      var InitMoney = NbMaxPlayer/2*1000;
      var ScoreLimit = $scope.ServerSettings.VictoryCond === 4 ? 500 : InitMoney*2;
      $scope.SendServerSetting('NbMaxPlayer',NbMaxPlayer);
      $scope.SendServerSetting('InitMoney',InitMoney);
      $scope.SendServerSetting('ScoreLimit',ScoreLimit);
    }

    $scope.changeVictoryCond = function(VictoryCond){
      var InitMoney = $scope.ServerSettings.NbMaxPlayer/2*1000;
      var ScoreLimit = VictoryCond === 4 ? 500 : InitMoney*2;
      $scope.SendServerSetting('VictoryCond',VictoryCond);
      $scope.SendServerSetting('InitMoney',InitMoney);
      $scope.SendServerSetting('ScoreLimit',ScoreLimit);
    }
  }
]);

controller.directive('convertMap', function($rootScope ) {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(val){
        var VictoryCond = $rootScope.Wargame3SelectOptions.VictoryCond.find(item=>item.value == scope.ServerSettings.VictoryCond);
        if(!VictoryCond) {
          VictoryCond = $rootScope.Wargame3SelectOptions.VictoryCond.find(item=>item.value == 1);
        }
        return VictoryCond.mapKey + '_' + val;          
      });
      ngModel.$formatters.push(function(val) {
        val = val + '';
        if(scope.ServerSettings && scope.ServerSettings.hasOwnProperty('VictoryCond')) {
          return val.replace($rootScope.Wargame3SelectOptions.VictoryCond.find(item=>item.value == scope.ServerSettings.VictoryCond).mapKey + '_', '');
        } else {
          return '';
        }
      })
    }
  };
});

controller.directive('autoLaunchCond', function($rootScope) {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(val){
        scope.AutoLaunchCond = val;
        return scope.ServerSettings.NbMaxPlayer + val;
      });
      ngModel.$formatters.push(function(val){
        scope.AutoLaunchCond = val-scope.ServerSettings.NbMaxPlayer;
        if(scope.AutoLaunchCond>1) {
          scope.SendServerSetting('NbMinPlayer', scope.ServerSettings.NbMaxPlayer + 1)
          return 1;
        } else if(scope.AutoLaunchCond <-1){
          scope.SendServerSetting('NbMinPlayer', scope.ServerSettings.NbMaxPlayer - 1)
          return -1;
        }
        return scope.AutoLaunchCond;
      })
    }
  }
});

