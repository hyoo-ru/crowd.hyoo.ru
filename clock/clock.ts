namespace $ {
	
	/** Vector clock. Stores real timestamps. */
	export class $hyoo_crowd_clock extends $mol_dict<
		$mol_int62_pair,
		[ number, number ]
	> {
		
		/** Maximum time for all peers. */
		last_spin = 0
		last_time = -1 * 2**30
		
		constructor(
			entries?: Iterable<
				readonly [
					$mol_int62_pair,
					[ number, number ]
				]
			>
		) {
			
			super( entries )
			if( !entries ) return
			
			for( const [ peer, [ spin, time ] ] of entries ) {
				this.see_time( spin, time )
			}
			
		}
		
		/** Synchronize this cloc with another. */
		sync( right: $hyoo_crowd_clock ) {
			for( const [ peer, [ spin, time ] ] of right ) {
				this.see_peer( peer, spin, time )
			}
		}
		
		/** Increase `last` to latest. */
		see_time(
			spin: number,
			time: number,
		) {
			
			if( time < this.last_time ) return
			if( time === this.last_time && spin < this.last_spin ) return
			
			this.last_time = time
			this.last_spin = spin
			
		}
		
		/** Add new `time` for `peer` and increase `last`. */
		see_peer(
			peer: $mol_int62_pair,
			spin: number,
			time: number,
		) {
			
			if( !this.fresh( peer, spin, time ) ) return
			
			this.set( peer, [ spin, time ] )
			this.see_time( spin, time )
			
		}
		
		/** Checks if time from future. */
		fresh(
			peer: $mol_int62_pair,
			spin: number,
			time: number,
		) {
			
			const [ peer_spin, peer_time ] = this.time( peer )
			
			if( time > peer_time ) return true
			if( time === peer_time && spin > peer_spin ) return true
			
			return false
		}
		
		/** Checks if this clock from future of another. */
		ahead( clock: $hyoo_crowd_clock ) {
			
			for( const [ peer, [ spin, time ] ] of this ) {
				if( clock.fresh( peer, spin, time ) ) return true
			}
			
			return false
		}
		
		time( peer: $mol_int62_pair ) {
			return this.get( peer ) ?? [ 0, -1 * 2**31 ]
		}
		
		now() {
			return Math.floor( Date.now() / 1000 ) - 2**31
		}
		
		last_stamp() {
			return ( this.last_time + 2**31 ) * 1000
		}
		
		/** Gererates new time for peer that greater then other seen. */
		tick( peer: $mol_int62_pair ) {
			
			let time = this.now()
			let spin = 0
			
			if( time <= this.last_time ) {
				if( this.last_spin < 2**16 - 1 ) {
					time = this.last_time
					spin = Number( this.last_spin ) + 1
				} else {
					time = Number( this.last_time ) + 1
					spin = 0
				}
			}
			
			this.see_peer( peer, spin, time )
			
			return [ spin, time ] as const
		}
		
	}
	
}
