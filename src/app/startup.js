/**
*	@module startup
*	@param {object} ko instance of Knockout class loaded as a RequireJS lazy dependency
*	@param {object} Logger instance of logger class  loaded as a RequireJS lazy dependency
* 
*	@author Ian Douglass Ferger  <IanDouglassFerger@gmail.com>
*	@version 1.01
 */
define( ['knockout', "Logger", "css!ep-styles", "css!ep-media-queries", "css!ep-animations"], function ( ko, Logger ) {
	
	//set logger to use console if available.
	Logger.useDefaults();
	
	//register component
	ko.components.register( 'elevator-panel', { require: 'ep-component' } );

  // Start the application
	ko.applyBindings();
});