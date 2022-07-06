namespace $ {
	
	const min = [ $mol_int62_min, 1 - 2**16 ]
	
	/** Vector clock. Stores real timestamps. */
	export class $hyoo_crowd_clock extends Map<
		`${string}_${string}`,
		[ number, number ]
	> {
		
		/** Maximum time for all peers. */
		last_hi = min[0]
		last_lo = min[1]
		
		constructor( entries?: Iterable< readonly [ `${string}_${string}`, [ number, number ] ] > ) {
			
			super( entries )
			if( !entries ) return
			
			for( const [ peer, [ time_hi, time_lo ] ] of entries ) {
				this.see_time( time_hi, time_lo )
			}
			
		}
		
		/** Synchronize this cloc with another. */
		sync( right: $hyoo_crowd_clock ) {
			for( const [ peer, [ time_hi, time_lo ] ] of right ) {
				this.see_peer( peer, time_hi, time_lo )
			}
		}
		
		/** Increase `now` to latest. */
		see_time( time_hi: number, time_lo: number ) {
			
			if( $mol_int62_compare( this.last_hi, this.last_lo, time_hi, time_lo ) <= 0 ) return
			
			this.last_hi = time_hi
			this.last_lo = time_lo
			
		}
		
		/** Add new `time` for `peer` and increase `now`. */
		see_peer( peer: `${string}_${string}`, time_hi: number, time_lo: number ) {
			
			if( !this.fresh( peer, time_hi, time_lo ) ) return
			
			this.set( peer, [ time_hi, time_lo ] )
			this.see_time( time_hi, time_lo )
			
		}
		
		/** Checks if time from future. */
		fresh( peer: `${string}_${string}`, time_hi: number, time_lo: number ) {
			const [ peer_hi, peer_lo ] = this.get( peer ) ?? min
			return $mol_int62_compare( peer_hi, peer_lo, time_hi, time_lo ) > 0
		}
		
		/** Checks if this clock from future of another. */
		ahead( clock: $hyoo_crowd_clock ) {
			
			for( const [ peer, [ time_hi, time_lo ] ] of this.entries() ) {
				if( clock.fresh( peer, time_hi, time_lo ) ) return true
			}
			
			return false
		}
		
		time( peer: `${string}_${string}` ) {
			return this.get( peer ) ?? min
		}
		
		now() {
			
			const now = Date.now()
			
			let next_lo = now % 1000
			let next_hi = ( now - next_lo ) / 1000 - 2**31
			next_lo = next_lo * 60 - 30_000
			
			return [ next_hi, next_lo ]
		}
		
		/** Gererates new time for peer that greater then other seen. */
		tick( peer: `${string}_${string}` ) {
			
			let [ next_hi, next_lo ] = this.now()
			
			if( $mol_int62_compare( this.last_hi, this.last_lo, next_hi, next_lo ) <= 0 ) {
				[ next_hi, next_lo ] = $mol_int62_inc( this.last_hi, this.last_lo, 30_000 )
			}
			
			this.see_peer( peer, next_hi, next_lo )
			
			return [ next_hi, next_lo ]
		}
		
	}
	
}
