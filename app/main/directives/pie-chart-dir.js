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
