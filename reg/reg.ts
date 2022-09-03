namespace $ {
	export class $hyoo_crowd_reg extends $hyoo_crowd_node {
		
		/** Atomic value. */
		value( next?: unknown ) {
			
			const units = this.units()
			let last
			
			for( const unit of units ) {
				if( !last || $hyoo_crowd_unit_compare( unit, last ) > 0 ) last = unit
			}
			
			if( next === undefined ) {
				
				return last?.data ?? null
				
			} else {
				
				if( last?.data === next ) return next
				
				for( const unit of units ) {
					if( unit === last ) continue
					this.land.wipe( unit )
				}
				
				const self = last?.self ?? this.land.id_new()
				
				this.land.put(
					this.head,
					self,
					'0_0',
					next,
				)
			
				return next
			}
			
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
			king_level: $hyoo_crowd_peer_level,
			base_level: $hyoo_crowd_peer_level,
		) {
			
			const world = this.world()
			
			let land_id = ( this.value() ?? '0_0' ) as $mol_int62_string
			if( land_id !== '0_0' ) return world.land_sync( land_id )
			
			if( this.land.level( this.land.peer().id ) < $hyoo_crowd_peer_level.add ) return null
			
			const land = $mol_wire_sync( world ).grab( king_level, base_level )
			this.value( land.id() )
			
			return land
		}
		
	}
}
