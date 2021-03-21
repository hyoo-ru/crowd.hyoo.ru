namespace $ {
	
	/** CROWD Tagged Union */
	export class $hyoo_crowd_union<
		Types extends Record< string, typeof $hyoo_crowd_store >
	> extends $hyoo_crowd_store {
		
		static of<
			Types extends Record< string, typeof $hyoo_crowd_store >
		>(
			Types: Types,
		) {
			return class Union extends this<Types> {
				Types = Types
			}
		}
		
		Types!: Types
		
		type_store = new $hyoo_crowd_reg_back( this.clock )
		value_store?: InstanceType< Types[string] >
		
		get type() {
			const type = this.type_store.value
			return type as keyof Types | null
		}
		
		as< Type extends keyof Types >( type: Type ): InstanceType< Types[ Type ] > | null {
			
			if( this.type !== type ) return null
			if( this.value_store ) return this.value_store as InstanceType< Types[ Type ] >
			
			return this.to( type )
		}
		
		to< Type extends keyof Types >( type: Type, stamp?: number ): InstanceType< Types[ Type ] > {
			
			if( this.type === type ) return this.as( type )!
			
			this.type_store.apply(
				$hyoo_crowd_delta(
					[ type as string ],
					[ stamp || - this.clock.generate() ],
				)
			)
			
			if( this.type !== type ) return this.as( this.type! )! as any
			
			const store = new this.Types[ type ]( this.clock )
			if( this.value_store ) store.apply( this.value_store.delta() )
			
			return this.value_store = store as any
		}
		
		delta( clock = new $hyoo_crowd_clock ) {
			
			const val = this.value_store?.delta( clock )
			if( val?.values.length === 0 ) return $hyoo_crowd_delta([],[])
			
			const type = this.type_store.delta()
			
			return $hyoo_crowd_delta(
				[
					... type.values,
					... val?.values ?? [],
				],
				[
					... type.stamps,
					... val?.stamps ?? [],
				],
			)
			
		}
				
		apply(
			delta: ReturnType< typeof $hyoo_crowd_delta >,
		) {
			
			if( delta.values.length === 0 ) return this

			let type = delta.values[0] as Extract< keyof Types, string >
			
			if( !this.Types[ type ] ) {
				type = Object.keys( this.Types )[0] as Extract< keyof Types, string >
				this.to( type ).apply( delta )
				return this
			}
			
			const store = this.to( type, delta.stamps[0] )
			
			store.apply(
				$hyoo_crowd_delta(
					delta.values.slice(1),
					delta.stamps.slice(1),
				)
			)
			
			return this
		}
		
	}
	
}
