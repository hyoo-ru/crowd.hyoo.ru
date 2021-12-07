namespace $ {
	$mol_test({
		
		'pack and unpack chunk'( $ ) {
			
			const source: $hyoo_crowd_chunk = {
				head: 6618611909121,
				self: 6618611909121,
				prev: 6618611909121,
				next: 6618611909121,
				peer: 6618611909121,
				time: 67305985,
				data: { a: [ 1 ] },
			}
			
			const packed = $.$hyoo_crowd_chunk_pack( source )
			const unpacked = $.$hyoo_crowd_chunk_unpack( packed )
			
			$mol_assert_like( source, unpacked )
			
		},
		
	})
}
