var controller = angular.module('Wargame3AutomationTool.controller.SelectTeam', []);

controller.controller('Wargame3AutomationTool.controller.SelectTeam', ['$rootScope', 'socketMain', '$scope', '$state', 'socket', '$timeout', '$cookies', '$stateParams', '$uibModal', '$location',
    function ($rootScope, socketMain, $scope, $state, socket, $timeout, $cookies, $stateParams, $uibModal, $location) {
        // if($stateParams.id) {
        //     socket.emit('login:SelectTeam',{
        //         Code: $stateParams.id
        //     });
        // } else {
        //     $state.go('login');
        // }
        var codeRegExpExec = /\?code=([^#&]*)/.exec($location["$$absUrl"]);
        var code;
        if(codeRegExpExec && codeRegExpExec.length>1){
            code = /\?code=([^#&]*)/.exec($location["$$absUrl"])[1];
        } else {
            code = "";
        }
        var loadFromServer;
        $scope.Team1 = {};
        $scope.Team2 = {};
        $scope.Left = {};
        $scope.err = '';
        $scope.selectedItems = {};
        $scope.UnselectedPlayersListOrderPropertyName = 'playerid';
        $scope.UnselectedPlayersListOrderReverse = false;
        $scope.UnselectedPlayersListSortBy = function(propertyName){
            $scope.UnselectedPlayersListOrderReverse = ($scope.UnselectedPlayersListOrderPropertyName === propertyName) ? !$scope.UnselectedPlayersListOrderReverse : false;
            $scope.UnselectedPlayersListOrderPropertyName = propertyName;
        }

        $scope.openPlayerDetail = function(){
            console.log('opening PlayerDetail pop up');
            if($scope.selectedItems.length == 1){
              var playerid = $scope.selectedItems[0];
              var player = $scope.players[playerid];
              console.log($scope.selectedItems[0]);
              var modalInstance = $uibModal.open({
                templateUrl: '/SelectTeam/partials/playerDetailPopUp.html',
                controller: 'Wargame3AutomationTool.controller.playerDetailPopUp',
                resolve: {
                  player: function(){
                    return player;
                  }
                }
              });
            }
          };
        socketMain.on('serverStateChanged', function(data){
            if(loadFromServer){
              $timeout.cancel(loadFromServer);
            }
            $scope.ServerSettings = data;
            $scope.players = data.players;
            socket.emit('infoChanged');
            socket.emit('getyourTurn', {
                code: code
            });
        });
        socket.on('getyourTurn', (data)=>{
            $scope.yourTurn = data.yourTurn;
        })
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

        $scope.selectPlayer = function(){
            if($scope.selectTeamSettings.yourTurn == $scope.selectTeamSettings.whoisTurn) {
                $scope.err = '';
                socket.emit('selectPlayer',{
                    playerid: $scope.selectedItems
                });
                $scope.selectedItems = [];
            } else if($scope.selectTeamSettings.yourTurn != $scope.selectTeamSettings.whoisTurn){
                $scope.err = '자신의 차례가 아닙니다.'
            } else if($scope.yourTeam == $scope.customModSettings.SelectTeam.whoisSelectTeam) {
                $scope.err = '선택할 수 있는 인원보다 많거나 적은 플레이어를 선택하였습니다.\n선택할 수 있는 인원 : ' + $scope.customModSettings.SelectTeam.HowManySelect + ', 선택한 인원 : ' + $scope.selectedItems.length;    
            }
        };

        socketMain.emit('serverStateChanged');
    }
])