var dashboard = angular.module('dashboard',[]);

dashboard
	.controller('DashboardCtrl', function($scope, $http){

		$scope.slides = [];

		function flatAndComputeIndexes(_slides){

			var flattenSlides = [];

			angular.forEach(_slides, function(iter, idx){

				if(!angular.isArray(iter)){
					if(iter.votable){
						iter.idh = idx;
						iter.idv = 0;
						flattenSlides.push(iter);
					}
				} else {
					angular.forEach(iter, function(iter2, idx2){
						if(iter2.votable){
							iter2.idh = idx;
							iter2.idv = idx2;
							flattenSlides.push(iter2);
						}
					});
				}

			});

			return flattenSlides;

		}

		$scope.loadSlidesConfig = function(){
			$http
				.get('../slides/list.json')
				.then(function(response){
					$scope.slides = flatAndComputeIndexes(response.data);
				});
		};

		$scope.loadSlidesConfig();

	})
	.directive('slideWidget', function($http, $interval){

		return {
			restrict: 'E',
			scope: {
      			slide: '=slideConfig'
			},
			templateUrl: '../public/templates/dashboard/slide-widget.html',
			
			link: function(scope, element, attrs){

				var widget = element.find('.slide-widget');
				
				var svgEl = element.find('.pie');

				var pieLayout = d3.layout.pie()
							.value(function(d) { return d.count; });

				var arc = d3.svg.arc()
  							.innerRadius(0)
  							.outerRadius(75);

  				var svg = d3.select($(svgEl)[0]);

				var g = svg.append('g').attr('transform', 'translate(75, 75)');

				function refreshWidget(){

					var slideStatUrl = '/api/vote/'+ scope.slide.idh + '/' + scope.slide.idv + '/stats';

					$http
						.get(slideStatUrl)
						.then(function(response){

							var slideStats = response.data.stats;

							if(!slideStats.yes && !slideStats.no){
								return;
							} else {
								widget.show();
							}
							
							var d = [
								{"label": "yes", "count": slideStats.yes},
								{"label": "no", "count": slideStats.no}
							];

							var slices = pieLayout(d);

							g.selectAll('path.slice')
							  .data(slices)
							    .enter()
							      .append('path')
							        .attr('class', 'slice')
							        .attr('d', arc)
							        .attr('fill', function(d) {
							          	return (d.data.label === "yes") ? "#5cb85c" : "#c9302c";
							        });

							g.selectAll('path.slice')
								.data(slices).transition()
									.attr('d', arc);

						});

				}

				// polling slide stats every 5s
				$interval(refreshWidget, 5000);

				// immediately refresh widget
				refreshWidget();

			}
			
		};

	});

