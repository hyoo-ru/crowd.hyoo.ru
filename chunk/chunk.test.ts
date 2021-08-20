namespace $ {
	$mol_test({
		
		async 'pack and unpack chunk'( $ ) {
			
			const pair = await $.$mol_crypto_auditor_pair()
			
			const source: $hyoo_crowd_chunk = {
				head: 6618611909121,
				self: 6618611909121,
				lead: 6618611909121,
				seat: 400,
				peer: 6618611909121,
				time: 67305985,
				data: { a: [ 1 ] },
			}
			
			const packed = await $.$hyoo_crowd_chunk_pack( source, pair.private )
			const unpacked = $.$hyoo_crowd_chunk_unpack( packed )
			
			$mol_assert_like( source, unpacked )
			$mol_assert_ok( await $.$hyoo_crowd_chunk_verify( packed, pair.public ) )
			
		},
		
	})
}
