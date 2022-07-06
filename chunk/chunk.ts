namespace $ {
	
	/** Independent part of data. mem >= 64B + 64B / bin >= 120B */
	export type $hyoo_crowd_chunk = {
	
		/** Identifier of nest. 8B / info = 62b */
		readonly nest_hi: number,
		readonly nest_lo: number,
		
		/** Identifier of head node. 8B / info = 62b */
		readonly head_hi: number,
		readonly head_lo: number,
		
		/** Self identifier inside head after prev. 8B / info = 62b */
		readonly self_hi: number,
		readonly self_lo: number,
		
		/** Identifier of prev node. 8B / info = 62b */
		readonly prev_hi: number,
		readonly prev_lo: number,
		
		/** Identifier of next node. 8B / info = 62b */
		readonly next_hi: number,
		readonly next_lo: number,
		
		/** Identifier of peer. 8B / info = 62b */
		readonly peer_hi: number,
		readonly peer_lo: number,
		
		/** Monotonic hybrid version clock. mem = 8B / bin = 6B / info = 47b */
		readonly time_hi: number,
		readonly time_lo: number,
		
		/** Associated atomic data. mem = 4B+ / bin = 2B+ / size-info = 16b */
		readonly data: unknown,
		
	}
	
	export const $hyoo_crowd_chunk_bin_meta_size = 88
	export const $hyoo_crowd_chunk_bin_size_offset = 86
	
	export enum $hyoo_crowd_chunk_bin_id {
		nest = 32,
		head = 40,
		self = 48,
		prev = 56,
		next = 64,
		peer = 72,
	}
	
	export class $hyoo_crowd_chunk_bin extends DataView {
	
		sign( next?: Uint8Array ) {
			if( next ) {
				new Uint8Array( this.buffer ).set( next, this.byteOffset )
				return next
			} else {
				return new Uint8Array( this.buffer, this.byteOffset, $mol_crypto_auditor_sign_size )
			}
		}
		
		id_hi( id: $hyoo_crowd_chunk_bin_id, next?: number ) {
			if( next === undefined ) {
				return this.getInt32( id )
			} else {
				this.setInt32( id, next )
				return next
			}
		}
		
		id_lo( id: $hyoo_crowd_chunk_bin_id, next?: number ) {
			if( next === undefined ) {
				return this.getInt32( id + 4 )
			} else {
				this.setInt32( id + 4, next )
				return next
			}
		}
		
		time_hi( next?: number ) {
			if( next === undefined ) {
				return this.getInt32( 80 )
			} else {
				this.setInt32( 80, next )
				return next
			}
		}
		
		time_lo( next?: number ) {
			if( next === undefined ) {
				return this.getInt16( 84 )
			} else {
				this.setInt16( 84, next )
				return next
			}
		}
		
		size() {
			return Math.abs( this.getInt16( $hyoo_crowd_chunk_bin_size_offset ) )
		}
		
		data() {
			const info = this.getInt16( $hyoo_crowd_chunk_bin_size_offset )
			const size = Math.abs( info )
			const buf = new Uint8Array( this.buffer, this.byteOffset + $hyoo_crowd_chunk_bin_meta_size, size )
			const data = info > 0 ? JSON.parse( $mol_charset_decode( buf ) ) : info < 0 ? buf : null
			return data
		}
		
		sens() {
			return new Uint8Array(
				this.buffer,
				this.byteOffset + $mol_crypto_auditor_sign_size,
				$hyoo_crowd_chunk_bin_meta_size - $mol_crypto_auditor_sign_size + this.size(),
			)
		}
		
		chunk() {
			
			const chunk: $hyoo_crowd_chunk = { 
			
				nest_hi: this.id_hi( $hyoo_crowd_chunk_bin_id.nest ),
				nest_lo: this.id_lo( $hyoo_crowd_chunk_bin_id.nest ),
	
				head_hi: this.id_hi( $hyoo_crowd_chunk_bin_id.head ),
				head_lo: this.id_lo( $hyoo_crowd_chunk_bin_id.head ),
	
				self_hi: this.id_hi( $hyoo_crowd_chunk_bin_id.self ),
				self_lo: this.id_lo( $hyoo_crowd_chunk_bin_id.self ),
	
				prev_hi: this.id_hi( $hyoo_crowd_chunk_bin_id.prev ),
				prev_lo: this.id_lo( $hyoo_crowd_chunk_bin_id.prev ),
	
				next_hi: this.id_hi( $hyoo_crowd_chunk_bin_id.next ),
				next_lo: this.id_lo( $hyoo_crowd_chunk_bin_id.next ),
	
				peer_hi: this.id_hi( $hyoo_crowd_chunk_bin_id.peer ),
				peer_lo: this.id_lo( $hyoo_crowd_chunk_bin_id.peer ),
	
				time_hi: this.time_hi(),
				time_lo: this.time_lo(),
				
				data: this.data(),
				
			}
			
			return chunk
		}
		
		static from( chunk: $hyoo_crowd_chunk ) {
			
			const type = chunk.data === null
				? 0
				: chunk.data instanceof Uint8Array
					? -1
					: 1
					
			const buf = type > 0
				? $mol_charset_encode( JSON.stringify( chunk.data ) )
				: type < 0
					? chunk.data as Uint8Array
					: null
			
			const size = buf?.length ?? 0
			if( size > 2**15 ) throw new Error( `Too long data ${size}` )
			
			const mem = new Uint8Array( Math.ceil( ( $hyoo_crowd_chunk_bin_meta_size + size ) / 8 ) * 8 )
			const bin = new $hyoo_crowd_chunk_bin( mem.buffer )
			
			bin.setInt16( $hyoo_crowd_chunk_bin_size_offset, size * type )
			if( buf ) mem.set( buf, mem.byteOffset + $hyoo_crowd_chunk_bin_meta_size )
			
			bin.id_hi( $hyoo_crowd_chunk_bin_id.nest, chunk.nest_hi )
			bin.id_lo( $hyoo_crowd_chunk_bin_id.nest, chunk.nest_lo )
	
			bin.id_hi( $hyoo_crowd_chunk_bin_id.head, chunk.head_hi )
			bin.id_lo( $hyoo_crowd_chunk_bin_id.head, chunk.head_lo )
	
			bin.id_hi( $hyoo_crowd_chunk_bin_id.self, chunk.self_hi )
			bin.id_lo( $hyoo_crowd_chunk_bin_id.self, chunk.self_lo )
	
			bin.id_hi( $hyoo_crowd_chunk_bin_id.prev, chunk.prev_hi )
			bin.id_lo( $hyoo_crowd_chunk_bin_id.prev, chunk.prev_lo )
	
			bin.id_hi( $hyoo_crowd_chunk_bin_id.next, chunk.next_hi )
			bin.id_lo( $hyoo_crowd_chunk_bin_id.next, chunk.next_lo )
	
			bin.id_hi( $hyoo_crowd_chunk_bin_id.peer, chunk.peer_hi )
			bin.id_lo( $hyoo_crowd_chunk_bin_id.peer, chunk.peer_lo )
	
			bin.time_hi( chunk.time_hi )
			bin.time_lo( chunk.time_lo )
			
			return bin
		}
		
	}
	
	export function $hyoo_crowd_chunk_compare(
		left: $hyoo_crowd_chunk,
		right: $hyoo_crowd_chunk,
	) {
		return ( left.time_hi - right.time_hi )
			|| ( left.time_lo - right.time_lo )
			
			|| ( left.peer_hi - right.peer_hi )
			|| ( left.peer_lo - right.peer_lo )
		
			|| ( left.self_hi - right.self_hi )
			|| ( left.self_lo - right.self_lo )
			
			|| ( left.head_hi - right.head_hi )
			|| ( left.head_lo - right.head_lo )
			
			|| ( left.prev_hi - right.prev_hi )
			|| ( left.prev_lo - right.prev_lo )
			
			|| ( left.next_hi - right.next_hi )
			|| ( left.next_lo - right.next_lo )
			
			|| ( left.nest_hi - right.nest_hi )
			|| ( left.nest_lo - right.nest_lo )
	}
	
	export function $hyoo_crowd_chunk_auth(
		chunk: $hyoo_crowd_chunk,
	) {
		return chunk.head_hi === chunk.self_hi
			&& chunk.head_lo === chunk.self_lo
			&& chunk.peer_hi === chunk.self_hi
			&& chunk.peer_lo === chunk.self_lo
	}
	
}
