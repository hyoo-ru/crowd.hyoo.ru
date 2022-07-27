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
				
				const self = last?.self() ?? this.land.id_new()
				
				this.land.put(
					this.head,
					self,
					{ lo: 0, hi: 0 },
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
			return Number( this.value( next ) ?? 0 )
		}
		
		/** Atomic boolean. */
		bool( next?: boolean ) {
			return Boolean( this.value( next ) ?? false )
		}
		
	}
}
