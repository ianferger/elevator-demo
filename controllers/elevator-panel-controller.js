/**
 * controller for elevator-panel app
 * @module elevator-panel-controller
 */
define( ["knockout", "utils", "audio5", "Logger"], function ( ko, Utils,  Audio5 ,Logger) {

	function ElevatorPanelController( vm ) {

		var self = this;

		var lowerLimit = vm.availableStops()[vm.availableStops().length - 2];
		var upperLimit = vm.availableStops()[0];

		//direction keys
		var up = vm.directions.up.key;
		var down = vm.directions.down.key;
		var stopped = vm.directions.stopped.key;

		//state keys
		var doorsOpening = vm.states.doorsOpening.key;
		var doorsOpen = vm.states.doorsOpen.key;
		var doorsClosing = vm.states.doorsClosing.key;
		var doorsClosed = vm.states.doorsClosed.key;
		var inMotion = vm.states.inMotion.key;

		var sounds = {};

		self.init = function () {
			var error = getCompatibilityError();
			var templateName = error || "intro";

			var templatePath = vm.templates[templateName];
			
			Logger.info("controller init intro: " + templatePath );

			
			require( ["html!" + templatePath], vm.introContent );
			
			if ( !error ) setSounds();
			
		}
				
		self.onBtnMouseDown = function ( data ) {
			
			var isText= isNaN( data );

			Logger.info( "onBtnMouseDown data: " + data + " isText: " + isText );
			
			if ( isText ) {	//open button
				var state = vm.currentState();
				if ( vm.states.hasOwnProperty( data ) && state !== inMotion ) {
					vm.holdState( data );

					if ( state !== doorsOpening && state !== doorsOpen ) setUIState( data );
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

		self.onBtnMouseUp = function ( data ) {

			Logger.info( "onBtnMouseUp data: " + data + " data === vm.holdState(): " + (data === vm.holdState()) );
			if ( data === vm.holdState() ) {
				vm.holdState( false );
				setState();
			}
		}

		self.onAnimationComplete = function () {
			Logger.info( "onAnimationComplete" );
			setState();
		}

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

				Logger.warn( "getCompatibilityError isBelowMinimumIOS( " + item.version  + "): " + Utils.isBelowMinimumIOS( item.version ) );

				if ( isNotCompatible ) {
					returnValue = item.error;

					Logger.error( "getCompatibilityError: " + returnValue );
					break;
				}
			}
			return returnValue;
		}

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
		function setUIState( state ) {
			//Logger.info( "setUIState state: " + state );
			vm.currentState( state );
			vm.setTextAnimation();

			playSound( state );
		}

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

		function removeStop( val ) {
			var arr = vm.queuedStops.remove( val );
			Logger.info( "removeStop length: " + arr.length );
			return ( arr.length > 0 );
		}


		function hasStop( val ) { return Utils.notFalse( getStop( val ) ); }
		function getStop( val ) { return vm.queuedStops.indexOf( val ); }

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
				//sound.pause();
				sound.play();
			}
		}

		function setSounds( filePath ) {

			// create sound objects 
			var filePath;
			for ( var key in vm.sounds ) {
				filePath = vm.sounds[key];
				Logger.info( "setSounds filePath: " + filePath );
				sounds[key] = new Audio5( {	ready: function () { this.load( filePath ); }	} );
			}
		}

		self.init();

	}//close
	return ElevatorPanelController;
} );