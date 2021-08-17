namespace $ {
	
	/** Independent part of data. 66+B */
	export class $hyoo_crowd_chunk {
		
		constructor(
			
			/** Identifier of head node. 6B */
			readonly head: number,
			
			/** Self identifier inside head after lead. 6B */
			readonly self: number,
			
			/** Identifier of lead node. 6B */
			readonly lead: number,
			
			/** Offset at the time of the update. 2B */
			public seat: number,
			
			/** Global unique identifier of peer. 6B */
			readonly peer: number,
			
			/** Monotonic version clock. 6B */
			readonly time: number,
			
			/** Associated atomic data. 1+B */
			readonly data: unknown,
			
			/** Sign for whole node data. 32B */
			// readonly sign: null | Uint8Array & { length: 32 },
		
		) {}
		
		get guid() {
			return `${ this.head }/${ this.self }` as const
		}
		
		get deleted() {
			return this.data === null
		}
		
		prefer( node: $hyoo_crowd_chunk ) {
			if( this.time > node.time ) return true
			if( this.time < node.time ) return false
			return this.peer > node.peer
		}
		
	}
	
}
