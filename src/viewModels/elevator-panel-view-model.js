/**
*	@module elevator-panel-view-model
*	@class ElevatorPanelViewModel
*	@param {object} ko instance of Knockout class loaded as a RequireJS lazy dependency
*	@param {object} Logger instance of logger class  loaded as a RequireJS lazy dependency
* 
*	@author Ian Douglass Ferger  <IanDouglassFerger@gmail.com>
*	@version 1.01
*	@returns {object} ElevatorPanelViewModel
 */
define( ["knockout", "Logger"], function ( ko, Logger ) {


/** 
*	view module for elevator-panel app
*	@constructor
*	@class ElevatorPanelViewModel
*	@alias module:elevator-panel-view-model
*/
	function ElevatorPanelViewModel() {


/** @type {Object}  Reference to 'this' to avoid scoping issues within methods in knockout */
		var me = this;


/**   Reference to ElevatorPanelController
*	@type {Object} 
*	@memberOf ElevatorPanelViewModel
*/
		me.controller = null;


/** 
*	@property {object} strings collection of strings to display
*	@property {string} strings.minusPrefix goes before floor num for neg nums in floor display
*	@property {string} strings.up depicts up in animation text display
*	@property {string} strings.down depicts down in animation text display
*	@property {string} strings.doorsOpening depicts doors opening in animation text display
*	@property {string} strings.doorsClosing depicts doors open in animation text display
*	@property {string} strings.doorsClosed depicts doors closing in animation text display 
*	@memberOf ElevatorPanelViewModel
*/	
		me.strings = {
			minusPrefix: "P",
			up: "<<",
			down: ">>",
			doorsOpening: "--<<br>-->",
			doorsOpen: " ---<br><br>---",
			doorsClosing: "--><br>--<",
			doorsClosed: "---<br>---"
		}


/** 
*	@property {object} states collection of strings to display
*	@property {object} states.doorsOpening
*	@property {string} states.doorsOpening.key  identifier lookup 
*	@property {string} states.doorsOpening.cls CSS class name
*	@property {object} states.doorsOpen
*	@property {string} states.doorsOpen.key  identifier lookup 
*	@property {string} states.doorsOpen.cls CSS class name
*	@property {object} states.doorsClosing
*	@property {string} states.doorsClosing.key  identifier lookup 
*	@property {string} states.doorsClosing.cls CSS class name
*	@property {object} states.doorsClosed
*	@property {string} states.doorsClosed.key  identifier lookup 
*	@property {string} states.doorsClosed.cls CSS class name
*	@property {object} states.inMotion
*	@property {string} states.inMotion.key  identifier lookup 
*	@property {string} states.inMotion.cls CSS class name
*	@memberOf ElevatorPanelViewModel
*/
		me.states = {
			doorsOpening: {	cls: "doors doors-movement", key: "doorsOpening"},
			doorsOpen: { cls: "doors doors-stationary", key: "doorsOpen"},
			doorsClosing: {cls: "doors doors-movement", key: "doorsClosing" },
			doorsClosed: { cls: "doors", key: "doorsClosed" },
			inMotion: { cls: "up", key: "inMotion" }
		};


/** 
*	@property {object} sounds collection paths to application sounds
*	@property {string} sounds.doorsOpening sound of doors opening
*	@property {string} sounds.doorsOpen  sound of doors open
*	@property {string} sounds.doorsClosing  sound of doors closing
*	@property {string} sounds.inMotion  sound of car in motion
*	@property {string} sounds.buttonClick sound of panel button being pressed
*	@memberOf ElevatorPanelViewModel
*/
		me.sounds = {
			doorsOpening: "media/sounds/elevator-component/doorsOpen.ogg",
			doorsOpen: "media/sounds/elevator-component/floorBeep.ogg",
			doorsClosing:	"media/sounds/elevator-component/doorsClose.ogg",
			inMotion: "media/sounds/elevator-component/movement.ogg",
			buttonClick: "media/sounds/elevator-component/buttonClick.ogg"
		};


/** 
*	@property {object} directions collection directions for car to move
*	@property {object} directions.stopped
*	@property {string} directions.stopped.key  identifier lookup 
*	@property {string} directions.stopped.cls CSS class name
*	@property {object} directions.down
*	@property {string} directions.down.key  identifier lookup 
*	@property {string} directions.down.cls CSS class name
*	@property {object} directions.up
*	@property {string} directions.up.key  identifier lookup 
*	@property {string} directions.up.cls CSS class name
*	@memberOf ElevatorPanelViewModel
*/
		me.directions = {
			stopped: { key: "stopped", cls: "stopped" },
			down: { key: "down", cls: "in-motion down" },
			up: { key: "up", cls: "in-motion up" }
		};

/** 
*	@property {object} templates html templates collection
*	@property {string} templates.intro intro text
*	@property {string} templates.iosError  insufficient iOS version
*	@memberOf ElevatorPanelViewModel
*/
		me.templates = {
			intro: "ep-intro",
			iosError: "ep-ios-error"
		};


/** 
*	@property {object} minimumVersions browser versions to check for 
*	@property {object} minimumVersions.ios 
*	@property {number} minimumVersions.ios.version major ver number
*	@property {string} minimumVersions.ios.error error code
*	@memberOf ElevatorPanelViewModel
*/
		me.minimumVersions= {
			ios:{ version: 5, error: "iosError" }
		};

/** 
*	@property {boolean} initialized model has been initialized
*	@memberOf ElevatorPanelViewModel
*/
		me.initialized = ko.observable( false );


/** 
*	@property {boolean} holdState whether state is held as in open door button
*	@memberOf ElevatorPanelViewModel
*/
		me.holdState = ko.observable( false );

/** 
*	@property {object} introContent knockout observable intro html placeholder
*	@memberOf ElevatorPanelViewModel
*/
		me.introContent = ko.observable();


/** 
*	@property {array} queuedStops knockout observablearray stops yet to be arrived at
*	@memberOf ElevatorPanelViewModel
*/
		me.queuedStops = ko.observableArray( [] );

/** 
*	@property {array} availableStops knockout observablearray stops in list
*	@memberOf ElevatorPanelViewModel
*/
		me.availableStops = ko.observableArray(
			[8, 7, 6, 5, 4, 3, 2, 1, -1, me.states.doorsOpening.key]
		);


/** 
*	@property {array} currentStop knockout observable current stop
*	@memberOf ElevatorPanelViewModel
*/
		me.currentStop = ko.observable( 1 );


/** 
*	@property {string} currentDirection knockout observable current direction
*	@memberOf ElevatorPanelViewModel
*/
		me.currentDirection = ko.observable( me.directions.stopped.key );


/** 
*	@property {string} currentState knockout observable current state
*	@memberOf ElevatorPanelViewModel
*/
		me.currentState = ko.observable( me.states.doorsClosing.key );


/** 
*	@property {string} currentCSSClass knockout observable current css class for animation
*	@memberOf ElevatorPanelViewModel
*/
		me.currentCSSClass = ko.observable( me.states.doorsClosing.cls );


/** 
*	@property {string} currentAnimationText knockout observable current css class for animation
*	@memberOf ElevatorPanelViewModel
*/
		me.currentAnimationText = ko.observable( me.strings[me.states.doorsClosing.key ] );

/** @method ElevatorPanelViewModel#setCurrentAnimationText
*	set text for animation based on currentState and currentDirection
*  @returns {undefined} */
		me.setCurrentAnimationText = function () {
			var state = me.currentState();
			var dir = me.currentDirection();
			
			if( state === me.states.inMotion.key ){
				me.currentCSSClass( me.directions[dir].cls);
				me.currentAnimationText( me.strings[ dir ] );
				
			}else{
				me.currentCSSClass( me.states[state].cls );
				me.currentAnimationText( me.strings[state] );
			}
		};

		me.displayedStop = ko.pureComputed( function () {
			var returnValue = ( me.currentStop() > 0 ) ? me.currentStop()
			: me.strings.minusPrefix + Math.abs( me.currentStop() );
			return returnValue;
		} );
		
/** @method ElevatorPanelViewModel#setInitialized
*	set model as initialized
*  @returns {undefined} */
		me.setInitialized = function () {
			Logger.info( "setInitialized" );
			me.initialized( true );

		};

	}

	return ElevatorPanelViewModel;
} );