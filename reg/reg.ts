namespace $ {
	export class $hyoo_crowd_reg extends $hyoo_crowd_node {
		
		/** Atomic value. */
		value( next?: unknown ) {
			
			const unit = this.units()[0]
			if( next === undefined ) return unit?.data ?? null
				
			if( $mol_compare_deep( unit?.data, next ) ) return next
			
			this.land.put(
				this.head,
				unit?.self ?? this.land.id_new(),
				'0_0',
				next,
			)
		
			return next
		}
		
		/** Atomic string. */
		str( next?: string ) {
			return String( this.value( next ) ?? '' )
		}
		
		/** Atomic number. */
		numb( next?: number ) {
			return Number( this.value( next ) )
		}
		
		/** Atomic boolean. */
		bool( next?: boolean ) {
			return Boolean( this.value( next ) )
		}
		
		yoke(
			law = [''] as readonly ( $mol_int62_string | '' )[],
			mod = [] as readonly ( $mol_int62_string | '' )[],
			add = [] as readonly ( $mol_int62_string | '' )[],
		) {
			
			const world = this.world()!
			
			let land_id = $mol_int62_string_ensure( this.value() )
			if( land_id !== '0_0' ) return world.land_sync( land_id )
			
			if( this.land.level( this.land.peer().id ) < $hyoo_crowd_peer_level.add ) return null
			
			const land = $mol_wire_sync( world ).grab( law, mod, add )
			
			this.value( land.id() )
			world.land_init( land )
			
			return land
		}
		
	}
}
