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

                .state('login', {
                    url :'/login',
                    views :  {
                        '': {
                            templateUrl: 'partials/login.html',
                            controller: 'Wargame3AutomationTool.controller.login',
                        },
                    },
                })

                .state('admin', {
                    url :'/admin',
                    views :  {
                        '': {
                            controller: 'Wargame3AutomationTool.controller.admin',
                            templateUrl: 'partials/admin.html',
                        },
                    },
                })

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