namespace $ {
	export class $hyoo_crowd_world extends Object {
		
		constructor(
			readonly peer: $hyoo_crowd_peer
		) {
			super()
			this._knights.set( peer.id , peer )
		}
		
		readonly lands_pub = new $mol_wire_pub
		
		_lands = new $mol_dict<
			$mol_int62_pair,
			$hyoo_crowd_land
		>()
		
		get lands() {
			this.lands_pub.promote()
			return this._lands
		}
		
		land(
			id: $mol_int62_pair,
		) {
			
			const exists = this._lands.get( id )
			if( exists ) return exists
			
			const land = new $hyoo_crowd_land( id, this.peer )
			this._lands.set( id, land )
			this.lands_pub.emit()
			
			return land
		}
		
		_knights = new $mol_dict<
			$mol_int62_pair,
			$hyoo_crowd_peer
		>()
		
		_signs = new WeakMap< $hyoo_crowd_unit, Uint8Array >()
		
		async grab() {
			
			const knight = await $hyoo_crowd_peer.generate()
			this._knights.set( knight.id, knight )
			
			const land_outer = new $hyoo_crowd_land( knight.id, knight )
			land_outer.level( this.peer.id, $hyoo_crowd_peer_level.law )
			
			const land_inner = this.land( land_outer.id )
			land_inner.apply( land_outer.delta() )
			
			return land_inner
		}
		
		async delta_land( land: $hyoo_crowd_land, clock = new $hyoo_crowd_clock ) {
			
			const units = land.delta( clock )
			if( !units.length ) return []
			
			// let size = 0
			// const bins = [] as $hyoo_crowd_unit_bin[]
			
			for( const unit of units ) {
				
				if( !unit.bin ) {
				
					const bin = $hyoo_crowd_unit_bin.from( unit )
					
					let sign = this._signs.get( unit )
					if( !sign ) {
						const knight = this._knights.get( unit.auth() )!
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
		
		async delta( clocks = new $mol_dict< $mol_int62_pair, $hyoo_crowd_clock >() ) {
			
			const delta = [] as $hyoo_crowd_unit[]
			
			for( const land of this.lands.values() ) {
				const units = await this.delta_land( land, clocks.get( land.id ) )
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
			
			const land = this.land( unit.land() )
			
			try {
				await this.audit( land, unit )
			} catch( error: any ) {
				return error.message as string
			}
		
			land.apply([ unit ])
			
			return ''
		}
		
		async audit(
			land: $hyoo_crowd_land,
			unit: $hyoo_crowd_unit,
		) {
			
			const bin = unit.bin!
				
			const desync = 60 * 60 // 1 hour
			const deadline = land.clock.now() + desync
			
			if( unit.time > deadline ) {
				$mol_fail( new Error( 'Far future' ) )
			}
			
			const auth_unit = land.unit( unit.auth(), unit.auth() )
			const kind = unit.kind()
			
			switch( kind ) {
				
				case 'join': {
				
					if( auth_unit ) {
						$mol_fail( new Error( 'Already join' ) )
					}
					
					if(!( unit.data instanceof Uint8Array )) {
						$mol_fail( new Error( 'No join key' ) )
					}
					
					const key_buf = unit.data
					const self = $mol_int62_hash_buffer( key_buf )
					
					if( unit.self_lo !== self.lo || unit.self_hi !== self.hi ) {
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
				
				case 'give': {
					
					const king_unit = land.unit( land.id, land.id )
					
					if( !king_unit ) {
						$mol_fail( new Error( 'No king' ) )
					}
					
					const give_unit = land.unit( land.id, unit.self() )
					
					if( give_unit?.level() as number > unit.level() ) {
						$mol_fail( new Error( `Revoke unsupported` ) )
					}
					
					if( unit.auth_lo === king_unit.auth_lo && unit.auth_hi === king_unit.auth_hi ) break
					
					const lord_unit = land.unit( land.id, unit.auth() )
					
					if( lord_unit?.level() !== $hyoo_crowd_peer_level.law ) {
						$mol_fail( new Error( `Need law level` ) )
					}
					
					break
				}
				
				case 'data': {
				
					const king_unit = land.unit( land.id, land.id )
					
					if( !king_unit ) {
						$mol_fail( new Error( 'No king' ) )
					}
					
					if( unit.auth_lo === king_unit.auth_lo && unit.auth_hi === king_unit.auth_hi ) break
					
					direct: {
						
						const give_unit = land.unit( land.id, unit.auth() )
						const level = give_unit?.level() ?? $hyoo_crowd_peer_level.get
						
						if( level >= $hyoo_crowd_peer_level.mod ) break
						
						if( level === $hyoo_crowd_peer_level.add ) {
							
							const exists = land.unit( unit.head(), unit.self() )
							if( !exists ) break
							
							if( exists.auth_lo === unit.auth_lo && exists.auth_hi === unit.auth_hi ) break
							
						}
						
					}
					
					fallback: {
						
						const give_unit = land.unit( land.id, { lo: 0, hi: 0 } )
						const level = give_unit?.level() ?? $hyoo_crowd_peer_level.get
						
						if( level >= $hyoo_crowd_peer_level.mod ) break
						
						if( level === $hyoo_crowd_peer_level.add ) {
							
							const exists = land.unit( unit.head(), unit.self() )
							if( !exists ) break
							
							if( exists.auth_lo === unit.auth_lo && exists.auth_hi === unit.auth_hi ) break
							
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
