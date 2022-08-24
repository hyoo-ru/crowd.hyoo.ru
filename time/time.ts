namespace $ {
	
	/** Internal int31 representation of current time. */
	export function $hyoo_crowd_time_now() {
		return Math.floor( Date.now() / 100 ) - 1767e7
	}
	
	/** Returns unix timestamp for internal time representation. */
	export function $hyoo_crowd_time_stamp( time: number ) {
		return 1767e9 + time * 100
	}
	
}
