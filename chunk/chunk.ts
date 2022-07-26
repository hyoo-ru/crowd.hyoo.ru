namespace $ {
	
	export type $hyoo_crowd_chunk_id = {
		readonly head: $mol_int62_pair,
		readonly self: $mol_int62_pair,
	}
	
	const level = $mol_data_enum( 'level', $hyoo_crowd_peer_level )
	
	/** Independent part of data. mem >= 80B / bin >= 32B + 48B */
	export class $hyoo_crowd_chunk extends Object {
		
		constructor(
	
			/** Cyclic counter. mem = 4B / bin = 2B / info = 16b */
			readonly spin: number,
			
			/** Monotonic real clock. 4B / info = 31b */
			readonly time: number,
			
			/** Identifier of land. 8B / info = 62b */
			readonly land_lo: number,
			readonly land_hi: number,
			
			
			/** Identifier of auth. 8B / info = 62b */
			readonly auth_lo: number,
			readonly auth_hi: number,
			
			/** Identifier of head node. 8B / info = 62b */
			readonly head_lo: number,
			readonly head_hi: number,
			
			
			/** Identifier of next node. 8B / info = 62b */
			readonly next_lo: number,
			readonly next_hi: number,
			
			/** Identifier of prev node. 8B / info = 62b */
			readonly prev_lo: number,
			readonly prev_hi: number,
			
			
			/** Self identifier inside head after prev before next. 8B / info = 62b */
			readonly self_lo: number,
			readonly self_hi: number,
			
			/** type-size = bin<0 | null=0 | json>0 */
			/** Associated atomic data. mem = 4B+ / bin = (0|8B)+ / type-size-info = 16b */
			readonly data: unknown,
			
		) {
			super()
		}
		
		id(): $hyoo_crowd_chunk_id { return { head: this.head(), self: this.self() } }
		
		land(): $mol_int62_pair { return { lo: this.land_lo, hi: this.land_hi } }
		auth(): $mol_int62_pair { return { lo: this.auth_lo, hi: this.auth_hi } }
		head(): $mol_int62_pair { return { lo: this.head_lo, hi: this.head_hi } }
		next(): $mol_int62_pair { return { lo: this.next_lo, hi: this.next_hi } }
		prev(): $mol_int62_pair { return { lo: this.prev_lo, hi: this.prev_hi } }
		self(): $mol_int62_pair { return { lo: this.self_lo, hi: this.self_hi } }
		
		kind() {
			
			// head === self === auth
			if( this.head_lo === this.self_lo && this.head_hi === this.self_hi ) {
				if( this.auth_lo === this.self_lo && this.auth_hi === this.self_hi ) {
					return 'join' // join peer to land for data auth
				}
			}
			
			// head === land
			if( this.head_lo === this.land_lo && this.head_hi === this.land_hi ) {
				return 'give' // give rights for land to another peer
			}
			
			return 'data' // add data to land by auth peer
		}
		
		level() {
			return level( this.data as any )
		}
		
		[Symbol.toPrimitive]() {
			return JSON.stringify( this )
		}
		
	}
	
	const offset = {
		
		sign: 0,
		sens: 32,
		
		meta: 32,
		size: 32,
		spin: 34,
		time: 36,
		land_lo: 40,
		land_hi: 44,
		
		auth_lo: 48,
		auth_hi: 52,
		head_lo: 56,
		head_hi: 60,
		
		next_lo: 64,
		next_hi: 68,
		prev_lo: 72,
		prev_hi: 76,
		
		self_lo: 80,
		self_hi: 84,
		
		data: 88,
		
	} as const
	
	export class $hyoo_crowd_chunk_bin extends DataView {
		
		static from( chunk: $hyoo_crowd_chunk ) {
			
			const type = chunk.data === null
				? 0
				: chunk.data instanceof Uint8Array
					? -1
					: 1
			
			const buff = type === 0 ? null
				: type > 0 ? $mol_charset_encode( JSON.stringify( chunk.data ) )
				: chunk.data as Uint8Array
			
			const size = buff?.byteLength ?? 0
			if( type > 0 && size > 2**15 - 1 ) throw new Error( `Too large json data: ${size} > ${ 2**15 - 1 }` )
			if( type < 0 && size > 2**15 ) throw new Error( `Too large binary data: ${size} > ${ 2**15 }` )
			
			const total = offset.data + Math.ceil( size / 8 ) * 8
			
			const mem = new Uint8Array( total )
			const bin = new $hyoo_crowd_chunk_bin( mem.buffer )
			
			bin.setInt16( offset.size, type * size, true )
			bin.setUint16( offset.spin, chunk.spin, true )
			bin.setUint32( offset.time, chunk.time, true )
			bin.setInt32( offset.land_lo, chunk.land_lo, true )
			bin.setInt32( offset.land_hi, chunk.land_hi, true )
			
			bin.setInt32( offset.auth_lo, chunk.auth_lo, true )
			bin.setInt32( offset.auth_hi, chunk.auth_hi, true )
			bin.setInt32( offset.head_lo, chunk.head_lo, true )
			bin.setInt32( offset.head_hi, chunk.head_hi, true )
			
			bin.setInt32( offset.next_lo, chunk.next_lo, true )
			bin.setInt32( offset.next_hi, chunk.next_hi, true )
			bin.setInt32( offset.prev_lo, chunk.prev_lo, true )
			bin.setInt32( offset.prev_hi, chunk.prev_hi, true )
			
			bin.setInt32( offset.self_lo, chunk.self_lo, true )
			bin.setInt32( offset.self_hi, chunk.self_hi, true )
			
			if( buff ) mem.set( buff, offset.data )
			
			return bin
		}
		
		sign( next?: Uint8Array ) {
			
			const buff = new Uint8Array( this.buffer, this.byteOffset + offset.sign, offset.meta - offset.sign )
			
			if( !next ) return buff
			
			buff.set( next, this.byteOffset + offset.sign )
			return buff
			
		}
		
		// land( next?: $mol_int62_pair ) {
			
		// 	if( next ) {
				
		// 		this.setInt32( offset.land_lo, next.lo, true )
		// 		this.setInt32( offset.land_hi, next.hi, true )
		// 		return next
				
		// 	} else {
				
		// 		return {
		// 			lo: this.getInt32( offset.land_lo, true ),
		// 			hi: this.getInt32( offset.land_hi, true ),
		// 		}
				
		// 	}

		// }
		
		size() {
			return Math.ceil( Math.abs( this.getInt16( offset.size, true ) ) / 8 ) * 8 + offset.data
		}
		
		// data() {
		// 	const info = this.getUint16( offset.data )
		// 	const size = Math.abs( info )
		// 	const buf = new Uint8Array( this.buffer, this.byteOffset + offset.sens, size )
		// 	const data = info > 0 ? JSON.parse( $mol_charset_decode( buf ) ) : info < 0 ? buf : null
		// 	return data
		// }
		
		sens() {
			return new Uint8Array(
				this.buffer,
				this.byteOffset + offset.sens,
				this.size() - offset.sens,
			)
		}
		
		chunk(): $hyoo_crowd_chunk {
			
			const type_size = this.getInt16( this.byteOffset + offset.size, true )
			const spin = this.getUint16( this.byteOffset + offset.spin, true )
			const time = this.getUint32( this.byteOffset + offset.time, true )
			const land_lo = this.getInt32( this.byteOffset + offset.land_lo, true )
			const land_hi = this.getInt32( this.byteOffset + offset.land_hi, true )
			
			const auth_lo = this.getInt32( this.byteOffset + offset.auth_lo, true )
			const auth_hi = this.getInt32( this.byteOffset + offset.auth_hi, true )
			const head_lo = this.getInt32( this.byteOffset + offset.head_lo, true )
			const head_hi = this.getInt32( this.byteOffset + offset.head_hi, true )
			
			const prev_lo = this.getInt32( this.byteOffset + offset.prev_lo, true )
			const prev_hi = this.getInt32( this.byteOffset + offset.prev_hi, true )
			const next_lo = this.getInt32( this.byteOffset + offset.next_lo, true )
			const next_hi = this.getInt32( this.byteOffset + offset.next_hi, true )
			
			const self_lo = this.getInt32( this.byteOffset + offset.self_lo, true )
			const self_hi = this.getInt32( this.byteOffset + offset.self_hi, true )
			
			let data = null as unknown
			
			if( type_size ) {
				
				const buff = new Uint8Array( this.buffer, this.byteOffset + offset.data, Math.abs( type_size ) )
				
				if( type_size < 0 ) data = buff
				else data = JSON.parse( $mol_charset_decode( buff ) )
				
			}
			
			return new $hyoo_crowd_chunk(
				
				spin,
				time,
				land_lo,
				land_hi,
				
				auth_lo,
				auth_hi,
				head_lo,
				head_hi,
				
				next_lo,
				next_hi,
				prev_lo,
				prev_hi,
				
				self_lo,
				self_hi,
				
				data,
				
			)
			
		}
		
	}
	
	export function $hyoo_crowd_chunk_compare(
		left: $hyoo_crowd_chunk,
		right: $hyoo_crowd_chunk,
	) {
		return ( left.time - right.time )
			|| ( left.spin - right.spin )
			
			|| ( left.auth_hi - right.auth_hi )
			|| ( left.auth_lo - right.auth_lo )
			
			|| ( left.self_hi - right.self_hi )
			|| ( left.self_lo - right.self_lo )
			|| ( left.head_hi - right.head_hi )
			|| ( left.head_lo - right.head_lo )
			
			|| ( left.prev_hi - right.prev_hi )
			|| ( left.prev_lo - right.prev_lo )
			|| ( left.next_hi - right.next_hi )
			|| ( left.next_lo - right.next_lo )
			
			|| ( left.land_hi - right.land_hi )
			|| ( left.land_lo - right.land_lo )
			
	}
	
}
