namespace $ {
	export class $hyoo_crowd_world extends $mol_object2 {
		
		constructor(
			readonly peer?: $hyoo_crowd_peer
		) {
			super()
			if( peer ) this._knights.set( peer.id , peer )
		}
		
		readonly lands_pub = new $mol_wire_pub
		
		_lands = new Map<
			$mol_int62_string,
			$hyoo_crowd_land
		>()
		
		get lands() {
			this.lands_pub.promote()
			return this._lands
		}
		
		land_init( id: $hyoo_crowd_land ) { }
		
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
			this.land_init( land )
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
			law = [''] as readonly ( $mol_int62_string | '' )[],
			mod = [] as readonly ( $mol_int62_string | '' )[],
			add = [] as readonly ( $mol_int62_string | '' )[],
		) {
			
			if( !law.length && !mod.length && !add.length ) $mol_fail( new Error( 'Grabbing dead land' ) )
			
			const knight = await $hyoo_crowd_peer.generate()
			this._knights.set( knight.id, knight )
			
			const land_inner = this.land( knight.id )
			const land_outer = $hyoo_crowd_land.make({
				id: $mol_const( knight.id ),
				peer: $mol_const( knight ),
			})
			
			for( const peer of law ) land_outer.level( peer || this.peer!.id, $hyoo_crowd_peer_level.law )
			for( const peer of mod ) land_outer.level( peer || this.peer!.id, $hyoo_crowd_peer_level.mod )
			for( const peer of add ) land_outer.level( peer || this.peer!.id, $hyoo_crowd_peer_level.add )
			
			land_inner.apply( land_outer.delta() )
			
			return land_inner
		}
		
		sign_units( units: readonly $hyoo_crowd_unit[] ) {
			
			return Promise.all( units.map( async( unit )=> {
				
				if( unit.bin ) return unit
				const bin = $hyoo_crowd_unit_bin.from_unit( unit )
				
				let sign = this._signs.get( unit )
				if( !sign ) {
					const knight = this._knights.get( unit.auth )!
					sign = new Uint8Array( await knight.key_private.sign( bin.sens() ) )
				}
				
				bin.sign( sign )
				unit.bin = bin
				this._signs.set( unit, sign )
				
				return unit
				
			} ) )
			
		}
		
		delta_land(
			land: $hyoo_crowd_land,
			clocks = [ new $hyoo_crowd_clock, new $hyoo_crowd_clock ] as const
		) {
			return this.sign_units( land.delta( clocks ) )
		}
		
		async delta_batch(
			land: $hyoo_crowd_land,
			clocks = [ new $hyoo_crowd_clock, new $hyoo_crowd_clock ] as const
		) {
			
			const units = await this.delta_land( land, clocks )
			
			let size = 0
			const bins = [] as $hyoo_crowd_unit_bin[]
			
			for( const unit of units ) {
				const bin = unit.bin!
				bins.push( bin )
				size += bin.byteLength
			}
			
			const batch = new Uint8Array( size )
				
			let offset = 0
			for( const bin of bins ) {
				batch.set( new Uint8Array( bin.buffer, bin.byteOffset, bin.byteLength ), offset )
				offset += bin.byteLength
			}
			
			return batch
		}
				
		async *delta( clocks = new Map< $mol_int62_string, readonly[ $hyoo_crowd_clock, $hyoo_crowd_clock ] >() ) {
			for( const land of this.lands.values() ) {
				yield await this.delta_batch( land, clocks.get( land.id() ) )
			}
		}
		
		async apply(
			delta: Uint8Array,
		) {
			
			const units = [] as $hyoo_crowd_unit[]
			
			let bin_offset = 0
			while( bin_offset < delta.byteLength ) {
				
				const buf = new Int16Array( delta.buffer, delta.byteOffset + bin_offset )
				const bin = $hyoo_crowd_unit_bin.from_buffer( buf )
				
				units.push( bin.unit() )
				bin_offset += bin.size()
				
			}
			
			const land = this.land( units[0].land )
			const report = await this.audit_delta( land, units )
			land.apply( report.allow )
			
			return report
		}
		
