'use strict';

var app = angular.module('Wargame3AutomationTool', [
  'ui.router',
  'ui.sortable',
  'ui.sortable.multiselection',
  'ngCookies',
  'ui.bootstrap',
  
  'Wargame3AutomationTool.router',
  'Wargame3AutomationTool.controller'
]);

app.run(['socket', 'socketMain', '$rootScope','uiSortableMultiSelectionMethods','$interval','$timeout','$state', '$cookieStore',
  function(socket, socketMain, $rootScope, uiSortableMultiSelectionMethods, $interval, $timeout, $state, $cookieStore){
    
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
      {value: 6, name: "Naval"}],
    NationConstraint:[
      {value: -1, name: "No"},
      {value: 0, name: "Nations and coalitions"},
      {value: 1, name: "Nations only"},
      {value: 2, name: "Coalitions only"}],
    DateConstraint:[
      {value: -1, name: "No"},
      {value: 0, name: "Post-85"},
      {value: 1, name: "Post-80"}],
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
      {value: 20, name: "10 vs 10"}],
    Map:[
      {value: "2x2_port_Wonsan", name: "[1vs1] 원산항(육/해)"},
      {value: "2x2_port_Wonsan_Terrestre", name: "[1vs1] 원산항"},
      {value: "2x3_Anbyon", name: "[2vs2] 흥분과 영광"},
      {value: "2x3_Boseong", name: "[2vs2] 임박한 지옥의 묵시룩"},
      {value: "2x3_Esashi", name: "[1vs1] 트로픽 썬더"},
      {value: "2x3_Gangjin", name: "[1vs1] 진흙탕 싸움!"},
      {value: "2x3_Hwaseong", name: "[1vs1] 다가오는 핵겨울"},
      {value: "2x3_Montagne_1", name: "[1vs1] 사선"},
      {value: "2x3_Montagne_2", name: "[3vs3] 클리프행어"},
      {value: "2x3_Tohoku", name: "[2vs2] 논밭"},
      {value: "2x3_Tohoku_Alt", name: "[1vs1] 논밭"},
      {value: "3x2_Boryeong", name: "[3vs3] 포함 외교(육/해)"},
      {value: "3x2_Boryeong_Terrestre", name: "[2vs2] 포함 외교"},
      {value: "3x2_Haenam", name: "[3vs3] 인천 수복"},
      {value: "3x2_Haenam_Alt", name: "[2vs2] 크로마이트 작전"},
      {value: "3x2_Montagne_3", name: "[2vs2] 장진호"},
      {value: "3x2_Sangju", name: "[3vs3] 힘겨운 정글"},
      {value: "3x2_Taean", name: "[3vs3] 피의 능선"},
      {value: "3x2_Taebuko", name: "[2vs2] 정글의 LAW"},
      {value: "3x3_Asgard", name: "[4vs4] 바위왕관"},
      {value: "3x3_Chongju", name: "[4vs4] 한국 산악지대"},
      {value: "3x3_Gangjin", name: "[4vs4] 홍수"},
      {value: "3x3_Highway", name: "[3vs3] 1번 국도"},
      {value: "3x3_Highway_Small", name: "[2vs2] 1번 국도"},
      {value: "3x3_Marine_2", name: "[4vs4] 스모크 인 더 워터(육/해)"},
      {value: "3x3_Marine_3", name: "[3vs3] 천국에서의 또 다른 공격개시일"},
      {value: "3x3_Marine_3_Reduite_Terrestre", name: "[1vs1] Hell in a Very Small Place"},
      {value: "3x3_Marine_3_Terrestre", name: "[2vs2] 천국에서의 또 다른 공격개시일"},
      {value: "3x3_Montagne_1", name: "[4vs4] 냉전 Z"},
      {value: "3x3_Montagne_4", name: "[4vs4] 메이즈 인 재팬"},
      {value: "3x3_Muju", name: "[1vs1] 프룬징 계곡"},
      {value: "3x3_Muju_Alt", name: "[1vs1] Punchbowl"},
      {value: "3x3_Pyeongtaek", name: "[4vs4] 38선"},
      {value: "3x3_Pyeongtaek_Alt", name: "[3vs3] 38선(세로)"},
      {value: "3x3_Thuringer_Wald", name: "[3vs3] 뱀구덩이"},
      {value: "3x3_Thuringer_Wald_Alt", name: "[3vs3] 교차로"},
      {value: "4x3_Gjoll", name: "[4vs4] 단장의 능선"},
      {value: "4x3_Sangju_Alt", name: "[4vs4] 유예"},
      {value: "4x4_Marine_10", name: "[2vs2] 알레아 야크타 웨스트(해)"},
      {value: "4x4_Marine_4", name: "[3vs3] 환초 접근"},
      {value: "4x4_Marine_5", name: "[3vs3] 워터월드"},
      {value: "4x4_Marine_6", name: "[1vs1] 청천벽력"},
      {value: "4x4_Marine_7", name: "[1vs1] 바렌츠해에서의 고립"},
      {value: "4x4_Marine_9", name: "[2vs2] 불독과 뱀파이어"},
      {value: "4x4_Russian_Roulette", name: "[10vs10] Russian Roulette"},
      {value: "4x4_ThreeMileIsland", name: "[4vs4] 주체의 태양"},
      {value: "4x4_ThreeMileIsland_Alt", name: "[4vs4] 파이널 멜트다운"},
      {value: "5x3_Asgard_10v10", name: "[10vs10] 아스가르드"},
      {value: "5x3_Gjoll_10v10", name: "[10vs10] 굩"},
      {value: "5x3_Marine_1", name: "[4vs4] 해협만 간단히(육/해)"},
      {value: "5x3_Marine_1_Alt", name: "[4vs4] 외나무다리"},
      {value: "5x3_Marine_1_small", name: "[2vs2] 해협만 간단히(소형)(육/해)"},
      {value: "5x3_Marine_1_small_Terrestre", name: "[1vs1] 해협만 간단히(소형)"},
      {value: "5x3_Marine_1_Terrestre", name: "[3vs3] 해협만 간단히"}],
    VictoryCond:[
      {value: 1, name: "격멸전", mapKey: "Destruction"},
      {value: 3, name: "경제전", mapKey: "Destruction"},
      {value: 4, name: "정복전", mapKey: "Conquete"}],
    GameType:[
      {value: 0, name: "대립"},
      {value: 1, name: "블루포"},
      {value: 2, name: "레드포"}],
    Private:[
      {value: 0, name: "공개"},
      {value: 1, name: "비공개"}],
    IncomeRate:[
      {value: 0, name: "없음"},
      {value: 1, name: "매우 낮음"},
      {value: 2, name: "낮음"},
      {value: 3, name: "보통"},
      {value: 4, name: "높음"},
      {value: 5, name: "매우 높음"}],
    AutoLaunchCond:[
      {value: 0, name: "자동(풀방)"},
      {value: 1, name: "수동"},
      {value: -1, name: "최대인원-1"}]
  };

  $rootScope.customModOptions = {
    SelecTeam:[]
  };
  $state.go('admin');
  // if($cookieStore.get('AdminCode')){
  //   $rootScope.AdminCode = $cookieStore.get('AdminCode');
  // } else {
  //   $rootScope.AdminCode = '';
  // }
  // $rootScope.SelectTeamCode = "";
        
  // socket.on('login:admin', function(data){
  //   $rootScope.AdminLoginResult = data.result;
  //   if(data.result == 'OK'){
  //       $cookieStore.put('AdminCode',$rootScope.AdminCode);
  //       $state.go('admin');
  //   } else {
  //       $state.go('login');   
  //   }
  // });

  // socket.on('login:SelectTeam', function(data){
  //   $rootScope.SelectTeamLoginResult = data.result;
  //   if(data.result == "OK"){
  //       $state.go('SelectTeam');
  //   } else {
  //       $state.go('login');
  //   }
  // });
}]);


