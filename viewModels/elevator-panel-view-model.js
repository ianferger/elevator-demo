define( ["knockout", "Logger"], function ( ko, Logger ) {

	function ElevatorPanelViewModel() {
		var self = this;

		/* @description non-observable public app config objects */

		/* @type function */
		self.controller = null;
		
		self.strings = {
			minusPrefix: "P",
			up: "<<",
			down: ">>",
			doorsOpening: "--<<br>-->",
			doorsOpen: " ---<br><br>---",
			doorsClosing: "--><br>--<",
			doorsClosed: "---<br>---"
		}

		self.states = {
			doorsOpening: {	cls: "doors doors-movement", key: "doorsOpening"},
			doorsOpen: { cls: "doors doors-stationary", key: "doorsOpen"},
			doorsClosing: {cls: "doors doors-movement", key: "doorsClosing" },
			doorsClosed: { cls: "doors", key: "doorsClosed" },
			inMotion: { cls: "up", key: "inMotion" }
		};

		self.sounds = {
			doorsOpening: "files/sounds/elevator-component/doorsOpen.ogg",
			doorsOpen: "files/sounds/elevator-component/floorBeep.ogg",
			doorsClosing:	"files/sounds/elevator-component/doorsClose.ogg",
			inMotion: "files/sounds/elevator-component/movement.ogg",
			buttonClick: "files/sounds/elevator-component/buttonClick.ogg"
		};

		self.directions = {
			stopped: { key: "stopped", cls: "stopped" },
			down: { key: "down", cls: "in-motion down" },
			up: { key: "up", cls: "in-motion up" }
		};

		self.templates = {
			intro: "ep-intro",
			iosError: "ep-ios-error"
		};

		self.minimumVersions= {
			ios:{ version: 5, error: "iosError" }
		};

		self.holdState = ko.observable( false );
		self.introContent = ko.observable();

		self.queuedStops = ko.observableArray( [] );
		self.availableStops = ko.observableArray( [8, 7, 6, 5, 4, 3, 2, 1, -1, self.states.doorsOpening.key ] );

		self.currentStop = ko.observable( 1 );
		self.currentDirection = ko.observable( self.directions.stopped.key );
		self.currentState = ko.observable( self.states.doorsClosing.key );

		self.animationCSSClass = ko.observable( self.states.doorsClosing.cls );		
		self.animationText = ko.observable( self.strings[self.states.doorsClosing.key ] );

		self.setTextAnimation = function () {
			var state = self.currentState();
			var dir = self.currentDirection();
			
			if( state === self.states.inMotion.key ){
				self.animationCSSClass( self.directions[dir].cls);
				self.animationText( self.strings[ dir ] );
				
			}else{
				self.animationCSSClass( self.states[state].cls );
				self.animationText( self.strings[state] );
			}
		};

		self.displayedStop = ko.pureComputed( function () {
			var returnValue = ( self.currentStop() > 0 ) ? self.currentStop()
			: self.strings.minusPrefix + Math.abs( self.currentStop() );
			return returnValue;
		} );
		
		self.initialized = ko.observable( false );

		self.setInitialized = function () {
			Logger.info( "setInitialized" );
			self.initialized( true );

		};

	}

	return ElevatorPanelViewModel;
} );