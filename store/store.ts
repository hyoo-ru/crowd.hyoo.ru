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
		
		delta(
			clock = new $hyoo_crowd_clock,
			delta = $hyoo_crowd_delta([],[]),
		): ReturnType< typeof $hyoo_crowd_delta > {
			return delta
		}
		
		toJSON() {
			return this.delta()
		}
		
		apply( delta: ReturnType< typeof $hyoo_crowd_delta > ): this {
			return this
		}
		
		fork( peer: number ): this {
			const Fork = this.constructor as new( clock: $hyoo_crowd_clock )=> this
			const fork = new Fork( this.clock.fork( peer ) ) as this
			fork.apply( this.delta() )
			return fork
		}
		
	}
	
}
