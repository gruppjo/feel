'use strict';
angular.module('main')
.controller('SlidesCtrl', function ($scope, $log, $ionicSlideBoxDelegate, $timeout, $window) {

  // debug
  this.debug = {
    on: false,
    slide: 21
  };

  // settings
  this.settings = {
    showFooter: false,
    nextDisabled: false,
    barColor: 'bar-calm'
  };

  // answers
  this.answers = {};

  this.d3BarsData =  [
    {name: 'Greg', score: 98},
    {name: 'Ari', score: 96},
    {name: 'Q', score: 75},
    {name: 'Loser', score: 48}
  ];

  this.lgbtData = [
    { label: 'Yes', count: 3.4 },
    { label: 'Somewhat', count: 14 },
    { label: 'No', count: 82.6 }
  ];
  this.lgbtColors = [
    '#43cee6',
    '#4a87ee',
    '#444'
  ];

  this.marriageData = [
    { label: 'Legal', count: 1033815115.00 },
    { label: 'Illegal', count: 6166184885.00 },
  ];
  this.marriageColors = [
    '#FF69B4',
    '#444'
  ];

  this.illegalData = [
    { label: 'Illegal', count: 2892256167 },
    { label: 'Not protected', count: 2691921432.00 },
    { label: 'Protected', count: 1615822401.00 },
  ];
  this.illegalColors = [
    '#8a6de9',
    '#444',
    '#f3f3f3'
  ];

  // disable sliding
  $timeout(function () {
    $ionicSlideBoxDelegate.enableSlide(0);
    if (this.debug.on) {
      $ionicSlideBoxDelegate.slide(this.debug.slide, 0);
    }
  }.bind(this), 500);

  this.restart = function () {
    $window.location.reload();
  };

  this.next = function () {
    $ionicSlideBoxDelegate.next();
  };

  this.prev = function () {
    if ($ionicSlideBoxDelegate.currentIndex() !== 8) {
      $ionicSlideBoxDelegate.previous();
    }
    else {
      $ionicSlideBoxDelegate.slide(0, 200);
    }
  };

  this.start = function () {
    var currentIndex = $ionicSlideBoxDelegate.currentIndex();

    // animate the first couple of screens
    if (currentIndex === 0) {

      // disable next
      this.settings.nextDisabled = true;

      // traverse
      this.next();
      $timeout(this.next, 750)
      .then(function () {
        return $timeout(this.next, 750);
      }.bind(this))
      .then(function () {
        return $timeout(this.next, 750);
      }.bind(this))
      .then(function () {
        return $timeout(this.next, 750);
      }.bind(this))
      .then(function () {
        return $timeout(this.next, 750);
      }.bind(this))
      .then(function () {
        return $timeout(this.next, 750);
      }.bind(this))
      .then(function () {
        return $timeout(this.next, 750);
      }.bind(this))
      .then(function () {
        // enable next
        this.settings.nextDisabled = false;
      }.bind(this));
    }
  };

  this.slideHasChanged = function (index) {
    var watcher;
    // go back
    if (index < 8) {
      this.settings.showFooter = false;
    }
    // let's start
    else if (index >= 8) {
      this.settings.showFooter = true;
    }
    // guess lgbt, go back
    if (index === 10) {
      this.settings.nextDisabled = false;
    }
    // guess lgbt
    else if (index === 11) {
      this.settings.nextDisabled = true;
      watcher = $scope.$watch(
        angular.bind(this, function () {
          return this.answers.lgbt;
        }),
        function (value) {
        if (value) {
          watcher();
          this.settings.nextDisabled = false;
        }
      }.bind(this));
    }
    // guess marriage, go back
    if (index === 12) {
      this.settings.nextDisabled = false;
    }
    // guess marriage
    else if (index === 13) {
      this.settings.nextDisabled = true;
      watcher = $scope.$watch(
        angular.bind(this, function () {
          return this.answers.marriage;
        }),
        function (value) {
        if (value) {
          watcher();
          this.settings.nextDisabled = false;
        }
      }.bind(this));
    }
    // guess illegal, go back
    if (index === 15) {
      this.settings.nextDisabled = false;
    }
    // guess illegal
    else if (index === 16) {
      this.settings.nextDisabled = true;
      watcher = $scope.$watch(
        angular.bind(this, function () {
          return this.answers.illegal;
        }),
        function (value) {
        if (value) {
          watcher();
          this.settings.nextDisabled = false;
        }
      }.bind(this));
    }

    // finished, go back
    if (index === 20) {
      this.settings.nextDisabled = false;
    }
    // finished illegal
    else if (index === 21) {
      this.settings.nextDisabled = true;
    }
  };

});
