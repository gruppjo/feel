'use strict';
angular.module('main', [
  'ionic',
  'ngCordova',
  'ui.router',
  // TODO: load other modules selected during generation
])
.config(function ($stateProvider, $urlRouterProvider) {

  // ROUTING with ui.router
  $urlRouterProvider.otherwise('/main');
  $stateProvider
    // this state is placed in the <ion-nav-view> in the index.html
    .state('main', {
      url: '/main',
      templateUrl: 'main/templates/slides.html',
      controller: 'SlidesCtrl as ctrl'
    })
    .state('info', {
      url: '/info',
      templateUrl: 'main/templates/info.html',
    });
})
.run(function ($window, $timeout, $ionicPopup) {

  var promise, alertPopup;

  var checkSize = function () {
    /* global document */
    var $container = document.getElementById('main-container');
    var aspectRation = $container.offsetWidth / $container.offsetHeight;
    if (aspectRation > 2 / 2.8 && !alertPopup) {
      alertPopup = $ionicPopup.alert({
        title: 'Careful',
        template: 'Optimized for mobile in portrait mode. Switch to portrait mode on your device or resize your desktop browser to be much higher than wide! '
      });
      alertPopup.then(function () {
        alertPopup = undefined;
        if (promise) {
          $timeout.cancel(promise);
        }
        promise = $timeout(function () {
          checkSize();
        }, 1000);
      });
    }
  };

  $window.addEventListener('resize', (function () {
    return function () {
      if (promise) {
        $timeout.cancel(promise);
      }
      promise = $timeout(function () {
        checkSize();
      }, 500);
    };
  })(), false);
  $window.onload = checkSize;
});
