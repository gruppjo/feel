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
    if (aspectRation > 2 / 2.5 && !alertPopup) {
      alertPopup = $ionicPopup.alert({
        title: 'Careful',
        template: 'Optimized for mobile in portrait mode. Switch to portrait mode on your device or resize your desktop browser to be much higher than wide! '
      });
      alertPopup.then(function () {
        alertPopup = undefined;
        if (promise) {
          $timeout.cancel(promise);
        }
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

/* globals d3 */
'use strict';
angular.module('main')
.directive('pieChart', function ($window) {
  return {
    restrict: 'E',
    scope: {
      data: '=',
      colors: '='
    },
    link: function postLink (scope, element) {
      // create svg with 100% width
      var svg = d3.select(element[0])
        .append('svg')
        .style('width', '100%')
        .style('height', '100%');

      // when resizing render again
      scope.$watch(function () {
        return angular.element($window)[0].innerWidth;
      }, function () {
        scope.render();
      });

      // when data is changing, render again
      scope.$watch('data', function () {
        scope.render();
      }, true);

      scope.render = function () {
        // remove all previously rendered elements
        svg.selectAll('*').remove();

        var width = d3.select(element[0])[0][0].offsetWidth;
        var height = d3.select(element.parent().parent())[0][0][0].offsetHeight;
        width = height = Math.min(width, height);
        var radius = width / 2;
        var color = d3.scale.ordinal()
          .range(scope.colors);

        // now that we know the width assign all other attributes
        svg
          .attr('height', height)
          .attr('width', width);

        // create arcGroup
        var arcGroup = svg
          // append a g
          .append('g')
          // center g in svg
          .attr('transform', 'translate(' + radius + ',' + radius + ')');

        // create arc method
        var arc = d3.svg.arc()
          .outerRadius(radius)
          .innerRadius(70);

        // create pie function
        var pie = d3.layout.pie()
          .value(function (dataItem) { return dataItem.count; } )
          .sort(null);

        // draw paths
        arcGroup.selectAll('path')
          .data(pie(scope.data)) // loop through data
          .enter() // create placeholder paths for each dataItem
          .append('path')
          .attr('d', arc)
          .attr('fill', function (d) {
            return color(d.data.label);
          });

        // ADDING LEGEND
        var legendRectSize = 18;
        var legendSpacing = 4;

        var legend = arcGroup.selectAll('.legend')
          .data(color.domain())
          .enter()
          .append('g')
          .attr('class', 'legend')
          .attr('transform', function (d, i) {
            var height = legendRectSize + legendSpacing;
            var offset =  height * color.domain().length / 2;
            var horz = -2 * legendRectSize;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + vert + ')';
          });

        legend.append('rect')
          .attr('width', legendRectSize)
          .attr('height', legendRectSize)
          .style('fill', color)
          .style('stroke', color);

        legend.append('text')
          .attr('x', legendRectSize + legendSpacing)
          .attr('y', legendRectSize - legendSpacing)
          .text(function (d) { return d; });

      };
    }
  };
});

/* globals d3 */
'use strict';
angular.module('main')
.directive('d3Bars', function ($window, $timeout) {
  return {
    restrict: 'AE',
    scope: {
      data: '=',
      label: '@',
      onClick: '&'
    },
    link: function (scope, ele, attrs) {

      var renderTimeout;
      var margin = parseInt(attrs.margin) || 20,
          barHeight = parseInt(attrs.barHeight) || 20,
          barPadding = parseInt(attrs.barPadding) || 5;

      // create svg
      var svg = d3.select(ele[0])
        .append('svg')
        .style('width', '100%');

      $window.onresize = function () {
        scope.$apply();
      };

      // when resizing render again
      scope.$watch(function () {
        return angular.element($window)[0].innerWidth;
      }, function () {
        scope.render(scope.data);
      });

      // when data is changing, render again
      scope.$watch('data', function (newData) {
        scope.render(newData);
      }, true);

      scope.render = function (data) {
        // remove all previously rendered elements
        svg.selectAll('*').remove();

        // don't do anything if there's no data
        if (!data) {
          return;
        }
        if (renderTimeout) {
          clearTimeout(renderTimeout);
        }

        renderTimeout = $timeout(function () {
          // set up variables, width, height, color, xScale
          var width = d3.select(ele[0]).node().offsetWidth - margin,
              height = scope.data.length * (barHeight + barPadding),
              color = d3.scale.category20(),
              xScale = d3.scale.linear()
                .domain([0, d3.max(data, function (d) {
                  return d.score;
                })])
                .range([0, width]);

          svg.attr('height', height);

          // create the rectangles for the bar chart
          svg.selectAll('rect')
            .data(data)
            .enter()
              .append('rect')
              .on('click', function (d) {
                return scope.onClick({item: d});
              })
              .attr('height', barHeight)
              .attr('width', 140)
              .attr('x', Math.round(margin / 2))
              .attr('y', function (d, i) {
                return i * (barHeight + barPadding);
              })
              .attr('fill', function (d) {
                return color(d.score);
              })
              .transition()
                .duration(1000)
                .attr('width', function (d) {
                  return xScale(d.score);
                });
          svg.selectAll('text')
            .data(data)
            .enter()
              .append('text')
              .attr('fill', '#fff')
              .attr('y', function (d, i) {
                return i * (barHeight + barPadding) + 15;
              })
              .attr('x', 15)
              .text(function (d) {
                return d.name + ' (scored: ' + d.score + ')';
              });
        }, 200);
      };
    }
  };
});

'use strict';
angular.module('main')
.controller('SlidesCtrl', function ($scope, $log, $ionicSlideBoxDelegate, $timeout, $window) {

  // debug
  this.debug = {
    on: false,
    slide: 17
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


'use strict';
angular.module('feel', [
  // load your modules here
  'main', // starting with the main module
]);
