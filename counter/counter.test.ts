namespace $ {
	
	$mol_test({
		
		async 'count & discount'() {
			
			const peer = await $hyoo_crowd_peer.generate()
			const world = new $hyoo_crowd_world( peer )
			const land = await world.grab()
			
			const counter = land.chief.as( $hyoo_crowd_counter )
			$mol_assert_like( await $mol_wire_async( counter ).total(), 0 )
			$mol_assert_like( counter.counted(), false )
			
			counter.counted( true )
			$mol_assert_like( counter.total(), 1 )
			$mol_assert_like( counter.counted(), true )
			
			counter.counted( false )
			$mol_assert_like( counter.total(), 0 )
			$mol_assert_like( counter.counted(), false )
			
		},
		
	})
}
