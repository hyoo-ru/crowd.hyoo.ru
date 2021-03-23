namespace $ {
	
	/** CROWD Dictionary */
	export class $hyoo_crowd_dict<
		Fields extends Record< string, typeof $hyoo_crowd_store >
	> extends $hyoo_crowd_store {
		
		static of<
			Types extends Record< string, typeof $hyoo_crowd_store >
		>(
			Types: Types,
		) {
			return class Tuple extends this<Types> {
				Fields = Types
			}
		}
		
		Fields!: Fields
		
		stores = new Map< $hyoo_crowd_delta_value, InstanceType< Fields[string] > >()
		
		has( key: $hyoo_crowd_delta_value ) {
			return this.stores.has( key )
		}
		
		for< Field extends Extract< keyof Fields, string > | $hyoo_crowd_delta_value >(
			key: Field
		): InstanceType<
			Fields[
				Field extends keyof Fields ? Field : keyof Fields
			]
		> {
			
			let store = this.stores.get( key )
			if( store ) return store as any
			
			const Type = this.Fields[ String( key ?? '' ) ] || Object.values( this.Fields )[0]
			store = new Type( this.clock ) as InstanceType< Fields[string] >
			
			this.stores.set( key, store )
			return store as any
			
		}
		
		delta( clock = new $hyoo_crowd_clock ) {
			
			const delta = $hyoo_crowd_delta([],[])
			
			for( let [ key, value ] of this.stores ) {
				
				const patch = value.delta( clock )
				if( patch.values.length === 0 ) continue
				
				delta.values.push( key )
				for( const val of patch.values ) delta.values.push( val )
				
				delta.stamps.push( - patch.values.length )
				for( const stamp of patch.stamps ) delta.stamps.push( stamp )
				
			}
			
			return delta
		}
				
		apply(
			delta: ReturnType< typeof $hyoo_crowd_delta >
		) {
			
			let key: $hyoo_crowd_delta_value
			let count = 0
			let patch = $hyoo_crowd_delta([],[])
			
			const dump = ()=> {
				if( patch.values.length === 0 ) return
				this.for( key ).apply( patch )
				patch = $hyoo_crowd_delta([],[])
			}
			
			for( let i = 0; i < delta.values.length; ++i ) {
				
				const val = delta.values[i]
				const stamp = delta.stamps[i]
				
				if( count === 0 ) {
					
					dump()
					key = val
					count = - stamp
					continue
					
				} else {
					
					patch.values.push( val )
					patch.stamps.push( stamp )
					-- count
					
				}
				
			}
			
			dump()
			
			return this
		}
		
	}
	
}
