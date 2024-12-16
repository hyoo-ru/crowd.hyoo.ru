namespace $ {
	
	export type $hyoo_crowd_unit_id = `${ $mol_int62_string }!${ $mol_int62_string }`
	
	const level = $mol_data_enum( 'level', $hyoo_crowd_peer_level )
	
	export enum $hyoo_crowd_unit_kind {
		
		/** Grab Land by King */
		grab,
		
		/** Join Peer to Land */
		join,
		
		/* Give Level for Peer for Land */
		give,
		
		/** Add Data to Land by joined Peer with right Level */
		data,
		
	}
	
	export enum $hyoo_crowd_unit_group {
		
		/** Join and Give units */
		auth = 0,
		
		/** Data units */
		data = 1,
		
	}
	
	/** Independent part of data. */
	export class $hyoo_crowd_unit extends Object {
		
		constructor(
	
			/** Identifier of land. */
			readonly land: $mol_int62_string,
			
			/** Identifier of auth. */
			readonly auth: $mol_int62_string,
			
			
			/** Identifier of head node. */
			readonly head: $mol_int62_string,
			
			/** Self identifier inside head after prev before next. */
			readonly self: $mol_int62_string,
			
			
			/** Identifier of next node. */
			readonly next: $mol_int62_string,
			
			/** Identifier of prev node. */
			readonly prev: $mol_int62_string,
			
			
			/** Monotonic real clock. 4B / info = 31b */
			readonly time: number,
			
			/** type-size = bin<0 | null=0 | json>0 */
			/** Associated atomic data. mem = 4B+ / bin = (0|8B)+ / type-size-info = 16b */
			readonly data: unknown,
			
			public bin: $hyoo_crowd_unit_bin | null
			
		) {
			super()
		}
		
		kind() {
			
			if( this.head === this.self && this.auth === this.self ) {
				if( this.head === this.land ) {
					return $hyoo_crowd_unit_kind.grab
				} else {
					return $hyoo_crowd_unit_kind.join
				}
			}
			
			if( this.head === this.land ) {
				return  $hyoo_crowd_unit_kind.give
			}
			
			return $hyoo_crowd_unit_kind.data
		}
		
		group() {
			return this.kind() === $hyoo_crowd_unit_kind.data
				? $hyoo_crowd_unit_group.data
				: $hyoo_crowd_unit_group.auth
		}
		
		level() {
			switch( this.kind() ) {
				case $hyoo_crowd_unit_kind.grab: return $hyoo_crowd_peer_level.law
				case $hyoo_crowd_unit_kind.give: return level( this.data as any )
				default: $mol_fail( new Error( `Wrong unit kind for getting level: ${ this.kind() }` ) )
			}
		}
		
		[Symbol.toPrimitive]() {
			return JSON.stringify( this )
		}
		
		[ $mol_dev_format_head ]() {
			
			switch( this.kind() ) {
				
				case $hyoo_crowd_unit_kind.grab:
					return $mol_dev_format_div( {},
						$mol_dev_format_native( this ),
						' 👑',
					)
				
				case $hyoo_crowd_unit_kind.join:
					return $mol_dev_format_div( {},
						$mol_dev_format_native( this ),
						$mol_dev_format_shade(
							' 🔑 ',
							this.self,
						),
					)
				
				case $hyoo_crowd_unit_kind.give:
					return $mol_dev_format_div( {},
						$mol_dev_format_native( this ),
						$mol_dev_format_shade(
							' 🏅 ',
							this.self,
							' ',
						),
						$mol_dev_format_native( $hyoo_crowd_peer_level[ this.data as number ] ?? this.data ),
					)
				
				case $hyoo_crowd_unit_kind.data:
					return $mol_dev_format_div( {},
						$mol_dev_format_native( this ),
						$mol_dev_format_shade(
							' 📦 ',
							this.head,
							'!',
							this.self,
							' ',
						),
						$mol_dev_format_native( this.data ),
					)
				
			}
			
		}
		
	}
	
	const offset = {
		
		land_lo: 0,
		land_hi: 4,
		auth_lo: 8,
		auth_hi: 12,
		
		head_lo: 16,
		head_hi: 20,
		self_lo: 24,
		self_hi: 28,
		
		next_lo: 32,
		next_hi: 36,
		prev_lo: 40,
		prev_hi: 44,
		
		time: 48,
		size: 54,
		data: 56,
		
	} as const
	
	export class $hyoo_crowd_unit_bin extends DataView< ArrayBuffer > {
		
		static from_buffer( buffer: Int16Array ) {
			const size = Math.ceil( Math.abs( buffer[ offset.size / 2 ] ) / 8 ) * 8 + offset.data + $mol_crypto_auditor_sign_size
			return new this( buffer.slice( 0, size / 2 ).buffer )
		}
		
		static from_unit( unit: $hyoo_crowd_unit ) {
			
			if( unit.bin ) return unit.bin
			
			const type = unit.data === null
				? 0
				: unit.data instanceof Uint8Array
					? -1
					: 1
			
			const buff = type === 0 ? null
				: type > 0 ? $mol_charset_encode( JSON.stringify( unit.data ) )
				: unit.data as Uint8Array
			
			const size = buff?.byteLength ?? 0
			if( type > 0 && size > 2**15 - 1 ) throw new Error( `Too large json data: ${size} > ${ 2**15 - 1 }` )
			if( type < 0 && size > 2**15 ) throw new Error( `Too large binary data: ${size} > ${ 2**15 }` )
			
			const total = offset.data + Math.ceil( size / 8 ) * 8 + $mol_crypto_auditor_sign_size
			
			const mem = new Uint8Array( total )
			const bin = new $hyoo_crowd_unit_bin( mem.buffer )
			
			const land = $mol_int62_from_string( unit.land )!
			bin.setInt32( offset.land_lo, land.lo, true )
			bin.setInt32( offset.land_hi, land.hi, true )
			const auth = $mol_int62_from_string( unit.auth )!
			bin.setInt32( offset.auth_lo, auth.lo, true )
			bin.setInt32( offset.auth_hi, auth.hi, true )
			
			const head = $mol_int62_from_string( unit.head )!
			bin.setInt32( offset.head_lo, head.lo, true )
			bin.setInt32( offset.head_hi, head.hi, true )
			const self = $mol_int62_from_string( unit.self )!
			bin.setInt32( offset.self_lo, self.lo, true )
			bin.setInt32( offset.self_hi, self.hi, true )
			
			const next = $mol_int62_from_string( unit.next )!
			bin.setInt32( offset.next_lo, next.lo, true )
			bin.setInt32( offset.next_hi, next.hi, true )
			const prev = $mol_int62_from_string( unit.prev )!
			bin.setInt32( offset.prev_lo, prev.lo, true )
			bin.setInt32( offset.prev_hi, prev.hi, true )
			
			bin.setInt32( offset.time, unit.time, true )
			bin.setInt16( offset.size, type * size, true )
			
			if( buff ) mem.set( buff, offset.data )
			
			return bin
		}
		
		sign( next?: Uint8Array ) {
			
			const sign_offset = this.byteOffset + this.byteLength - $mol_crypto_auditor_sign_size
			
			const buff = new Uint8Array(
				this.buffer,
				sign_offset,
				$mol_crypto_auditor_sign_size,
			)
			
			if( !next ) return buff
			
			buff.set( next )
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
			return Math.ceil( Math.abs( this.getInt16( offset.size, true ) ) / 8 ) * 8 + offset.data + $mol_crypto_auditor_sign_size
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
				this.byteOffset,
				this.size() - $mol_crypto_auditor_sign_size,
			)
		}
		
		unit(): $hyoo_crowd_unit {
			
			const land = $mol_int62_to_string({
				lo: this.getInt32( offset.land_lo, true ) << 1 >> 1,
				hi: this.getInt32( offset.land_hi, true ) << 1 >> 1,
			})
			const auth = $mol_int62_to_string({
				lo: this.getInt32( offset.auth_lo, true ) << 1 >> 1,
				hi: this.getInt32( offset.auth_hi, true ) << 1 >> 1,
			})
			
			const head = $mol_int62_to_string({
				lo: this.getInt32( offset.head_lo, true ) << 1 >> 1,
				hi: this.getInt32( offset.head_hi, true ) << 1 >> 1,
			})
			const self = $mol_int62_to_string({
				lo: this.getInt32( offset.self_lo, true ) << 1 >> 1,
				hi: this.getInt32( offset.self_hi, true ) << 1 >> 1,
			})
			
			const next = $mol_int62_to_string({
				lo: this.getInt32( offset.next_lo, true ) << 1 >> 1,
				hi: this.getInt32( offset.next_hi, true ) << 1 >> 1,
			})
			const prev = $mol_int62_to_string({
				lo: this.getInt32( offset.prev_lo, true ) << 1 >> 1,
				hi: this.getInt32( offset.prev_hi, true ) << 1 >> 1,
			})
			
			const time = this.getInt32( offset.time, true ) << 1 >> 1
			const type_size = this.getInt16( offset.size, true )
			
			let data = null as unknown
			
			if( type_size ) {
				
				try {
					var buff = new Uint8Array( this.buffer, this.byteOffset + offset.data, Math.abs( type_size ) )
				} catch( error: any ) {
					error['message'] += `\nhead=${head};self=${self}`
					$mol_fail_hidden( error )
				}
				
				if( type_size < 0 ) data = buff
				else data = JSON.parse( $mol_charset_decode( buff ) )
				
			}
			
			return new $hyoo_crowd_unit(
				land, auth,
				head, self,
				next, prev,
				time, data,
				this,
			)
			
		}
		
	}
	
	export function $hyoo_crowd_unit_compare(
		left: $hyoo_crowd_unit,
		right: $hyoo_crowd_unit,
	) {
		return ( left.group() - right.group() )
			|| ( left.time - right.time )
			
			|| ( ( left.auth > right.auth ) ? 1 : ( left.auth < right.auth ) ? -1 : 0 )
			|| ( ( left.self > right.self ) ? 1 : ( left.self < right.self ) ? -1 : 0 )
			|| ( ( left.head > right.head ) ? 1 : ( left.head < right.head ) ? -1 : 0 )
			|| ( ( left.prev > right.prev ) ? 1 : ( left.prev < right.prev ) ? -1 : 0 )
			|| ( ( left.next > right.next ) ? 1 : ( left.next < right.next ) ? -1 : 0 )
			|| ( ( left.land > right.land ) ? 1 : ( left.land < right.land ) ? -1 : 0 )
			
	}
	
}
