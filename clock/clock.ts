namespace $ {
	
	/** Vector version clock. */
	export class $hyoo_crowd_clock extends Map<
		$hyoo_crowd_chunk['peer'],
		$hyoo_crowd_chunk['time']
	> {
		
		/** Maximum version for all peers. */
		now = 0
		
		constructor( entries?: Iterable< readonly [ number, number ] > ) {
			
			super( entries! )
			
			if( entries ) {
				for( const [ peer, time ] of entries ) {
					if( this.now < time ) this.now = time
				}
			}
			
		}
		
		/** Add new `version` for `peer` and increase `now`. */
		see( peer: number, time: number ) {
			
			if( this.now < time ) this.now = time
			
			const peer_version = this.get( peer )
			if( !peer_version || peer_version < time ) {
				this.set( peer, time )
			}
			
			return time
		}
		
		/** Checks if version from future. */
		fresh( peer: number, time: number ) {
			return time > ( this.get( peer ) ?? 0 )
		}
		
		/** Checks if clock from future. */
		ahead( clock: $hyoo_crowd_clock ) {
			
			for( const [ peer, time ] of this.entries() ) {
				if( clock.fresh( peer, time ) ) return true
			}
			
			return false
		}
		
		/** Gererates new version for peer that greated then other seen. */
		tick( peer: number ) {
			return this.see( peer, this.now + 1 )
		}
			
	}
	
}
