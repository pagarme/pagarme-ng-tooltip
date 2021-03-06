/*
	
	Created by Rafael Violato @ pagar.me
	rfviolato@gmail.com

*/

'use strict';

(function(){

	angular.module('pg-ng-tooltip', [])
	.directive('pgNgTooltip', tooltipCore)
	.directive('tooltipTrigger', tooltipTrigger);

	tooltipCore.$inject = ['$document', '$timeout'];

	function tooltipCore($document, $timeout){

		var directive = {

			scope:{
			
				showingClass: '@',
				textNode: '@',

			},

			restrict: 'AEC',
			link: postLink,
		};

		return directive;

		function postLink($scope, $element, attrs, ctrl){

			var showing = false;
			var showingClass = 'showing';
			var textNode = $element;
			var timeout;

			if($scope.showingClass){

				showingClass = $scope.showingClass;

			}

			if($scope.textNode){

				$timeout(function(){

					textNode = angular.element($element[0].querySelector($scope.textNode));

				});

			}

			var $show = $scope.$on('pg-tooltip-show', show);
			var $hide = $scope.$on('pg-tooltip-hide', hide);
			$scope.$on('$destroy', destroy);
			$document.on('mousemove', mousemove);

			function show($evt, data){

				if(data.html){

					textNode.html(data.content);

				}else{

					textNode.text(data.content);

				}

				if(data.hideTiming){

					$timeout.cancel(timeout);
					timeout = $timeout(hide, data.hideTiming);
					
				}

				showing = true;
				$element.addClass(showingClass);
				
			}

			function hide(){

				$timeout.cancel(timeout);
				$element.removeClass(showingClass);
				$element.on('transitionend', transitionend);
				
			}

			function mousemove(evt){

	            var _x;
	            var _y;

	            if(showing){

					_x = evt.pageX || evt.clientX;
            		_y = evt.pageY || evt.clientY;

            		moveTooltip(_x, _y);

	            }
			}

			function transitionend(){
				
				if(!showing){

					showing = false;
					$element.removeAttr('style');

				}

			}

			function moveTooltip(x, y){

	            var _width = $element.prop('offsetWidth');
	            var _height = $element.prop('offsetHeight');
	            var _top;
	            var _left;
	            var _widthAdjust = (_width/2);
	            var _heightAdjust = 10;

	            if((_heightAdjust + _height) + y <= window.innerHeight){

	              //position underneath the mouse cursor
	              _top = y + _height;

	            }else{

	              //position atop the mouse cursor
	              _top = y - _height;

	            }

	            if((_widthAdjust + x) >= window.innerWidth){

	              //position to the left
	              _left = x - _width;

	            }else if(x - _widthAdjust <= 0){

	              //position to the right
	              _left = x;

	            }else{

	              //position next to the cursor
	              _left = x - _widthAdjust;

	            }

	            $element.css({
	            	top: _top + 'px',
	            	left: _left + 'px',
	            });
				
			}

			function destroy(){

				$document.off('mousemove', mousemove);
				$show();
				$hide();
				
			}
			
		}
		
	}

	tooltipTrigger.$inject = ['$rootScope', '$timeout'];

	function tooltipTrigger($rootScope, $timeout){

		var directive = {
			
			scope: {
				
				text: '@tooltipText',
				hideTimeout: '@',
				showDelay: '@',
				hideDelay: '@',
				html: '@',

			},

			restrict: 'AEC',
			link: postLink,
		};

		return directive;

		function postLink($scope, $element, attrs){

			$scope.showDelay = parseInt($scope.showDelay) || 0;
			$scope.hideDelay = parseInt($scope.hideDelay) || 0;
			$scope.hideTimeout = parseInt($scope.hideTimeout) || false;

			$element.on('mouseenter', showTrigger);
			$element.on('mouseleave', hideTrigger);
			$scope.$on('$destroy', destroy);

			function showTrigger(){

				var _data = {
					
					content: $scope.text,
					hideTiming: $scope.hideTimeout,

				};

				if($scope.html){

					_data.html = $scope.html;

				}

				$timeout(function(){

					$rootScope.$broadcast('pg-tooltip-show', _data);

				}, $scope.showDelay);
				
			}

			function hideTrigger(){

				$timeout(function(){

					$rootScope.$broadcast('pg-tooltip-hide');
					
				}, $scope.hideDelay);
				
			}

			function destroy(){

				$element.off('mouseenter mouseleave');
				
			}
			
		}
		
	}
	
})();