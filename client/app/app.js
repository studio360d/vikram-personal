'use strict';

var app = angular.module('redBricksApp', [
  'ngResource',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap',
  'ngCookies',
  'toaster'
]);
  app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider
      .otherwise('/');

$stateProvider

  .state('#', {
    url: '/',
    templateUrl: 'app/homepage/home.html',
    controller: 'HomePageCtrl'
    })

   .state('home', {
      url: '/home',
      templateUrl: 'app/homepage/home.html',
      controller: 'HomePageCtrl'
    })

  }])


