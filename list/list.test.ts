namespace $ {
	
	async function make_land( id = '1_1' as $mol_int62_string ) {
		return $hyoo_crowd_land.make({
			id: $mol_const( id ),
			peer: $mol_const( await $hyoo_crowd_peer.generate() ),
		})
	}
	
	$mol_test({
		
		async 'list add & insert & drop'() {
			
			const land = await make_land()
			const node = land.chief.as( $hyoo_crowd_list )
			
			node.list([ 1, 2 ])
			$mol_assert_like( node.list(), [ 1, 2 ] )
			
			node.add( 3 )
			$mol_assert_like( node.list(), [ 1, 2, 3 ] )
			
			node.add( 3 )
			$mol_assert_like( node.list(), [ 1, 2, 3 ] )
			
			node.insert([ 2 ])
			$mol_assert_like( node.list(), [ 1, 2, 3, 2 ] )
			
			node.insert( [ 2 ], 0 )
			$mol_assert_like( node.list(), [ 2, 1, 2, 3, 2 ] )
			
			node.drop( 2 )
			$mol_assert_like( node.list(), [ 1, 3 ] )
			
			node.drop( 2 )
			$mol_assert_like( node.list(), [ 1, 3 ] )
			
		},
		
	})
	
}
