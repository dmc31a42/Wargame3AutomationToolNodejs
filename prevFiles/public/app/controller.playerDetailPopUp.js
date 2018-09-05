var controller = angular.module('Wargame3AutomationTool.controller.playerDetailPopUp', ['ui.bootstrap']);

controller.controller('Wargame3AutomationTool.controller.playerDetailPopUp', ['$scope', '$uibModalInstance', 'player',
  function($scope, $uibModalInstance, player){
    $scope.player = player;
    console.log($scope.player);
    $scope.close = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.nb_air_bought = $scope.player['u24']['@nb_air_bought'] ? parseInt($scope.player['u24']['@nb_air_bought']) : 0;
    $scope.nb_hel_bought = $scope.player['u24']['@nb_hel_bought'] ? parseInt($scope.player['u24']['@nb_hel_bought']) : 0;
    $scope.nb_inf_bought = $scope.player['u24']['@nb_inf_bought'] ? parseInt($scope.player['u24']['@nb_inf_bought']) : 0;
    $scope.nb_log_bought = $scope.player['u24']['@nb_log_bought'] ? parseInt($scope.player['u24']['@nb_log_bought']) : 0;
    $scope.nb_naval_bought = $scope.player['u24']['@nb_naval_bought'] ? parseInt($scope.player['u24']['@nb_naval_bought']) : 0;
    $scope.nb_reco_bought = $scope.player['u24']['@nb_reco_bought'] ? parseInt($scope.player['u24']['@nb_reco_bought']) : 0;
    $scope.nb_sup_bought = $scope.player['u24']['@nb_sup_bought'] ? parseInt($scope.player['u24']['@nb_sup_bought']) : 0;
    $scope.nb_tank_bought = $scope.player['u24']['@nb_tank_bought'] ? parseInt($scope.player['u24']['@nb_tank_bought']) : 0;
    $scope.nb_veh_bought = $scope.player['u24']['@nb_veh_bought'] ? parseInt($scope.player['u24']['@nb_veh_bought']) : 0;
    $scope.nb_bought_total = 
      $scope.nb_air_bought +
      $scope.nb_hel_bought + 
      $scope.nb_inf_bought + 
      $scope.nb_log_bought + 
      $scope.nb_naval_bought + 
      $scope.nb_reco_bought +
      $scope.nb_sup_bought + 
      $scope.nb_tank_bought +
      $scope.nb_veh_bought;
    
      $scope.gametype_conquest = $scope.player['u24']['@gametype_conquest'] ? parseInt($scope.player['u24']['@gametype_conquest']) : 0;
      $scope.gametype_dest = $scope.player['u24']['@gametype_dest'] ? parseInt($scope.player['u24']['@gametype_dest']) : 0;
      $scope.gametype_economy = $scope.player['u24']['@gametype_economy'] ? parseInt($scope.player['u24']['@gametype_economy']) : 0;
      $scope.gametype_total = 
        $scope.gametype_conquest +
        $scope.gametype_dest +
        $scope.gametype_economy;

      $scope.ranked_win = $scope.player['u24']['ranked_win'] ? parseInt($scope.player['u24']['ranked_win']) : 0;
      $scope.ranked_loss = $scope.player['u24']['ranked_loss'] ? parseInt($scope.player['u24']['ranked_loss']) : 0;
      $scope.ranked_nato = $scope.player['u24']['ranked_nato'] ? parseInt($scope.player['u24']['ranked_nato']) : 0;
      $scope.ranked_pact = $scope.player['u24']['ranked_pact'] ? parseInt($scope.player['u24']['ranked_pact']) : 0;
      $scope.ranked_total = $scope.ranked_nato + $scope.ranked_pact;
      $scope.ranked_foul = $scope.ranked_total - $scope.ranked_loss - $scope.ranked_win;

    $scope.sum = function(items){
      var sum = 0;
      items.forEach(element => {
        var value = parseInt(element);
        sum += value? value : 0;
      });
      return sum;
    }

    $scope.ratio = function(winS, lossS, foulS){
      var win = winS ? parseInt(winS) : 0;
      var loss = lossS ? parseInt(lossS) : 0;
      var foul = foulS ? parseInt(foulS) : 0;
      return (win+loss+foul) == 0 ? 0 : win/(win+loss+foul)*100;
    }

    $scope.ratioTotalWin = function(totalS, winS){
      var total = totalS ? parseInt(totalS) : 0;
      var win = winS ? parseInt(winS) : 0;
      return total == 0 ? 0 : win/total*100;
    }
  }]
);