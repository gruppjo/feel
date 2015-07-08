'use strict';
angular.module('main')
.controller('SlidesCtrl', function ($log, $ionicSlideBoxDelegate) {

  this.next = function () {
    $ionicSlideBoxDelegate.next();
  };

  this.previous = function () {
    $ionicSlideBoxDelegate.previous();
  };

  this.keyUp = function ($event) {
    $log.log($event);
    if ($event.keyCode === 38) {
      this.next();
    }
  };

  this.slidestop = function () {
    $ionicSlideBoxDelegate.enableSlide(false);
  };

  $log.log($ionicSlideBoxDelegate.stop());

  this.toggle = (function () {
    var is = true;
    return function () {
      is = !is;
      $ionicSlideBoxDelegate.enableSlide(is);
    };
  })();

});
