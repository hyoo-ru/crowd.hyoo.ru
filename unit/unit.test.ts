namespace $ {
	
	const common = [
		
		$mol_int62_to_string({
			lo: 12 << 0 | 13 << 8 | 14 << 16 | 15 << 24, // land_lo
			hi: 13 << 0 | 14 << 8 | 15 << 16 | 16 << 24, // land_hi
		}),
		$mol_int62_to_string({
			lo: 2  << 0 |  3 << 8 |  4 << 16 |  5 << 24, // auth_lo
			hi: 3  << 0 |  4 << 8 |  5 << 16 |  6 << 24, // auto_hi
		}),
		
		$mol_int62_to_string({
			lo: 4  << 0 |  5 << 8 |  6 << 16 |  7 << 24, // head_lo
			hi: 5  << 0 |  6 << 8 |  7 << 16 |  8 << 24, // head_hi
		}),
		$mol_int62_to_string({
			lo: 10 << 0 | 11 << 8 | 12 << 16 | 13 << 24, // self_lo
			hi: 11 << 0 | 12 << 8 | 13 << 16 | 14 << 24, // self_hi
		}),
		
		$mol_int62_to_string({
			lo: 6  << 0 |  7 << 8 |  8 << 16 |  9 << 24, // next_lo
			hi: 7  << 0 |  8 << 8 |  9 << 16 | 10 << 24, // next_hi
		}),
		$mol_int62_to_string({
			lo: 8  << 0 |  9 << 8 | 10 << 16 | 11 << 24, // prev_lo
			hi: 9  << 0 | 10 << 8 | 11 << 16 | 12 << 24, // prev_hi
		}),
		
		1  << 0 |  2 << 8 |  3 << 16 |  4 << 24, // time
		
	] as const
	
	$mol_test({
		
		'pack and unpack unit with null'( $ ) {
			
			const source = new $hyoo_crowd_unit(
				... common,
				null,
				null,
			)
			
			const packed = $hyoo_crowd_unit_bin.from_unit( source )
			const unpacked = packed.unit()
			
			source.bin = packed
			$mol_assert_like( source, unpacked )
			
		},
		
		'pack and unpack unit with json'( $ ) {
			
			const source = new $hyoo_crowd_unit(
				... common,
				{ a: [ 1 ] },
				null,
			)
			
			const packed = $hyoo_crowd_unit_bin.from_unit( source )
			const unpacked = packed.unit()
			
			source.bin = packed
			$mol_assert_like( source, unpacked )
			
		},
		
		'pack and unpack unit with bin'( $ ) {
			
			const source = new $hyoo_crowd_unit(
				... common,
				new Uint8Array([ 1, 2, 3, 4, 5, 6, 7, 8 ]),
				null,
			)
			
			const packed = $hyoo_crowd_unit_bin.from_unit( source )
			const unpacked = packed.unit()
			
			source.bin = packed
			$mol_assert_like( source, unpacked )
			
		},
		
		async 'sign / verify'( $ ) {
			
			const source = new $hyoo_crowd_unit(
				... common,
				{ a: [ 1 ] },
				null,
			)
			
			const packed = $hyoo_crowd_unit_bin.from_unit( source )
			
			const key = await $.$mol_crypto_auditor_pair()
			packed.sign( new Uint8Array( await key.private.sign( packed.sens() ) ) )
			
			const sign = packed.sign()
			
			$mol_assert_ok( await key.public.verify( packed.sens(), sign ) )
			
		},
		
	})
}
