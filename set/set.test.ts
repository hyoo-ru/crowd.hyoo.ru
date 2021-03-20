namespace $ {
	$mol_test({
		
		'Add keys'() {
			
			$mol_assert_like(
				new $hyoo_crowd_set().fork(1).add( 'foo' ).add( 'bar' ).toJSON(),
				$hyoo_crowd_delta(
					[ 'foo', 'bar' ],
					[ +1000001, +2000001 ],
				),
			)
			
		},
		
		'Slice after version'() {
			
			const val = new $hyoo_crowd_set().fork(1).add( 'foo' ).add( 'bar' )
			
			$mol_assert_like( val.toJSON( +1000001 ), $hyoo_crowd_delta(
				[ 'bar' ],
				[ +2000001 ],
			 ) )
			
			$mol_assert_like( val.toJSON( +2000001 ), $hyoo_crowd_delta([],[]) )
			
		},
		
		'Ignore existen keys'() {
			
			$mol_assert_like(
				new $hyoo_crowd_set().fork(1).add( 'foo' ).add( 'foo' ).toJSON(),
				$hyoo_crowd_delta(
					[ 'foo' ],
					[ +1000001 ],
				),
			)
			
		},
		
		'Partial remove keys'() {
			
			$mol_assert_like(
				new $hyoo_crowd_set().fork(1).add( 'foo' ).add( 'bar' ).remove( 'foo' ).toJSON(),
				$hyoo_crowd_delta(
					[ 'foo', 'bar' ],
					[ -3000001, +2000001 ],
				),
			)
			
		},
		
		'Ignore already removed keys'() {
			
			$mol_assert_like(
				new $hyoo_crowd_set().fork(1).add( 'foo' ).remove( 'foo' ).remove( 'foo' ).toJSON(),
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
			
			const left_delta = left.toJSON()
			const right_delta = right.toJSON()
			
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
			
			const left_delta = left.delta( base )
			const right_delta = right.delta( base )
			
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
			
			const left_delta = left.delta( base )
			const right_delta = right.delta( base )
			
			$mol_assert_like(
				left.apply( right_delta ).items.sort(),
				right.apply( left_delta ).items.sort(),
				[ 'bar' ],
			)
			
		},
		
		'Number ids support'() {
			
			$mol_assert_like(
				new $hyoo_crowd_set().fork(1).add( 1 ).add( 2 ).add( 2 ).toJSON(),
				$hyoo_crowd_delta(
					[ 1, 2 ],
					[ +1000001, +2000001 ],
				),
			)
			
		},
		
	})
}
