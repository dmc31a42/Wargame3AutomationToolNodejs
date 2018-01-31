'use strict';

var app = angular.module('Wargame3AutomationTool', [
  'ui.sortable',
  'ui.sortable.multiselection',
]);

app.run(['socket','$rootScope','uiSortableMultiSelectionMethods','$interval',
  function(socket, $rootScope, uiSortableMultiSelectionMethods, $interval){
    
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

    $rootScope.Wargame3SelectOptions = {
      ThematicConstraint:[
        {value: -1, name: "No"},
        {value: -2, name: "Any"},
        {value: 0, name: "Motorised"},
        {value: 1, name: "Armored"},
        {value: 2, name: "Support"},
        {value: 3, name: "Marine"},
        {value: 4, name: "Mecanized"},
        {value: 5, name: "Airborne"},
        {value: 6, name: "Naval"}
      ],
      NationConstraint:[
        {value: -1, name: "No"},
        {value: 0, name: "Nations and coalitions"},
        {value: 1, name: "Nations only"},
        {value: 2, name: "Coalitions only"}
      ],
      DateConstraint:[
        {value: -1, name: "No"},
        {value: 0, name: "Post-85"},
        {value: 1, name: "Post-80"},
      ],
      Teams:[
        {value: 2, name: "1 vs 1"},
        {value: 4, name: "2 vs 2"},
        {value: 6, name: "3 vs 3"},
        {value: 8, name: "4 vs 4"},
        {value: 10, name: "5 vs 5"},
        {value: 12, name: "6 vs 6"},
        {value: 14, name: "7 vs 7"},
        {value: 16, name: "8 vs 8"},
        {value: 18, name: "9 vs 9"},
        {value: 20, name: "10 vs 10"},
      ],
      Map:[
        {value: "2x2_port_Wonsan", name: ""},
        {value: "2x2_port_Wonsan_Terrestre", name: ""},
        {value: "2x3_Anbyon", name: ""},
        {value: "2x3_Boseong", name: ""},
        {value: "2x3_Esashi", name: ""},
        {value: "2x3_Gangjin", name: ""},
        {value: "2x3_Hwaseong", name: ""},
        {value: "2x3_Montagne_1", name: ""},
        {value: "2x3_Montagne_2", name: ""},
        {value: "2x3_Tohoku", name: ""},
        {value: "2x3_Tohoku_Alt", name: ""},
        {value: "3x2_Boryeong", name: ""},
        {value: "3x2_Boryeong_Terrestre", name: ""},
        {value: "3x2_Haenam", name: ""},
        {value: "3x2_Haenam_Alt", name: ""},
        {value: "3x2_Montagne_3", name: ""},
        {value: "3x2_Sangju", name: ""},
        {value: "3x2_Taean", name: ""},
        {value: "3x2_Taebuko", name: ""},
        {value: "3x3_Asgard", name: ""},
        {value: "3x3_Chongju", name: ""},
        {value: "3x3_Gangjin", name: ""},
        {value: "3x3_Highway", name: ""},
        {value: "3x3_Highway_Small", name: ""},
        {value: "3x3_Marine_2", name: ""},
        {value: "3x3_Marine_3", name: ""},
        {value: "3x3_Marine_3_Reduite_Terrestre", name: ""},
        {value: "3x3_Marine_3_Terrestre", name: ""},
        {value: "3x3_Montagne_1", name: ""},
        {value: "3x3_Montagne_4", name: ""},
        {value: "3x3_Muju", name: ""},
        {value: "3x3_Muju_Alt", name: ""},
        {value: "3x3_Pyeongtaek", name: ""},
        {value: "3x3_Pyeongtaek_Alt", name: ""},
        {value: "3x3_Thuringer_Wald", name: ""},
        {value: "3x3_Thuringer_Wald_Alt", name: ""},
        {value: "4x3_Gjoll", name: ""},
        {value: "4x3_Sangju_Alt", name: ""},
        {value: "4x4_Marine_10", name: ""},
        {value: "4x4_Marine_4", name: ""},
        {value: "4x4_Marine_5", name: ""},
        {value: "4x4_Marine_6", name: ""},
        {value: "4x4_Marine_7", name: ""},
        {value: "4x4_Marine_9", name: ""},
        {value: "4x4_Russian_Roulette", name: ""},
        {value: "4x4_ThreeMileIsland", name: ""},
        {value: "4x4_ThreeMileIsland_Alt", name: ""},
        {value: "5x3_Asgard_10v10", name: ""},
        {value: "5x3_Gjoll_10v10", name: ""},
        {value: "5x3_Marine_1", name: ""},
        {value: "5x3_Marine_1_Alt", name: ""},
        {value: "5x3_Marine_1_small", name: ""},
        {value: "5x3_Marine_1_small_Terrestre", name: ""},
        {value: "5x3_Marine_1_Terrestre", name: ""}
      ],
      VictoryCond:[
        {value: 1, name: "격멸전", mapKey: "Destruction"},
        {value: 2, name: "경제전", mapKey: "Destruction"},
        {value: 3, name: "정복전", mapKey: "Conquete"}
      ],
      GameType:[
        {value: 0, name: "대립"},
        {value: 1, name: "블루포"},
        {value: 2, name: "레드포"}
      ],
      Private:[
        {value: 0, name: "공개"},
        {value: 1, name: "비공개"}
      ],
      IncomeRate:[
        {value: 0, name: "없음"},
        {value: 1, name: "매우 낮음"},
        {value: 2, name: "낮음"},
        {value: 3, name: "보통"},
        {value: 4, name: "높음"},
        {value: 5, name: "매우 높음"}
      ],
      AutoLaunchCond:[
        {value: 0, name: "자동(풀방)"},
        {value: 1, name: "수동"},
        {value: 2, name: "최대인원-1"},
      ]
      };

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

app.directive('convertSecToMin', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(val) {
        return val/60;
      });
      ngModel.$formatters.push(function(val) {
        return val*60;
      });
    }
  };
});