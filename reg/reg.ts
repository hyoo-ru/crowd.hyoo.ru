namespace $ {
	export class $hyoo_crowd_reg extends $hyoo_crowd_node {
		
		/** Atomic value. */
		value( next?: unknown ) {
			
			const unit = this.units()[0]
			if( next === undefined ) return unit?.data ?? null
				
			if( unit?.data === next ) return next
			
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
		
		@ $mol_action
		yoke(
			king_level: $hyoo_crowd_peer_level,
			base_level: $hyoo_crowd_peer_level,
		) {
			
			const world = this.world()!
			
			let land_id = ( this.value() ?? '0_0' ) as $mol_int62_string
			if( land_id !== '0_0' ) return world.land_sync( land_id )
			
			if( this.land.level( this.land.peer().id ) < $hyoo_crowd_peer_level.add ) return null
			
			const land = $mol_wire_sync( world ).grab( king_level, base_level )
			this.value( land.id() )
			
			return land
		}
		
	}
}
