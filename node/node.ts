namespace $ {
	
	/** Independent part of data. 64+B */
	export class $hyoo_crowd_node {
		
		constructor(
			
			/** Global unique node identifier. */
			readonly guid: '' | `/${ string }`,
			
			/** Local unique identifier of leader node. */
			readonly leader: string,
			
			/** Offset at the time of the update. 2B */
			public offset: number,
			
			/** Global unique identifier of peer. 6B */
			readonly peer: number,
			
			/** Monotonic version. 6B */
			readonly version: number,
			
			/** Associated atomic data. 2+B */
			readonly data: unknown,
			
			/** Sign for whole node data. 32B */
			// readonly sign: null | Uint8Array & { length: 32 },
		
		) {}
		
		get luid() {
			return this.guid.replace( /.*\//, '' )
		}
		
		get parent() {
			return this.guid.replace( /\/[^/]+$/, '' ) as $hyoo_crowd_node['guid']
		}
		
		get deleted() {
			return this.data === null
		}
		
		prefer( node: $hyoo_crowd_node ) {
			if( this.version > node.version ) return true
			if( this.version < node.version ) return false
			return this.peer > node.peer
		}
		
	}
	
}
