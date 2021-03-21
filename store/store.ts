namespace $ {
	
	export class $hyoo_crowd_store {
		
		public static make< Instance >(
			this : new()=> Instance
		) : Instance {
			return new this()
		}
		
		constructor(
			public clock = new $hyoo_crowd_clock,
		) { }
		
		toJSON( version_min?: number ): ReturnType< typeof $hyoo_crowd_delta > {
			return $hyoo_crowd_delta([],[])
		}
		
		delta( base: this ) {
			return this.toJSON( base.clock.version_max )
		}
		
		apply( delta: ReturnType< typeof $hyoo_crowd_delta > ): this {
			return this
		}
		
		fork( peer: number ): this {
			const Fork = this.constructor as new( clock: $hyoo_crowd_clock )=> this
			const fork = new Fork( this.clock.fork( peer ) ) as this
			fork.apply( this.toJSON() )
			return fork
		}
		
	}
	
}
