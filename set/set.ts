namespace $ {
	
	/** CROWD Unordered Set */
	export class $hyoo_crowd_set extends $hyoo_crowd_store {
		
		protected readonly stamps = new Map< $hyoo_crowd_delta_value, number >()
		
		get count() {
			return this.items.length
		}
		
		get items() {
			const delta = this.delta()
			return delta.values.filter(
				( _, index )=> delta.stamps[ index ] > 0
			)
		}
		
		has( val: $hyoo_crowd_delta_value ) {
			return this.stamps.get( val )! > 0
		}
		
		version_item( val: $hyoo_crowd_delta_value ) {
			return this.clock.version_from( this.stamps.get( val ) ?? 0 )
		}
		
		delta( clock = new $hyoo_crowd_clock ) {
			
			const delta = $hyoo_crowd_delta([],[])
			
			for( const [ key, stamp ] of this.stamps ) {
				
				if( !clock.is_new( stamp ) ) continue
				
				delta.values.push( key )
				delta.stamps.push( stamp )
				
			}
			
			return delta
		}
		
		add(
			key: $hyoo_crowd_delta_value,
		) {
			
			if( this.has( key ) ) return this
			
			this.apply( $hyoo_crowd_delta(
				[ key ],
				[ this.clock.generate() ],
			) )
			
			return this
		}
		
		remove(
			key: $hyoo_crowd_delta_value
		) {
			
			if( !this.has( key ) ) return this
			
			this.apply( $hyoo_crowd_delta(
				[ key ],
				[ - this.clock.generate() ],
			) )
			
			return this
		}
		
		apply(
			delta: ReturnType< typeof $hyoo_crowd_delta >,
		) {
			
			for( let i = 0; i < delta.values.length; ++i ) {
				
				const key = delta.values[i]
				const stamp = delta.stamps[i]
				
				const version = this.clock.version_from( stamp )
				if( this.version_item( key ) >= version ) continue
				
				this.stamps.set( key, stamp )
				this.clock.feed( version )
				
			}
			
			return this
		}
		
	}
	
}
