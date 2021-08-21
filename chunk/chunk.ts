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
		
		/** Monotonic version clock. 4B */
		readonly time: number,
		
		/** Associated atomic data. 2+B */
		readonly data: unknown,
		
	}
	
	const meta_size = 32
	
	export function $hyoo_crowd_chunk_pack(
		this: $,
		raw: $hyoo_crowd_chunk,
	) {
		
		const data = $mol_charset_encode( JSON.stringify( raw.data ) )
		const pack = new Uint8Array( meta_size + data.length + ( 4 - data.length % 4 ) )
		const pack2 = new Uint16Array( pack.buffer )
		const pack4 = new Uint32Array( pack.buffer )
		
		pack4[0] = raw.head
		pack2[2] = raw.head / 2**32
		
		pack2[3] = raw.self
		pack4[2] = raw.self / 2**16
		
		pack4[3] = raw.lead
		pack2[8] = raw.lead / 2**32
		
		pack2[9] = raw.seat
		
		pack4[5] = raw.peer
		pack2[12] = raw.peer / 2**32
		
		pack2[13] = data.length
		
		pack4[7] = raw.time
		
		pack.set( data, 32 )
		
		return pack
	}
	
	export function $hyoo_crowd_chunk_unpack(
		this: $,
		pack: Uint8Array,
	) {
		
		const pack2 = new Uint16Array( pack.buffer )
		const pack4 = new Uint32Array( pack.buffer )
		
		const chunk: $hyoo_crowd_chunk = { 
			head: pack4[0] + pack2[2] * 2**32,
			self: pack2[3] + pack4[2] * 2**16,
			lead: pack4[3] + pack2[8] * 2**32,
			seat: pack2[9],
			peer: pack4[5] + pack2[12] * 2**32,
			time: pack4[7],
			data: JSON.parse(
				$mol_charset_decode(
					new Uint8Array( pack.buffer, meta_size, pack2[13] )
				)
			),
		}
		
		return chunk
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
