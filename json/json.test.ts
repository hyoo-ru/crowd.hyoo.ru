namespace $ {
	
	async function make_land( id = '1_1' as $mol_int62_string ) {
		return $hyoo_crowd_land.make({
			id: $mol_const( id ),
			peer: $mol_const( await $hyoo_crowd_peer.generate() ),
		})
	}
	
	$mol_test({
		
		async 'save and load json array with primitives'() {
			
			const land = await make_land()
			
			const node = land.chief.as( $hyoo_crowd_json )
			node.json({
				empty: null,
				boolean: [ false, true ],
				object: {
					number: 0,
					string: [ '', 'lol' ],
				},
			})
			
			$mol_assert_like(
				node.json(),
				{
					empty: null,
					boolean: [ false, true ],
					object: {
						number: 0,
						string: [ '', 'lol' ],
					},
				},
			)
			
		},
		
	})
	
}
