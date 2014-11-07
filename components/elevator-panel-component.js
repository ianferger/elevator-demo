/**
 * Knockout component definition module
 * @module elevator-panel-component
 */

define( ["ep-controller", "ep-view-model", "html!ep-template", "Logger"],
	function ( ElevatorPanelController, ElevatorPanelViewModel, ElevatorPanelTemplate, Logger ) {
/**
* @constructor
* @alias module:elevator-panel-component
*/
		Logger.info( "elevator-panel-component" );
		return {
			viewModel: { 
/**
* @constructor
* @param {object} parameters
* @param {object} dom information
* @returns {function} view model
* 
*/
				createViewModel: function ( params, componentInfo ) {
					
					
					//stubs protod for easy testing
					//ElevatorPanelViewModel.prototype.getController = function () { 
					//	controller = controller || new ElevatorPanelController( self );
					//	return controller;
					//};

					ElevatorPanelViewModel.prototype.onBtnMouseDown = function ( data ) { };
					ElevatorPanelViewModel.prototype.onBtnMouseUp = function ( data ) { };

					ElevatorPanelViewModel.prototype.onAnimationComplete = function () {};

					//garbage collector
					ElevatorPanelViewModel.prototype.dispose = function () { };

					var elevatorPanelViewModel = new ElevatorPanelViewModel();
					elevatorPanelViewModel.controller = new ElevatorPanelController( elevatorPanelViewModel );

					elevatorPanelViewModel.onBtnMouseDown = elevatorPanelViewModel.controller.onBtnMouseDown;
					elevatorPanelViewModel.onBtnMouseUp = elevatorPanelViewModel.controller.onBtnMouseUp;
					elevatorPanelViewModel.onAnimationComplete = elevatorPanelViewModel.controller.onAnimationComplete;

					//var elevatorPanelController = new ElevatorPanelController( elevatorPanelViewModel );
					//console.log( elevatorPanelController );
					
					return elevatorPanelViewModel;
				}
			},
			template: ElevatorPanelTemplate
		};
	});