app.factory('socket', function ($rootScope) {
  var socket = io.connect('/admin:default');
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

app.factory('socketMain', function ($rootScope) {
  var socket = io.connect('/admin');
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
        return val*60;
      });
      ngModel.$formatters.push(function(val) {
        return val/60;
      });
    }
  };
});

app.filter('WargameSide', function() {
  return function(x, scope) {
    if(scope.ServerSettings.GameType == 0){
      if(x == 0){
        return 'Blufor';
      } else {
        return 'Redfor';
      }
    } else {
      if(x == 0){
        return '1팀';
      }else {
        return '2팀';
      }
    }
  };
});

app.filter('minLength', function(){
  return function(input, len, pad){
    input = input.toString(); 
    if(input.length >= len) return input;
    else{
      pad = (pad || 0).toString(); 
      return new Array(1 + len - input.length).join(pad) + input;
    }
  };
});
/*app.directive('autoLaunchCondSetter', function($rootScope) {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel){
      ngModel.$parsers.push(function(val){
        $rootScope.ServerSettings.NbMinPlayer = val + 
        return 
      })
    }
  }
})*/

app.filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
});

app.filter('ifEmpty', function() {
  return function(input, defaultValue) {
      if (angular.isUndefined(input) || input === null || input === '') {
          return defaultValue;
      }

      return input;
  }
});

app.filter('customTime', function(){
  return function(input){
    if(!input || input === '') return;
    var time = parseInt(input);
    var seconds = time%60;
    var minutes = (time-seconds)/60%60;
    var hours = (time-seconds-minutes*60)/3600;
    return hours + '시간 ' + minutes + '분';
  }
})

app.filter('EugenDateToNumber', function(){
  return function(input){
    if(!input || input === '') return;
    return Math.floor(parseFloat(input)*1000);
  }
})

app.filter('parseInt', function(){
  return function(input){
    if(!input || input === '') return;
    return parseInt(input);
  }
})
