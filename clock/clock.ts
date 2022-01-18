namespace $ {
	
	/** Vector clock. Stores real timestamps. */
	export class $hyoo_crowd_clock extends Map<
		$hyoo_crowd_chunk['peer'],
		$hyoo_crowd_chunk['time']
	> {
		
		/** Maximum time for all peers. */
		now = 0
		
		constructor( entries?: Iterable< readonly [ number, number ] > ) {
			
			super( entries! )
			
			if( entries ) {
				for( const [ peer, time ] of entries ) {
					if( this.now < time ) this.now = time
				}
			}
			
		}
		
		/** Synchronize this cloc with another. */
		sync( right: $hyoo_crowd_clock ) {
			for( const [ peer, time ] of right ) {
				this.see( peer, time )
			}
		}
		
		/** Add new `time` for `peer` and increase `now`. */
		see( peer: number, time: number ) {
			
			if( this.now < time ) this.now = time
			
			const peer_time = this.get( peer )
			if( !peer_time || peer_time < time ) {
				this.set( peer, time )
			}
			
			return time
		}
		
		/** Checks if time from future. */
		fresh( peer: number, time: number ) {
			return time > ( this.get( peer ) ?? 0 )
		}
		
		/** Checks if this clock from future of another. */
		ahead( clock: $hyoo_crowd_clock ) {
			
			for( const [ peer, time ] of this.entries() ) {
				if( clock.fresh( peer, time ) ) return true
			}
			
			return false
		}
		
		/** Gererates new time for peer that greater then other seen. */
		tick( peer: number ) {
			return this.see( peer, Math.max( Date.now(), this.now + 1 ) )
		}
		
		clear() {
			super.clear()
			this.now = 0
		}
			
	}
	
}
