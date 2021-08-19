namespace $ {
	
	/** Independent part of data. 64+B */
	export type $hyoo_crowd_chunk = {
	
		/** Identifier of head node. 6B */
		readonly head: number,
		
		/** Self identifier inside head after lead. 6B */
		readonly self: number,
		
		/** Identifier of lead node. 6B */
		readonly lead: number,
		
		/** Offset at the time of the update. 2B */
		readonly seat: number,
		
		/** Global unique identifier of peer. 6B */
		readonly peer: number,
		
		/** Monotonic version clock. 6B */
		readonly time: number,
		
		/** Associated atomic data. */
		readonly data: unknown,
		
		/** Sign for whole node data. 32B */
		readonly sign?: Uint8Array & { length: 32 },
		
	}
	
	export function $hyoo_crowd_chunk_compare(
		left: $hyoo_crowd_chunk,
		right: $hyoo_crowd_chunk,
	) {
		if( left.time > right.time ) return 1
		if( left.time < right.time ) return -1
		return left.peer - right.peer
	}
	
}
