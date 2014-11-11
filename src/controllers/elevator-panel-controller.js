/**
*	@module elevator-panel-controller
*	@class ElevatorPanelController
*	@param {object} ko instance of Knockout class loaded as a RequireJS lazy dependency
*	@param {object} Utils instance of Utils class loaded as a RequireJS lazy dependency
*	@param {object} Audio5 instance of Audio5JS class loaded as a RequireJS lazy dependency
*	@param {object} Logger instance of logger class  loaded as a RequireJS lazy dependency
* 
*	@author Ian Douglass Ferger  <IanDouglassFerger@gmail.com>
*	@version 1.01
*	@returns {object} ElevatorPanelController
 */
define( ["knockout", "utils", "audio5", "Logger"], function ( ko, Utils,  Audio5 ,Logger) {
/** 
*	controller module for elevator-panel app
*	@constructor
*	@class ElevatorPanelController
*	@alias module:elevator-panel-controller
*	@param {object} vm instance of ElevatorPanelViewModel
*/
	function ElevatorPanelController( vm ) {


/** @type {Object}  Reference to 'this' to avoid scoping issues within methods in knockout */
		var me = this;
/** @type {number}  Lowest number stop */
		var lowerLimit = vm.availableStops()[vm.availableStops().length - 2];
/** @type {number} Highest number stop*/
		var upperLimit = vm.availableStops()[0];
/** @type {string} directions key for up*/
		var up = vm.directions.up.key;
/** @type {string} directions key for down*/
		var down = vm.directions.down.key;
/** @type {string} directions key for stopped*/
		var stopped = vm.directions.stopped.key;
/** @type {string} state key for doors opening*/
		var doorsOpening = vm.states.doorsOpening.key;
/** @type {string} state key for open*/
		var doorsOpen = vm.states.doorsOpen.key;
/** @type {string} state key for  doors closing*/
		var doorsClosing = vm.states.doorsClosing.key;
/** @type {string} state key for closed doors*/
		var doorsClosed = vm.states.doorsClosed.key;
/** @type {string} state key for in motion*/
		var inMotion = vm.states.inMotion.key;
/**  @type {object} sound effects */
		var sounds = {};


/** @method ElevatorPanelController#onBtnMouseDown
* mouse press handler
* @event onmousedown,touchstart
* @see 'data-bind' attribute 
* @param {mixed} data value of submitting element
* @returns {undefined} */
		me.onBtnMouseDown = function ( data ) {
			
			var isText= isNaN( data );

			Logger.info( "onBtnMouseDown data: " + data + " isText: " + isText );
			
			if ( isText ) {	//open button
				var state = vm.currentState();
				if ( vm.states.hasOwnProperty( data ) && state !== inMotion ) {

					vm.holdState( data );

					if ( state !== doorsOpening && state !== doorsOpen ){
						setUIState( data );
					}

				}
			} else {
				var val = parseFloat( data );
				var has = hasStop( val );
				var isCurrent = ( val === vm.currentStop() );

				Logger.info( "onBtnMouseDown val: " + val + " has: " + has + " isCurrent: " + isCurrent );

				if ( !has && !isCurrent ) 	addStop( val );
			}

			playSound( "buttonClick" );

		}


/** @method ElevatorPanelController#onBtnMouseUp
*	event handler
* @event onmousedown,touchstart
* @see 'data-bind' attribute 
* @param {number,string} data value of submitting element
* @returns {undefined} */
		me.onBtnMouseUp = function ( data ) {

			Logger.info( "onBtnMouseUp data: " + data + " data === vm.holdState(): " + (data === vm.holdState()) );
			if ( data === vm.holdState() ) {
				vm.holdState( false );
				setState();
			}
		}


/** @method ElevatorPanelController#onAnimationComplete
*	event handler bound to 
*  @event animationiteration, webkitAnimationIteration, oanimationiteration
*  @see 'data-bind' attribute 
*  @returns {undefined} */
		me.onAnimationComplete = function () {
			Logger.info( "onAnimationComplete" );
			setState();
		}


/** @method ElevatorPanelController#setState
*	change state to logical progression based on current state and direction
*	@see ElevatorPanelViewModel#states
*  @returns {undefined} */
		function setState() {
			var state = vm.currentState();
			var dir = vm.currentDirection();

			var nextState = state;
			var holdState = vm.holdState();

			//Logger.info( "setState state: " + state + " dir: " + dir + " holdState: " + holdState );
			switch ( state ) {
				case doorsOpening:
					nextState = doorsOpen;
					break;
				case doorsOpen:
					if ( !holdState ) nextState = doorsClosing;
					break;
				case doorsClosing:
				case doorsClosed:
					if ( !holdState ) {
						//if not stopped, start moving else stay closed
						nextState = setDirection() === stopped ? doorsClosed : inMotion;
					}
					break;
				case inMotion: //is moving state...just changed floors

					var stopRemoved = removeStop( setCurrentStop() );
					//remove current stop if selected and either open doors or keep moving
					if ( stopRemoved ) {
						setDirection();
						nextState = doorsOpening;
					} else {
						nextState = inMotion;
					}
					break;
			}

			Logger.info( "setState  setting state: " + nextState );
			setUIState( nextState );
		}


/** @method ElevatorPanelController#setUIState
*	add new stop to queue, init direction if it is stopped
*	@param {string} state key of state to add
*	@see ElevatorPanelViewModel#states
*  @returns {undefined} */
		function setUIState( state ) {
			vm.currentState( state );
			vm.setCurrentAnimationText();
			playSound( state );
		}


/** @method ElevatorPanelController#setDirection
*	add new stop to queue, init direction if it is stopped
*	@see ElevatorPanelViewModel#directions
*  @returns {undefined} */
		function setDirection() {
			var dir = vm.currentDirection();
			var curr = vm.currentStop();

			var closestElements = Utils.getClosestElements( vm.queuedStops(), curr );
			var hasStopsAbove = Utils.notStrFalse( closestElements.above.value );
			var hasStopsBelow = Utils.notStrFalse( closestElements.below.value );

			//stop if going down but nothing below in queue
			if ( dir === down && !hasStopsBelow ) dir = stopped;

			//stop if going up but nothing above in queue
			if ( dir === up && !hasStopsAbove ) dir = stopped;

			//not moving
			if ( dir == stopped ) {
				//queuedStops below current in queue
				if ( hasStopsBelow ) dir = down;

				//queuedStops above current in queue 
				if ( hasStopsAbove ) dir = up;
			}

			vm.currentDirection( dir );

			Logger.info( "setDirection dir: " + dir + " currentState: " + vm.currentState() );

			return dir;
		}


/** @method ElevatorPanelController#addStop
*	add new stop to queue, init direction if it is stopped
*	@param {number} val floor number to add
*	@see setUIState
*  @returns {undefined} */
		function addStop( val ) {
			var state = vm.currentState();
			var dir = vm.currentDirection();

			Logger.info( "addstop val: " + val + " state: " + state + " dir: " + dir );

			vm.queuedStops.push( val );//add to queue
			vm.queuedStops.sort(); //re-sort

			vm.holdState( false );

			if ( dir == stopped ) setDirection(); //change state and direction if doors closed


			if ( state == doorsClosed ) {
				setUIState( inMotion );
			}

		}


/** @method ElevatorPanelController#removeStop
*	remove stop from queue
*	@param {number} val floor number to remove
*	@see ElevatorPanelViewModel#queuedStops
*  @returns {boolean}  return true if removed, false otherwise */
		function removeStop( val ) {
			var arr = vm.queuedStops.remove( val );
			Logger.info( "removeStop length: " + arr.length );
			return ( arr.length > 0 );
		}


/** @method ElevatorPanelController#setCurrentStop
*	increment or decrement current stop, skip over zero.
*	@see ElevatorPanelViewModel#currentStop
*  @returns {number}  */
		function setCurrentStop() {
			var stop = vm.currentStop();
			var dir = vm.currentDirection();

			if ( dir === down ) {
				if ( stop > lowerLimit ) {
					stop--;
					if ( stop == 0 ) stop--; //skip zero if moving
				}
			} else if ( dir === up ) {
				if ( stop < upperLimit ) {
					stop++;
					if ( stop == 0 ) stop++; //skip zero if moving
				}
			}

			Logger.info( "setCurrentStop lowerLimit: " + lowerLimit + " upperLimit: " + upperLimit + " stop: " + stop + " currentStop: " + vm.currentStop() );

			vm.currentStop( stop );

			return stop;
		}


/** @method ElevatorPanelController#hasStop
*	whether stop exists in the queue
*	@param {number} val stop number to check
*	@see Utils#notFalse
*  @returns {boolean} true if stop exists in the queue, false otherwise*/
		function hasStop( val ) {
			return Utils.notFalse( getStop( vm.queuedStops.indexOf( val ) ) );
		}


/** @method ElevatorPanelController#playSound
*	play sound associated with key if sound exists0
*	@param {string} key sound to play
*	@see sounds
*  @returns {undefined}*/
		function playSound( key ) {
			if ( sounds.hasOwnProperty( key ) ) {
				Logger.info( "playSound key: " + key);
				var sound = sounds[key];
				if ( sound.playing ) {
					var previousVolume = sound.volume();
					sound.volume( 0 );
					sound.seek( 0 );
					sound.volume( previousVolume );
					
				}
				//set playhead to begin
				sound.play();
			}
		}


/** @method ElevatorPanelController#playSound
*	iterate through 
*	@param {string} filePath relative path of sound to load
*	@see ElevatorPanelViewModel#sounds
*  @returns {undefined}*/
		function setSounds( filePath ) {

			// create sound objects 
			var filePath;
			for ( var key in vm.sounds ) {
				filePath = vm.sounds[key];
				Logger.info( "setSounds filePath: " + filePath );
				sounds[key] = new Audio5( {	ready: function () { this.load( filePath ); }	} );
			}
		}


/** @method ElevatorPanelController#getCompatibilityError
*  iterate through supported user agents, return any that dont match minimum version
*  @see ElevatorViewPanelModel#minimumVersions
*  @returns {string|boolean} identifier of first found incompatibility match  */
		function getCompatibilityError() {
			var item;
			var returnValue = false;
			var isNotCompatible;

			for ( var key in vm.minimumVersions ) {
				item = vm.minimumVersions[key];
				switch ( key ) {
					case "ios":
						isNotCompatible = Utils.isBelowMinimumIOS( item.version );
						break;
				}

				Logger.warn( "getCompatibilityError isBelowMinimumIOS( " + item.version + "): " + Utils.isBelowMinimumIOS( item.version ) );

				if ( isNotCompatible ) {
					returnValue = item.error;

					Logger.error( "getCompatibilityError: " + returnValue );
					break;
				}
			}
			return returnValue;
		}


/** @method ElevatorPanelController#init
*	initiate template, check compatibility		
* @returns {undefined} */
		me.init = function () {
			var error = getCompatibilityError();
			var templateName = error || "intro";

			var templatePath = vm.templates[templateName];

			Logger.info( "controller init intro: " + templatePath );


			require( ["html!" + templatePath], vm.introContent );

			if ( !error ) setSounds();

		}


//call initialization
		me.init();

	}//close
	return ElevatorPanelController;
} );