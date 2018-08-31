var router = angular.module('Wargame3AutomationTool.router', []);
router
    .config(['$urlRouterProvider',
        function($urlRouterProvider) {
            $urlRouterProvider.otherwise("/");
        }]);
router
    .config(['$stateProvider',
        function($stateProvider) {

            $stateProvider
                .state('SelectTeam', {
                    url :'/',
                    views :  {
                        '': {
                            controller: 'Wargame3AutomationTool.controller.SelectTeam',
                            templateUrl: '/SelectTeam/partials/SelectTeam.html',
                        },
                    },
                })

    }]);