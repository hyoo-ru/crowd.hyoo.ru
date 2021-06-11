namespace $ {
	$mol_test({
		
		'Default data'() {
			
			const store = $hyoo_crowd_graph.make()
			
			$mol_assert_equal( store.value( 'foo' ), null )
			$mol_assert_like( store.delta(), $hyoo_crowd_delta([],[],[]) )
			
		},
		
		'Changed values'() {
			
			const store = $hyoo_crowd_graph.make()
			
			store.value( 'null', null )
			store.value( 'bool', false )
			store.value( 'numb', 0 )
			store.value( 'text', '' )
			store.value( 'list', [ 'foo', 'bar' ] )
			
			$mol_assert_equal( store.value( 'null' ), null )
			$mol_assert_equal( store.value( 'bool' ), false )
			$mol_assert_equal( store.value( 'numb' ), 0 )
			$mol_assert_equal( store.value( 'text' ), '' )
			$mol_assert_like( store.value( 'list' ), [ 'foo', 'bar' ] )
			
		},
		
		'Graph representation'() {
			
			const store = $hyoo_crowd_graph.make()
			
			store.edge( 'A/out', [ 'B', 'C' ] )
			store.edge( 'B/in', [ 'A' ] )
			store.edge( 'B/out', [ 'C' ] )
			store.edge( 'C/in', [ 'A', 'B' ] )
			
			$mol_assert_equal( store.edge( store.edge('A/out')[0] + '/out' )[0], 'C' )
			
		},
		
	})
}