		async audit_delta(
			land: $hyoo_crowd_land,
			delta: $hyoo_crowd_unit[],
		) {
			
			const all = new Map<
				$hyoo_crowd_unit_id,
				$hyoo_crowd_unit
			>()
			
			const desync = 60 * 60 * 10 // 1 hour
			const deadline = land.clock_data.now() + desync
			
			const get_unit = ( id: $hyoo_crowd_unit_id )=> {
				return all.get( id ) ?? land._unit_all.get( id )
			}
			
			const get_level = ( head: $mol_int62_string, self: $mol_int62_string )=> {
				return get_unit( `${ head }/${ self }` )?.level()
					?? get_unit( `${ head }/0_0` )?.level()
					?? $hyoo_crowd_peer_level.get
			}
			
			const check_unit = async( unit: $hyoo_crowd_unit )=> {
			
				const bin = unit.bin!
					
				if( unit.time > deadline ) return 'Far future'
				
				const auth_unit = get_unit( `${ unit.auth }/${ unit.auth }` )
				const kind = unit.kind()
				
				switch( kind ) {
					
					case $hyoo_crowd_unit_kind.grab:
					case $hyoo_crowd_unit_kind.join: {
					
						const key_str = auth_unit?.data ?? unit.data
						if( typeof key_str !== 'string' ) return 'No join key'
						
						const self = $mol_int62_hash_string( key_str )
						
						if( unit.self !== self ) return 'Alien join key'
						
						const key = await $mol_crypto_auditor_public.from( key_str )
						const sign = bin.sign()
						const valid = await key.verify( bin.sens(), sign )
						
						if( !valid ) return 'Wrong join sign'
						
						all.set( `${ unit.head }/${ unit.auth }`, unit )
						this._signs.set( unit, sign )

						return ''
					}
					
					case $hyoo_crowd_unit_kind.give: {
						
						const lord_level = get_level( land.id(), unit.auth )
						if( lord_level < $hyoo_crowd_peer_level.law ) return `Level too low`
						
						const peer_level = get_level( land.id(), unit.self )
						if( peer_level > unit.level() ) return `Cancel unsupported`
						
						break
					}
					
					case $hyoo_crowd_unit_kind.data: {
					
						const level = get_level( land.id(), unit.auth )
						if( level >= $hyoo_crowd_peer_level.mod ) break
						
						if( level === $hyoo_crowd_peer_level.add ) {
							
							const exists = get_unit( `${ unit.head }/${ unit.self }` )
							if( !exists ) break
							
							if( exists.auth === unit.auth ) break
							
						}
						
						return `Level too low`
					}
					
				}
				
				const key_str = auth_unit?.data
				if( typeof key_str !== 'string' ) return 'No auth key'
				
				const key = await $mol_crypto_auditor_public.from( key_str )
				const sign = bin.sign()
				const valid = await key.verify( bin.sens(), sign )
				
				if( !valid ) return 'Wrong auth sign'
				
				all.set( `${ unit.head }/${ unit.self }`, unit )
				this._signs.set( unit, sign )
				
				return ''
			}
			
			const allow = [] as $hyoo_crowd_unit[]
			const forbid = new Map< $hyoo_crowd_unit, string >()
			
			const proceed_unit = async( unit: $hyoo_crowd_unit )=> {
				
				const error = await check_unit( unit )
					
				if( error ) forbid.set( unit, error )
				else allow.push( unit )
				
			}
			
			const tasks = [] as Promise<void>[]
			for( const unit of delta ) {
				
				const task = proceed_unit( unit )
				tasks.push( task )
				
				if( unit.group() === $hyoo_crowd_unit_group.auth ) await task
				
			}
			
			await Promise.all( tasks )
			
			return { allow, forbid }
		}
		
	}
}
