namespace $ {
	$mol_test({
		
		'Put values to end'() {
			
			$mol_assert_like(
				new $hyoo_crowd_list().fork(1).insert( 'foo' ).insert( 'bar' ).toJSON(),
				$hyoo_crowd_delta(
					[ 'foo', 'bar' ],
					[ +1000001, +2000001 ],
				),
			)
			
		},
		
		'Ignore existen values'() {
			
			$mol_assert_like(
				new $hyoo_crowd_list().fork(1).insert( 'foo' ).insert( 'foo' ).toJSON(),
				$hyoo_crowd_delta(
					[ 'foo' ],
					[ +2000001 ],
				),
			)
			
		},
		
		'Slice after version'() {
			
			const store = new $hyoo_crowd_list().fork(1).insert( 'foo' ).insert( 'bar' )

			$mol_assert_like( store.toJSON( +1000001 ), $hyoo_crowd_delta(
				[ 'foo', 'bar' ],
				[ +1000001, +2000001 ],
			) )
			
			$mol_assert_like( store.toJSON( +2000001 ), $hyoo_crowd_delta([],[]) )
			
		},
		
		'Put value to the middle'() {
			
			$mol_assert_like(
				new $hyoo_crowd_list().fork(1).insert( 'foo' ).insert( 'bar' ).insert( 'xxx', 1 ).toJSON(),
				$hyoo_crowd_delta(
					[ 'foo', 'xxx', 'bar' ],
					[ +1000001, +3000001, +2000001 ],
				),
			)
			
		},
		
		'Put value to the start'() {
			
			$mol_assert_like(
				new $hyoo_crowd_list().fork(1).insert( 'foo' ).insert( 'bar', 0 ).toJSON(),
				$hyoo_crowd_delta(
					[ 'bar', 'foo' ],
					[ +2000001, +1000001 ],
				),
			)
			
		},
		
		'Partial cut values'() {
			
			$mol_assert_like(
				new $hyoo_crowd_list().fork(1).insert( 'foo' ).insert( 'bar' ).cut( 'foo' ).toJSON(),
				$hyoo_crowd_delta(
					[ 'bar', 'foo' ],
					[ +2000001, -3000001 ],
				),
			)
			
		},
		
		'Ignore already cutted values'() {
			
			$mol_assert_like(
				new $hyoo_crowd_list().fork(1).insert( 'foo' ).cut( 'foo' ).cut( 'foo' ).toJSON(),
				$hyoo_crowd_delta(
					[ 'foo' ],
					[ -2000001 ],
				),
			)
			
		},
		
		'Convert to native array'() {
			
			const store = new $hyoo_crowd_list().fork(1)
			.insert( 'foo' )
			.insert( 'bar', 0 )
			.insert( 'xxx' )
			.cut( 'foo' )
			
			$mol_assert_like( store.items, [ "bar", "xxx" ] )
			
		},
		
		'Merge different sequences'() {
			
			const left = new $hyoo_crowd_list().fork(1).insert( 'foo' ).insert( 'bar' )
			const right = new $hyoo_crowd_list().fork(2).insert( 'xxx' ).insert( 'yyy' )
			
			const left_delta = left.toJSON()
			const right_delta = right.toJSON()
			
			$mol_assert_like(
				left.apply( right_delta ).toJSON(),
				right.apply( left_delta ).toJSON(),
				$hyoo_crowd_delta(
					[ 'xxx', 'yyy', 'foo', 'bar' ],
					[ +1000002, +2000002, +1000001, +2000001 ],
				),
			)
			
		},
		
		'Insert in the same place'() {
			
			const base = new $hyoo_crowd_list().fork(1).insert( 'foo' ).insert( 'bar' )
			
			const left = base.fork(2).insert( 'xxx', 1 )
			const right = base.fork(3).insert( 'yyy', 1 )
			
			const left_delta = left.delta( base )
			const right_delta = right.delta( base )
			
			$mol_assert_like(
				left.apply( right_delta ).toJSON(),
				right.apply( left_delta ).toJSON(),
				$hyoo_crowd_delta(
					[ 'foo', 'yyy', 'xxx', 'bar' ],
					[ +1000001, +3000003, +3000002, +2000001 ],
				),
			)
			
		},
		
		'Insert after moved'() {
			
			const base = new $hyoo_crowd_list().fork(1).insert( 'foo' ).insert( 'bar' )
			
			const left = base.fork(2).insert( 'xxx', 1 )
			const right = base.fork(3).insert( 'foo', 2 )
			
			const left_delta = left.delta( base )
			const right_delta = right.delta( base )
			
			$mol_assert_like(
				left.apply( right_delta ).toJSON(),
				right.apply( left_delta ).toJSON(),
				$hyoo_crowd_delta(
					[ 'xxx', 'bar', 'foo' ],
					[ +3000002, +2000001, +3000003 ],
				),
			)
			
		},
		
		'Insert after cutted'() {
			
			const base = new $hyoo_crowd_list().fork(1).insert( 'foo' ).insert( 'bar' )
			
			const left = base.fork(2).insert( 'xxx', 1 )
			const right = base.fork(3).cut( 'foo' )
			
			const left_delta = left.delta( base )
			const right_delta = right.delta( base )
			
			$mol_assert_like(
				left.apply( right_delta ).toJSON(),
				right.apply( left_delta ).toJSON(),
				$hyoo_crowd_delta(
					[ 'xxx', 'bar', 'foo' ],
					[ +3000002, +2000001, -3000003 ],
				),
			)
			
		},
		
		'Number ids support'() {
			
			$mol_assert_like(
				new $hyoo_crowd_list().fork(1).insert( 1 ).insert( 2 ).insert( 3, 1 ).toJSON(),
				$hyoo_crowd_delta(
					[ 1, 3, 2 ],
					[ +1000001, +3000001, +2000001 ],
				),
			)
			
		},
		
	})
}
