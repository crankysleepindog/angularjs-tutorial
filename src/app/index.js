'use strict';

angular.module('angularjsTutorial', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngResource', 'ui.router', 'firebase', 'ui.grid', 'ui.grid.edit', 'ui.grid.cellNav'])
  .constant('firebaseUrl', 'https://ak-angularjstutorial.firebaseio.com/')

  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl as mainCtrl',
        resolve : {
          'user' : ['AuthService', function(AuthService){
            return AuthService.requireUser();
          }]
        }
      })

      .state('admin', {
        url: '/admin',
        templateUrl: 'app/admin/admin.html',
        controller: 'AdminCtrl as adminCtrl',
        resolve : {
          'user' : ['AuthService', 'UserService', '$q', function(AuthService, UserService, $q){
            var deferred = $q.defer();

            AuthService.requireUser()
            .then(function(authData){
              return UserService.getById(authData.uid);
            })
            .then(function(user){
              if (user.roles.admin){
                deferred.resolve();
              } else {
                deferred.reject('ADMIN_REQUIRED');
              }
            })
            .catch(function(err){
              deferred.reject(err);
            });

            return deferred.promise;
          }]
        }
      })

      .state('admin.users', {
        url: '/users',
        templateUrl: 'app/admin/users/users.html',
        controller: 'AdminUsersCtrl as adminUsersCtrl'
      })

      .state('login', {
        url: '/login?redirect',
        templateUrl: 'app/login/login.html',
        controller: 'LoginCtrl as loginCtrl'
      })

      .state('contact', {
        url: '/contact',
        templateUrl: 'app/contact/contact.html',
        controller: 'ContactCtrl as contactCtrl'
      })

      .state('graphs', {
        url: '/graphs',
        templateUrl: 'app/graphs/graphs.html',
        controller: 'GraphsCtrl as graphsCtrl'
      });

    $urlRouterProvider.otherwise('/');
  })

  .run(['$rootScope', '$log', '$state',
    function($rootScope, $log, $state) {
      $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
        $log.log('$stateChangeError', event, toState, toParams, fromState, fromParams, error);

        if (error === 'AUTH_REQUIRED') {
          $log.log('$stateChangeError, redirecting to login', toState.name);
          $state.go('login', { redirect : toState.name });
        }
      });
    }
  ])


  .controller('GlobalCtrl', ['AuthService', 'UserService', '$log', '$state', function(AuthService, UserService, $log, $state){
    var self = this;

    AuthService.onAuth(function(authData){
      $log.log('AuthService.onAuth', authData);
      self.user = authData;

      if (!authData){ return;}

      UserService.getById(authData.uid).then(function(user){
        self.userData = user;
        $log.log('UserService.getById user retrieved', self.userData);
      });

    });

    $log.log('User is ', this.user);

    self.logout = function(){
      AuthService.logout().then(function(){
        $log.log('GlobalCtrl AuthService.logout');
        $state.go('home');
      });
    };

    self.globalObject = {
      message : 'Global'
    };
  }])
;
