namespace $ {
	
	export class $hyoo_crowd_store {
		
		public static make< Instance >(
			this : new()=> Instance
		) : Instance {
			return new this()
		}
		
		constructor(
			public stamper = new $hyoo_crowd_stamper,
		) { }
		
		toJSON( version_min?: number ): ReturnType< typeof $hyoo_crowd_delta > {
			return $hyoo_crowd_delta([],[])
		}
		
		delta( base: this ) {
			return this.toJSON( base.stamper.version_max )
		}
		
		apply( delta: ReturnType< typeof $hyoo_crowd_delta > ): this {
			return this
		}
		
		fork( peer: number ): this {
			const Fork = this.constructor as new( stamper: $hyoo_crowd_stamper )=> this
			const fork = new Fork( this.stamper.fork( peer ) ) as this
			fork.apply( this.toJSON() )
			return fork
		}
		
	}
	
}
