/**
 * Knockout component definition module
 * @module elevator-panel-component
 */

define( ["ep-controller", "ep-view-model", "html!ep-template", "Logger"],
/**
* @constructor
* @param {object} ElevatorPanelController class
* @param {object} ElevatorPanelViewModel class
* @param {object}  ElevatorPanelTemplate html fragment
* @param {object}  Logger console Logger class
* @alias module:elevator-panel-component
* @returns {object}
*/
	function ( ElevatorPanelController, ElevatorPanelViewModel, ElevatorPanelTemplate, Logger ) {

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


					//stubs for unit testing

					ElevatorPanelViewModel.prototype.onBtnMouseDown = function ( data ) { };
					ElevatorPanelViewModel.prototype.onBtnMouseUp = function ( data ) { };

					ElevatorPanelViewModel.prototype.onAnimationComplete = function () { };

					//garbage collector
					ElevatorPanelViewModel.prototype.dispose = function () { };

					//instantiate model
					var elevatorPanelViewModel = new ElevatorPanelViewModel();

					//instantiate controller
					elevatorPanelViewModel.controller = new ElevatorPanelController( elevatorPanelViewModel );

					//assign handlers
					elevatorPanelViewModel.onBtnMouseDown = elevatorPanelViewModel.controller.onBtnMouseDown;
					elevatorPanelViewModel.onBtnMouseUp = elevatorPanelViewModel.controller.onBtnMouseUp;
					elevatorPanelViewModel.onAnimationComplete = elevatorPanelViewModel.controller.onAnimationComplete;

					return elevatorPanelViewModel;
				}
			},
			template: ElevatorPanelTemplate
		};
	} );