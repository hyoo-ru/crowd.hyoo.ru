namespace $ {
	
	type sign_size = $mol_type_assert< typeof $mol_crypto_auditor_sign_size, 32 >

	$mol_test({
		
		'pack and unpack chunk with json'( $ ) {
			
			const source: $hyoo_crowd_chunk = {
				nest_hi: $mol_int62_max,
				nest_lo: $mol_int62_max,
				head_hi: $mol_int62_max,
				head_lo: $mol_int62_max,
				self_hi: $mol_int62_max,
				self_lo: $mol_int62_max,
				prev_hi: $mol_int62_max,
				prev_lo: $mol_int62_max,
				next_hi: $mol_int62_max,
				next_lo: $mol_int62_max,
				peer_hi: $mol_int62_max,
				peer_lo: $mol_int62_max,
				time_hi: $mol_int62_max,
				time_lo: 30_000,
				data: { a: [ 1 ] },
			}
			
			const packed = $hyoo_crowd_chunk_bin.from( source )
			const unpacked = packed.chunk()
			
			$mol_assert_like( source, unpacked )
			
		},
		
		'pack and unpack chunk with bin'( $ ) {
			
			const source: $hyoo_crowd_chunk = {
				nest_hi: $mol_int62_min,
				nest_lo: $mol_int62_min,
				head_hi: $mol_int62_min,
				head_lo: $mol_int62_min,
				self_hi: $mol_int62_min,
				self_lo: $mol_int62_min,
				prev_hi: $mol_int62_min,
				prev_lo: $mol_int62_min,
				next_hi: $mol_int62_min,
				next_lo: $mol_int62_min,
				peer_hi: $mol_int62_min,
				peer_lo: $mol_int62_min,
				time_hi: $mol_int62_min,
				time_lo: -30_000,
				data: new Uint8Array([1,2,3]),
			}
			
			const packed = $hyoo_crowd_chunk_bin.from( source )
			const unpacked = packed.chunk()
			
			$mol_assert_like( source, unpacked )
			
		},
		
		'pack and unpack chunk with null'( $ ) {
			
			const source: $hyoo_crowd_chunk = {
				nest_hi: 0,
				nest_lo: 0,
				head_hi: 0,
				head_lo: 0,
				self_hi: 0,
				self_lo: 0,
				prev_hi: 0,
				prev_lo: 0,
				next_hi: 0,
				next_lo: 0,
				peer_hi: 0,
				peer_lo: 0,
				time_hi: 0,
				time_lo: 0,
				data: null,
			}
			
			const packed = $hyoo_crowd_chunk_bin.from( source )
			const unpacked = packed.chunk()
			
			$mol_assert_like( source, unpacked )
			
		},
		
		async 'sign / verify'( $ ) {
			
			const source: $hyoo_crowd_chunk = {
				nest_hi: $mol_int62_max,
				nest_lo: $mol_int62_max,
				head_hi: $mol_int62_max,
				head_lo: $mol_int62_max,
				self_hi: $mol_int62_max,
				self_lo: $mol_int62_max,
				prev_hi: $mol_int62_max,
				prev_lo: $mol_int62_max,
				next_hi: $mol_int62_max,
				next_lo: $mol_int62_max,
				peer_hi: $mol_int62_max,
				peer_lo: $mol_int62_max,
				time_hi: $mol_int62_max,
				time_lo: 30_000,
				data: { a: [ 1 ] },
			}
			
			const packed = $hyoo_crowd_chunk_bin.from( source )
			
			const key = await $.$mol_crypto_auditor_pair()
			packed.sign( new Uint8Array( await key.private.sign( packed.sens() ) ) )
			
			$mol_assert_ok( await key.public.verify( packed.sens(), packed.sign() ) )
			
		},
		
	})
}
