var controller = angular.module('Wargame3AutomationTool.controller.admin', []);

controller.controller('Wargame3AutomationTool.controller.admin', ['socket', 'socketMain', '$rootScope', '$scope','uiSortableMultiSelectionMethods','$interval','$timeout', '$cookieStore', '$state', '$uibModal',
  function(socket, socketMain, $rootScope, $scope, uiSortableMultiSelectionMethods, $interval, $timeout, $cookieStore, $state, $uibModal){
    $scope.origin = window.location.origin;
    // if($rootScope.AdminLoginResult == 'OK'){
    // } else {
    //   if($cookieStore.get('AdminCode')){
    //     socket.emit('login:admin', {
    //       Code: $cookieStore.get('AdminCode'),
    //     });
    //   } else {
    //     $state.go('login');
    //   }
    // }
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
    $scope.firstView = false;
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
      // if(!$scope.AutoLaunchCond && $scope.ServerSettings.NbMinPlayer){
      //   $scope.AutoLaunchCond = $scope.ServerSettings.NbMinPlayer - $scope.ServerSettings.NbMaxPlayer;  
      // }
      // if($scope.firstView){
      //   $scope.AutoLaunchCond = $scope.ServerSettings.NbMinPlayer - $scope.ServerSettings.NbMaxPlayer
      // }
    })

    // $scope.$watch('ServerSettings.NbMaxPlayer', function(){
    //     if($scope.ServerSettings && $scope.ServerSettings.hasOwnProperty('NbMaxPlayer') && !isNaN($scope.AutoLaunchCond)){
    //         $scope.ServerSettings.NbMinPlayer = $scope.ServerSettings.NbMaxPlayer + $scope.AutoLaunchCond;
    //         $scope.SendServerSetting('NbMinPlayer', $scope.ServerSettings.NbMinPlayer)
    //     }
    // });

    // $scope.$watch('ServerSettings.NbMinPlayer', function(){
    //   if($scope.ServerSettings && $scope.ServerSettings.hasOwnProperty('NbMaxPlayer')) {
    //     $scope.AutoLaunchCond = $scope.ServerSettings.NbMinPlayer - $scope.ServerSettings.NbMaxPlayer;
    //   }
    // });

    // 오류도 있고, 필요없는 코드로 보여서 일단은 숨김
    // $scope.$watch('ServerSettings.VictoryCond', function(){
    //   if($scope.ServerSettings && $scope.ServerSettings.hasOwnProperty('VictoryCond')) {
    //     var VictoryCond = $scope.Wargame3SelectOptions.VictoryCond.find(item=>item.value == $scope.ServerSettings.VictoryCond);
    //     if(!VictoryCond) {
    //       VictoryCond = $scope.Wargame3SelectOptions.VictoryCond.find(item=>item.value == 1);
    //       $scope.ServerSettings.VictoryCond = VictoryCond.mapKey + '_' + val; 
    //     }
    //   }
    // });

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

    $scope.SendServerSetting = function(property, value){
      if(loadFromServer){
        $timeout.cancel(loadFromServer);
      }
      loadFromServer = $timeout(function(){
        socketMain.emit('serverStateChanged');
      },500);
      socketMain.emit('setsvar', {
        property: property,
        value: value
      });
      if(property == 'VictoryCond'){
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
          $scope.SendServerSetting('Map', value2);
        }
      }
    }
    socketMain.emit('serverStateChanged');

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
      socketMain.emit('command', {
        command: _command
      });
    }

    $scope.changeSide = function(player, side){
      socketMain.emit('setpvar', {
        playerid: player.playerid, 
        property: 'PlayerAlliance',
        value: side
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

// controller.directive('autoLaunchCond', function($rootScope) {
//   return {
//     require: 'ngModel',
//     link: function(scope, element, attrs, ngModel) {
//       ngModel.$parsers.push(function(val){
//         scope.AutoLaunchCond = val;
//         return scope.ServerSettings.NbMaxPlayer + val;
//       });
//       ngModel.$formatters.push(function(val){
//         scope.AutoLaunchCond = val-scope.ServerSettings.NbMaxPlayer;
//         if(scope.AutoLaunchCond==1) {
//           scope.SendServerSetting('NbMinPlayer', scope.ServerSettings.NbMaxPlayer + 1)
//           return 1;
//         } else if(scope.AutoLaunchCond ==-1){
//           scope.SendServerSetting('NbMinPlayer', scope.ServerSettings.NbMaxPlayer - 1)
//           return -1;
//         }
//         return scope.AutoLaunchCond;
//       })
//     }
//   }
// });

