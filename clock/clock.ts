namespace $ {
	
	/** Vector clock. Stores real timestamps. */
	export class $hyoo_crowd_clock extends Map<
		$mol_int62_string,
		number
	> {
		
		static begin = -1 * 2**30
		
		/** Maximum time for all peers. */
		last_time = $hyoo_crowd_clock.begin
		
		constructor(
			entries?: Iterable<
				readonly [ $mol_int62_string, number ]
			>
		) {
			
			super( entries )
			if( !entries ) return
			
			for( const [ peer, time ] of entries ) {
				this.see_time( time )
			}
			
		}
		
		/** Synchronize this cloc with another. */
		sync( right: $hyoo_crowd_clock ) {
			for( const [ peer, time ] of right ) {
				this.see_peer( peer, time )
			}
		}
		
		/** Increase `last` to latest. */
		see_time( time: number ) {
			if( time < this.last_time ) return
			this.last_time = time
		}
		
		/** Add new `time` for `peer` and increase `last`. */
		see_peer(
			peer: $mol_int62_string,
			time: number,
		) {
			
			if( !this.fresh( peer, time ) ) return
			
			this.set( peer, time )
			this.see_time( time )
			
		}
		
		see_bin( bin: $hyoo_crowd_clock_bin, group: $hyoo_crowd_unit_group ) {
			
			for( let cursor = offset.clocks; cursor < bin.byteLength; cursor += 16 ) {
				
				this.see_peer(
					$mol_int62_to_string({
						lo: bin.getInt32( cursor + 0, true ) << 1 >> 1,
						hi: bin.getInt32( cursor + 4, true ) << 1 >> 1,
					}),
					bin.getInt32( cursor + 8 + 4 * group, true )
				)
				
			}

		}
		
		/** Checks if time from future. */
		fresh(
			peer: $mol_int62_string,
			time: number,
		) {
			return time > this.time( peer )
		}
		
		/** Checks if this clock from future of another. */
		ahead( clock: $hyoo_crowd_clock ) {
			
			for( const [ peer, time ] of this ) {
				if( clock.fresh( peer, time ) ) return true
			}
			
			return false
		}
		
		time( peer: $mol_int62_string ) {
			return this.get( peer ) ?? $hyoo_crowd_clock.begin
		}
		
		now() {
			return $hyoo_crowd_time_now()
		}
		
		last_stamp() {
			return  $hyoo_crowd_time_stamp( this.last_time )
		}
		
		/** Gererates new time for peer that greater then other seen. */
		tick( peer: $mol_int62_string ) {
			
			let time = this.now()
			
			if( time <= this.last_time ) {
				time = this.last_time + 1
			}
			
			this.see_peer( peer, time )
			
			return time
		}
		
		[ $mol_dev_format_head ]() {
			return $mol_dev_format_span( {} ,
				$mol_dev_format_native( this ) ,
				$mol_dev_format_shade( ' ' + new Date( this.last_stamp() ).toISOString().replace( 'T', ' ' ) ) ,
			)
		}
		
	}
	
	const offset = {
		
		land_lo: 0,
		land_hi: 4,
		
		clocks: 8,
		
	} as const
	
	export class $hyoo_crowd_clock_bin extends DataView {
		
		static from(
			land: $mol_int62_pair,
			clocks: readonly[ $hyoo_crowd_clock, $hyoo_crowd_clock ]
		) {
			
			const size = offset.clocks + clocks[0].size * 16
			const mem = new Uint8Array( size )
			const bin = new $hyoo_crowd_clock_bin( mem.buffer )
			
			bin.setInt32( offset.land_lo, land.lo ^ ( 1 << 31 ), true )
			bin.setInt32( offset.land_hi, land.hi, true )
			
			let cursor = offset.clocks
			for( const [ peer_id, time ] of clocks[0] ) {
				
				const peer = $mol_int62_from_string( peer_id )
				
				bin.setInt32( cursor + 0, peer.lo, true )
				bin.setInt32( cursor + 4, peer.hi, true )
				bin.setInt32( cursor + 8, time, true )
				bin.setInt32( cursor + 12, clocks[1].get( peer_id ) ?? $hyoo_crowd_clock.begin, true )
				
				cursor += 16
			}
			
			return bin
		}
		
		land() {
			return {
				lo: this.getInt32( offset.land_lo, true ) << 1 >> 1,
				hi: this.getInt32( offset.land_hi, true ) << 1 >> 1,
			}
		}
		
	}
	
}
