namespace $ {
	
	/** Vector version clock. */
	export class $hyoo_crowd_clock extends Map<
		$hyoo_crowd_chunk['peer'],
		$hyoo_crowd_chunk['time']
	> {
		
		/** Maximum version for all peers. */
		version_max = 0
		
		constructor( entries?: Iterable< readonly [ number, number ] > ) {
			
			super( entries! )
			
			if( entries ) {
				for( const [ peer, version ] of entries ) {
					if( this.version_max < version ) this.version_max = version
				}
			}
			
		}
		
		/** Add new `version` for `peer` and increase `version_max`. */
		see( peer: number, version: number ) {
			
			if( this.version_max < version ) this.version_max = version
			
			const peer_version = this.get( peer )
			if( !peer_version || peer_version < version ) {
				this.set( peer, version )
			}
			
			return version
		}
		
		/** Checks if version from future. */
		fresh( peer: number, version: number ) {
			return version > ( this.get( peer ) ?? 0 )
		}
		
		/** Checks if clock from future. */
		ahead( clock: $hyoo_crowd_clock ) {
			
			for( const [ peer, version ] of this.entries() ) {
				if( clock.fresh( peer, version ) ) return true
			}
			
			return false
		}
		
		/** Gererates new version for peer that greated then other seen. */
		tick( peer: number ) {
			return this.see( peer, this.version_max + 1 )
		}
			
	}
	
}
