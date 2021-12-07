namespace $ {
	
	/** Independent part of data. 64+B */
	export type $hyoo_crowd_chunk = {
	
		/** Identifier of head node. 6B */
		readonly head: number,
		
		/** Self identifier inside head after prev. 6B */
		readonly self: number,
		
		/** Identifier of prev node. 6B */
		readonly prev: number,
		
		/** Identifier of next node. 6B */
		readonly next: number,
		
		/** Global unique identifier of peer. 6B */
		readonly peer: number,
		
		/** Monotonic version clock. 4B */
		readonly time: number,
		
		/** Associated atomic data. 2+B */
		readonly data: unknown,
		
	}
	
	const meta_size = 36
	
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
		
		pack4[3] = raw.prev
		pack2[8] = raw.prev / 2**32
		
		pack2[9] = raw.next
		pack4[5] = raw.next / 2**16

		pack4[6] = raw.peer
		pack2[14] = raw.peer / 2**32
		
		pack2[15] = data.length
		
		pack4[8] = raw.time
		
		pack.set( data, meta_size )
		
		return pack
	}
	
	export function $hyoo_crowd_chunk_unpack(
		this: $,
		pack: Uint8Array,
	) {
		
		const pack2 = new Uint16Array( pack.buffer, pack.byteOffset, pack.byteLength / 2 )
		const pack4 = new Uint32Array( pack.buffer, pack.byteOffset, pack.byteLength / 4 )
		
		const chunk: $hyoo_crowd_chunk = { 
			head: pack4[0] + pack2[2] * 2**32,
			self: pack2[3] + pack4[2] * 2**16,
			prev: pack4[3] + pack2[8] * 2**32,
			next: pack2[9] + pack4[5] * 2**16,
			peer: pack4[6] + pack2[14] * 2**32,
			time: pack4[8],
			data: JSON.parse(
				$mol_charset_decode(
					new Uint8Array( pack.buffer, pack.byteOffset + meta_size, pack2[15] )
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
