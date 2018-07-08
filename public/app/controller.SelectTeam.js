var controller = angular.module('Wargame3AutomationTool.controller.SelectTeam', []);

controller.controller('Wargame3AutomationTool.controller.SelectTeam', ['$rootScope', '$scope', '$state', 'socket', '$timeout', '$cookies', '$stateParams', 
    function ($rootScope, $scope, $state, socket, $timeout, $cookies, $stateParams) {
        if($stateParams.id) {
            socket.emit('login:SelectTeam',{
                Code: $stateParams.id
            });
        } else {
            $state.go('login');
        }

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
        
        socket.on('SelectTeam:yourTeam',function(data){
            $scope.yourTeam = data.yourTeam;
        })
        socket.on('SelectTeam', function(data){
            $scope.customModSettings = data.customModSettings;
            $scope.players = data.players;
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
            if($scope.yourTeam == $scope.customModSettings.SelectTeam.whoisSelectTeam && $scope.selectedItems.length == $scope.customModSettings.SelectTeam.HowManySelect) {
                $scope.err = '';
                socket.emit('SelectTeam:SelectPlayer',{
                    playerid: $scope.selectedItems
                });
                $scope.selectedItems = [];
            } else if($scope.selectedItems.length == $scope.customModSettings.SelectTeam.HowManySelect){
                $scope.err = '자신의 차례가 아닙니다.'
            } else if($scope.yourTeam == $scope.customModSettings.SelectTeam.whoisSelectTeam) {
                $scope.err = '선택할 수 있는 인원보다 많거나 적은 플레이어를 선택하였습니다.\n선택할 수 있는 인원 : ' + $scope.customModSettings.SelectTeam.HowManySelect + ', 선택한 인원 : ' + $scope.selectedItems.length;    
            }
        };

        socket.emit('SelectTeam:requestServerSetting');
    }
])