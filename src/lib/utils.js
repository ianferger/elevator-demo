define( function () {
	return {
	
		notFalse: function ( val ) {	return !( this.isFalse( val ) ); },
		isFalse: function ( val ) {
			return ( val === -1 || val === false || val === null
			|| val === undefined || val === '' || isNaN( val ) || this.isStrFalse( val ) );
		},

		notStrFalse: function ( val ) {
			return !( this.isStrFalse( val ) );
		},
		isStrFalse: function ( val ) {
			val = new String( val ).toLowerCase();
			return ( val === "false" || val === "null" );
		},

		getClosestElements: function ( arr, val ) {
			console.log( "getClosestElements arr: " );
			console.log( arr );

			var item;
			var closestValues = {
				"below": { "value": "false", "index": "false" },
				"above": { "value": "false", "index": "false" }
			}

			for ( var i = 0; i < arr.length ; i++ ) {
				item = arr[i];

				if ( ( item < val )
        		&& ( ( this.isStrFalse( closestValues.below.value )
				|| Math.abs( item - val ) < Math.abs( closestValues.below.value - val ) ) ) ) {
					closestValues.below.value = item;
					closestValues.below.index = i;
				} else if ( ( item > val )
        		&& ( ( this.isStrFalse( closestValues.above.value )
				|| Math.abs( item - val ) < Math.abs( closestValues.above.value - val ) ) ) ) {
					closestValues.above.value = item;
					closestValues.above.index = i;
				}
			}
			return closestValues;
		},

		getIOSVersion: function ( returnString ) {
			var returnValue = false;
			var match = ( navigator.appVersion ).match( /OS (\d+)_(\d+)_?(\d+)?/ );
			
			if ( match ) {
				var version = [
				   parseInt( match[1], 10 ),
				   parseInt( match[2], 10 ),
				   parseInt( match[3] || 0, 10 )
				];

				returnValue = returnString ? version.join('.') : version;
			}
			return returnValue;
		},
		isBelowMinimumIOS: function ( versionNumber ) {
			var returnValue = false;
			var version = this.getIOSVersion();
			//console.log( "isBelowMinimumIOS version: " + version + "  versionNumber: " + versionNumber );
			if ( version.length > 0 ) {
				returnValue = ( version[0] < versionNumber );
			}
			return returnValue;
			//return true;
		}
	};
} );