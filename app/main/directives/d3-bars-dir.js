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
