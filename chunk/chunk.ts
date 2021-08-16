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
			public offset: number,
			
			/** Global unique identifier of peer. 6B */
			readonly peer: number,
			
			/** Monotonic version. 6B */
			readonly version: number,
			
			/** Name inside parent. 1+B */
			readonly name: string,
			
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
			if( this.version > node.version ) return true
			if( this.version < node.version ) return false
			return this.peer > node.peer
		}
		
	}
	
}
