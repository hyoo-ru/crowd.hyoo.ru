namespace $ {
	$mol_test({
		
		'Add keys'() {
			
			$mol_assert_like(
				new $hyoo_crowd_set().fork(1).add( 'foo' ).add( 'bar' ).delta(),
				$hyoo_crowd_delta(
					[ 'foo', 'bar' ],
					[ +1000001, +2000001 ],
				),
			)
			
		},
		
		'Slice after version'() {
			
			const store = new $hyoo_crowd_set().fork(1)
			
			store.add( 'foo' )
			const clock1 = store.clock.fork(0)
			
			store.add( 'bar' )
			const clock2 = store.clock.fork(0)
			
			$mol_assert_like( store.delta( clock1 ), $hyoo_crowd_delta(
				[ 'bar' ],
				[ +2000001 ],
			 ) )
			
			$mol_assert_like( store.delta( clock2 ), $hyoo_crowd_delta([],[]) )
			
		},
		
		'Ignore existen keys'() {
			
			$mol_assert_like(
				new $hyoo_crowd_set().fork(1).add( 'foo' ).add( 'foo' ).delta(),
				$hyoo_crowd_delta(
					[ 'foo' ],
					[ +1000001 ],
				),
			)
			
		},
		
		'Partial remove keys'() {
			
			$mol_assert_like(
				new $hyoo_crowd_set().fork(1).add( 'foo' ).add( 'bar' ).remove( 'foo' ).delta(),
				$hyoo_crowd_delta(
					[ 'foo', 'bar' ],
					[ -3000001, +2000001 ],
				),
			)
			
		},
		
		'Ignore already removed keys'() {
			
			$mol_assert_like(
				new $hyoo_crowd_set().fork(1).add( 'foo' ).remove( 'foo' ).remove( 'foo' ).delta(),
				$hyoo_crowd_delta(
					[ 'foo' ],
					[ -2000001 ],
				),
			)
			
		},
		
		'Convert to native Set'() {
			
			const store = new $hyoo_crowd_set().fork(1).add( 'foo' ).add( 'xxx' ).remove( 'foo' )
			
			$mol_assert_like( store.items, [ "xxx" ] )
			
		},
		
		'Merge different sets'() {
			
			const left = new $hyoo_crowd_set().fork(2).add( 'foo' ).add( 'bar' )
			const right = new $hyoo_crowd_set().fork(3).add( 'xxx' ).add( 'yyy' ).remove( 'xxx' )
			
			const left_delta = left.delta()
			const right_delta = right.delta()
			
			$mol_assert_like(
				left.apply( right_delta ).items.sort(),
				right.apply( left_delta ).items.sort(),
				[ 'bar', 'foo', 'yyy' ],
			)
			
		},
		
		'Merge branches with common base'() {
			
			const base = new $hyoo_crowd_set().fork(1).add( 'foo' ).add( 'bar' )
			
			const left = base.fork(2).add( 'xxx' )
			const right = base.fork(3).remove( 'foo' )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			$mol_assert_like(
				left.apply( right_delta ).items.sort(),
				right.apply( left_delta ).items.sort(),
				[ 'bar', 'xxx' ],
			)
			
		},
		
		'Concurrent Add and Remove'() {
			
			const base = new $hyoo_crowd_set().fork(1).add( 'foo' )
			
			const left = base.fork(2).add( 'foo' ).remove( 'bar' )
			const right = base.fork(3).remove( 'foo' ).add( 'bar' )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			$mol_assert_like(
				left.apply( right_delta ).items.sort(),
				right.apply( left_delta ).items.sort(),
				[ 'bar' ],
			)
			
		},
		
		'Number ids support'() {
			
			$mol_assert_like(
				new $hyoo_crowd_set().fork(1).add( 1 ).add( 2 ).add( 2 ).delta(),
				$hyoo_crowd_delta(
					[ 1, 2 ],
					[ +1000001, +2000001 ],
				),
			)
			
		},
		
	})
}
