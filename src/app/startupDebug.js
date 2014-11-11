
define( ['knockout', "Logger", "css!ep-styles", "css!ep-media-queries", "css!ep-animations"], function ( ko, Logger ) {
	
	Logger.useDefaults();
	
	var loggerModel = {
		logText: ko.observable( "" )
	};

	Logger.setHandler( function ( messages, context ) {
		var oldText = loggerModel.logText();
		var newText = oldText || "";

		newText += messages[0];
		loggerModel.logText( context + ": " + newText + "<br>" );
	} );

	ko.components.register( 'elevator-panel', { require: 'ep-component' } );

	// Start the application	
	ko.applyBindings( loggerModel );
	
	
});