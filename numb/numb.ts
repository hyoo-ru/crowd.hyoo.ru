namespace $ {
	
	/** CROWD Counter */
	export class $hyoo_crowd_numb extends $hyoo_crowd_store {
		
		stores = new Map< number, $hyoo_crowd_reg >()
		
		value() {
			
			let res = 0
			
			for( const store of this.stores.values() ) {
				res += store.numb()
			}
			
			return res
		}
		
		numb() {
			return this.value()
		}
		
		delta(
			clock = new $hyoo_crowd_clock,
			delta = this.clock.delta( [], [] ),
		) {
			
			for( const store of this.stores.values() ) {
				
				const patch = store.delta( clock )
				if( patch.values.length === 0 ) continue
				
				delta.values.push( ... patch.values )
				delta.stamps.push( ... patch.stamps )
			}
			
			return delta
		}
		
		reg( path: number ) {
			
			let store = this.stores.get( path )
			if( store ) return store
			
			store = new $hyoo_crowd_reg( this.clock )
			this.stores.set( path, store )
			
			return store
		}
		
		shift( diff = 1 ) {
			
			const store = this.reg( this.clock.peer )
			const prev = Number( store.numb() )
			
			store.numb( prev + diff )
			
			return this
		}
		
		apply(
			delta: ReturnType< typeof $hyoo_crowd_delta >,
		) {
			
			for( let i = 0 ; i < delta.values.length; ++ i ) {
				
				const peer = this.clock.peer_from( delta.stamps[i] )
				
				this.reg( peer ).apply(
					$hyoo_crowd_delta(
						[ delta.values[i] ],
						[ delta.stamps[i] ],
						delta.clock,
					)
				)
				
			}
			
			return this
		}
		
	}
	
}
