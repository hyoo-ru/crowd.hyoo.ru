namespace $ {
	
	/** Independent part of data. 64+B */
	export class $hyoo_crowd_node {
		
		constructor(
			
			/** Global unique node identifier. 6B */
			readonly guid: number,
			
			/** Guid of parent node. 6B */
			readonly parent: $hyoo_crowd_node['guid'],
			
			/** Guid of leader node. 6B */
			readonly leader: $hyoo_crowd_node['guid'],
			
			/** Global unique peer identifier. 6B */
			readonly peer: number,
			
			/** Monotonic version. 6B */
			readonly version: number,
			
			/** Associated atomic data. 2+B */
			readonly data: unknown,
			
			/** Sign for whole node data. 32B */
			readonly sign: null | Uint8Array & { length: 32 } = null,
		
		) {}
		
		get deleted() {
			return this.data === null
		}
		
		updated(
			peer: number,
			version: number,
			data: unknown,
		) {
			return new $hyoo_crowd_node(
				this.guid,
				this.parent,
				this.leader,
				peer,
				version,
				data,
			)
		}
		
		wiped(
			peer: number,
			version: number,
		) {
			return this.updated( peer, version, null )
		}
		
	}
	
}
