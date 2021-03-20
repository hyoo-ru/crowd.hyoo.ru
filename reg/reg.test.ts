namespace $ {
	$mol_test({
		
		'Default state'() {
			
			const store = new $hyoo_crowd_reg()
			
			$mol_assert_like( store.toJSON(), $hyoo_crowd_delta([],[]) )
			$mol_assert_like( store.value, null )
			$mol_assert_like( store.version, 0 )
			
		},
		
		'Serial changes'() {
			
			const store = new $hyoo_crowd_reg().fork(1)
			store.str = 'foo'
			store.str = 'bar'
			
			$mol_assert_like(
				store.toJSON(),
				$hyoo_crowd_delta(
					[ 'bar' ],
					[ +2000001 ],
				)
			)
			
		},
		
		'Ignore same changes'() {
			
			const store = new $hyoo_crowd_reg().fork(1)
			store.str = 'foo'
			store.str = 'foo'
			
			$mol_assert_like(
				store.toJSON(),
				$hyoo_crowd_delta(
					[ 'foo' ],
					[ +1000001 ],
				)
			)
			
		},
		
		'Slice after version'() {
			
			const store = new $hyoo_crowd_reg().fork(1)
			store.str = 'foo'
			store.str = 'bar'

			$mol_assert_like(
				store.toJSON( +1000001 ),
				$hyoo_crowd_delta(
					[ 'bar' ],
					[ +2000001 ],
				)
			)
			
			$mol_assert_like( store.toJSON( +2000001 ), $hyoo_crowd_delta([],[]) )
			
		},
		
		'Cuncurrent changes'() {
			
			const base = new $hyoo_crowd_reg().fork(1)
			base.str = 'foo'
			
			const left = base.fork(2)
			left.str = 'bar'
			
			const right = base.fork(3)
			right.str = 'xxx'
			
			const left_delta = left.delta( base )
			const right_delta = right.delta( base )
			
			$mol_assert_like(
				left.apply( right_delta ).toJSON(),
				right.apply( left_delta ).toJSON(),
				{
					values: [ 'xxx' ],
					stamps: [ +2000003 ],
				},
			)
			
		},
		
	})
}
