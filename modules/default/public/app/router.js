var router = angular.module('Wargame3AutomationTool.router', []);

router
    .config(['$urlRouterProvider',
        function($urlRouterProvider) {
            $urlRouterProvider.otherwise("/admin");
        }]);

router
    .config(['$stateProvider',
        function($stateProvider) {
            $stateProvider
                .state('admin', {
                    url :'/admin',
                    views :  {
                        '': {
                            controller: 'Wargame3AutomationTool.controller.admin',
                            templateUrl: 'partials/admin.html',
                        },
                    },
                })
    }]);