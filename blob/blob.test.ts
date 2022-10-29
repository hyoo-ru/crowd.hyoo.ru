namespace $ {
	
	async function make_land( id = '1_1' as $mol_int62_string ) {
		return $hyoo_crowd_land.make({
			id: $mol_const( id ),
			peer: $mol_const( await $hyoo_crowd_peer.generate() ),
		})
	}
	
	$mol_test({
		
		async 'save and load buffers'() {
			
			const land = await make_land()
			const node = land.chief.as( $hyoo_crowd_blob )
			
			const source = new Uint8Array( 2**15 + 1 )
			source[ 2**15 + 1 ] = 255 
			
			node.buffer( source )
			
			$mol_assert_like( node.list().length, 2 )
			$mol_assert_like(
				node.buffer(),
				source,
			)
			
		},
		
		async 'save and load blobs'() {
			
			const land = await make_land()
			const node = land.chief.as( $hyoo_crowd_blob )
				
			const source = new Uint8Array( 2**15 + 1 )
			source[ 2**15 + 1 ] = 255 
			
			await $mol_wire_async( node ).blob(
				new $mol_blob( [source], { type: 'test/test' } )
			)
			
			$mol_assert_like( 'test/test', node.blob().type )
			$mol_assert_like( source, new Uint8Array( await node.blob().arrayBuffer() ) )
			
		},
		
	})
	
}
