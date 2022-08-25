namespace $ {
	export class $hyoo_crowd_world extends $mol_object2 {
		
		constructor(
			readonly peer?: $hyoo_crowd_peer
		) {
			super()
			if( peer ) this._knights.set( peer.id , peer )
		}
		
		readonly lands_pub = new $mol_wire_pub
		
		_lands = new $mol_dict<
			$mol_int62_string,
			$hyoo_crowd_land
		>()
		
		get lands() {
			this.lands_pub.promote()
			return this._lands
		}
		
		land_init( id: $mol_int62_string ) { }
		
		land(
			id: $mol_int62_string,
		) {
			
			const exists = this._lands.get( id )
			if( exists ) return exists
			
			const land = $hyoo_crowd_land.make({
				id: $mol_const( id ),
				world: $mol_const( this ),
			})
			
			this._lands.set( id, land )
			this.lands_pub.emit()
			
			return land
		}
		
		land_sync(
			id: $mol_int62_string,
		) {
			const land = this.land( id )
			this.land_init( id )
			return land
		}
		
		home() {
			return this.land_sync( this.peer!.id )
		}
		
		_knights = new $mol_dict<
			$mol_int62_string,
			$hyoo_crowd_peer
		>()
		
		_signs = new WeakMap< $hyoo_crowd_unit, Uint8Array >()
		
		async grab(
			king_level = $hyoo_crowd_peer_level.law,
			base_level = $hyoo_crowd_peer_level.get,
		) {
			
			if( !king_level && !base_level ) $mol_fail( new Error( 'Grabbing dead land' ) )
			
			const knight = await $hyoo_crowd_peer.generate()
			this._knights.set( knight.id, knight )
			
			const land_inner = this.land( knight.id )
			const land_outer = $hyoo_crowd_land.make({
				id: $mol_const( knight.id ),
				peer: $mol_const( knight ),
			})
			
			land_outer.level( this.peer!.id, king_level )
			land_outer.level_base( base_level )
			
			land_inner.apply( land_outer.delta() )
			
			return land_inner
		}
		
		async delta_land(
			land: $hyoo_crowd_land,
			clocks = [ new $hyoo_crowd_clock, new $hyoo_crowd_clock ] as const
		) {
			
			const units = land.delta( clocks )
			if( !units.length ) return []
			
			// let size = 0
			// const bins = [] as $hyoo_crowd_unit_bin[]
			
			for( const unit of units ) {
				
				if( !unit.bin ) {
				
					const bin = $hyoo_crowd_unit_bin.from( unit )
					
					let sign = this._signs.get( unit )
					if( !sign ) {
						const knight = this._knights.get( unit.auth )!
						sign = new Uint8Array( await knight.key_private.sign( bin.sens() ) )
					}
					
					bin.sign( sign )
					unit.bin = bin
					this._signs.set( unit, sign )
				
				}
				
				// bins.push( bin )
				// yield unit
				// size += unit.bin.byteLength
				// if( size > 2 ** 15 ) break
			}
			
			// const delta = new Uint8Array( size )
			
			// let offset = 0
			// for( const bin of bins ) {
			// 	delta.set( new Uint8Array( bin.buffer ), offset )
			// 	offset += bin.byteLength
			// }
			
			// yield delta
			return units
		}
		
		async delta( clocks = new Map< $mol_int62_string, readonly[ $hyoo_crowd_clock, $hyoo_crowd_clock ] >() ) {
			
			const delta = [] as $hyoo_crowd_unit[]
			
			for( const land of this.lands.values() ) {
				const units = await this.delta_land( land, clocks.get( land.id() ) )
				delta.push( ... units )
			}
			
			return delta
		}
		
		async apply(
			delta: Uint8Array,
		) {
			
			const broken = [] as [ $hyoo_crowd_unit, string ][]
			
			let bin_offset = 0
			while( bin_offset < delta.byteLength ) {
				
				const bin = new $hyoo_crowd_unit_bin( delta.buffer, delta.byteOffset + bin_offset )
				const unit = bin.unit()
				
				const error = await this.apply_unit( unit )
				if( error ) broken.push([ unit, error ])
				
				bin_offset += bin.size()
				
			}
			
			return broken
		}
		
		async apply_unit(
			unit: $hyoo_crowd_unit,
		) {
			
			const land = this.land( unit.land )
			
			try {
				await this.audit( unit )
			} catch( error: any ) {
				return error.message as string
			}
		
			land.apply([ unit ])
			
			return ''
		}
		
		async audit(
			unit: $hyoo_crowd_unit,
		) {
			
			const land = this.land( unit.land )
			const bin = unit.bin!
				
			const desync = 60 * 60 * 10 // 1 hour
			const deadline = land.clock_data.now() + desync
			
			if( unit.time > deadline ) {
				$mol_fail( new Error( 'Far future' ) )
			}
			
			const auth_unit = land.unit( unit.auth, unit.auth )
			const kind = unit.kind()
			
			switch( kind ) {
				
				case $hyoo_crowd_unit_kind.grab:
				case $hyoo_crowd_unit_kind.join: {
				
					if( auth_unit ) {
						$mol_fail( new Error( 'Already join' ) )
					}
					
					if(!( unit.data instanceof Uint8Array )) {
						$mol_fail( new Error( 'No join key' ) )
					}
					
					const key_buf = unit.data
					const self = $mol_int62_to_string( $mol_int62_hash_buffer( key_buf ) )
					
					if( unit.self !== self ) {
						$mol_fail( new Error( 'Alien join key' ) )
					}
					
					const key = await $mol_crypto_auditor_public.from( key_buf )
					const sign = bin.sign()
					const valid = await key.verify( bin.sens(), sign )
					
					if( !valid ) {
						$mol_fail( new Error( 'Wrong join sign' ) )
					}
					
					this._signs.set( unit, sign )

					return
				}
				
				case $hyoo_crowd_unit_kind.give: {
					
					const king_unit = land.unit( land.id(), land.id() )
					
					if( !king_unit ) $mol_fail( new Error( 'No king' ) )
					if( unit.auth === king_unit.auth ) break
					
					const lord_level = land.level( unit.auth )
					if( lord_level !== $hyoo_crowd_peer_level.law ) {
						$mol_fail( new Error( `Need law level` ) )
					}
					
					const peer_level = land.level( unit.auth )
					if( peer_level > unit.level() ) {
						$mol_fail( new Error( `Revoke unsupported` ) )
					}
					
					break
				}
				
				case $hyoo_crowd_unit_kind.data: {
				
					const king_unit = land.unit( land.id(), land.id() )
					
					if( !king_unit ) {
						$mol_fail( new Error( 'No king' ) )
					}
					
					if( unit.auth === king_unit.auth ) break
					
					direct: {
						
						const give_unit = land.unit( land.id(), unit.auth )
						const level = give_unit?.level() ?? $hyoo_crowd_peer_level.get
						
						if( level >= $hyoo_crowd_peer_level.mod ) break
						
						if( level === $hyoo_crowd_peer_level.add ) {
							
							const exists = land.unit( unit.head, unit.self )
							if( !exists ) break
							
							if( exists.auth === unit.auth ) break
							
						}
						
					}
					
					fallback: {
						
						const give_unit = land.unit( land.id(), '0_0' )
						const level = give_unit?.level() ?? $hyoo_crowd_peer_level.get
						
						if( level >= $hyoo_crowd_peer_level.mod ) break
						
						if( level === $hyoo_crowd_peer_level.add ) {
							
							const exists = land.unit( unit.head, unit.self )
							if( !exists ) break
							
							if( exists.auth === unit.auth ) break
							
						}
						
					}
					
					$mol_fail( new Error( `No rights` ) )
				}
				
			}
			
			if( !auth_unit ) {
				$mol_fail( new Error( 'No auth key' ) )
			}
			
			const key_buf = auth_unit.data as Uint8Array
			const key = await $mol_crypto_auditor_public.from( key_buf )
			const sign = bin.sign()
			const valid = await key.verify( bin.sens(), sign )
			
			if( !valid ) {
				$mol_fail( new Error( 'Wrong auth sign' ) )
			}
			
			this._signs.set( unit, sign )
			
		}
		
	}
}
