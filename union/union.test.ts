namespace $ {
	$mol_test({
		
		'Default state'() {
			
			const store = $hyoo_crowd_union.of({
				counter: $hyoo_crowd_numb,
				string: $hyoo_crowd_reg,
			}).make()
			
			$mol_assert_like( store.delta(), $hyoo_crowd_delta([],[]) )
			$mol_assert_like( store.type, null )
			$mol_assert_like( store.as( 'counter' ), null )
			$mol_assert_like( store.as( 'string' ), null )
			
		},
		
		'Change type with default value'() {
			
			const store = $hyoo_crowd_union.of({
				counter: $hyoo_crowd_numb,
				string: $hyoo_crowd_reg,
				object: $hyoo_crowd_set,
				array: $hyoo_crowd_list,
			}).make()
			
			store.to( 'counter' )
			
			$mol_assert_like( store.type, 'counter' )
			$mol_assert_like( store.as( 'counter' )!.value, 0 )
			
		},
		
		'Change value'() {
			
			const store = $hyoo_crowd_union.of({
				counter: $hyoo_crowd_numb,
				string: $hyoo_crowd_reg,
				object: $hyoo_crowd_set,
				array: $hyoo_crowd_list,
			}).make().fork(1)
			
			store.to( 'counter' )!.shift( +5 ).shift( -2 )
						
			$mol_assert_like( store.delta(), $hyoo_crowd_delta(
				[ 'counter', +3 ],
				[ -1000001, +3000001 ],
			) )
			
		},
		
		'Slice after version'() {
			
			const store = $hyoo_crowd_union.of({
				counter: $hyoo_crowd_numb,
				string: $hyoo_crowd_reg,
				object: $hyoo_crowd_set,
				array: $hyoo_crowd_list,
			}).make().fork(1)
			
			store.to( 'object' ).add( 'foo' )
			const clock1 = store.clock.fork(0)
			
			store.to( 'object' ).add( 'bar' )
			const clock2 = store.clock.fork(0)
						
			$mol_assert_like( store.delta( clock1 ), $hyoo_crowd_delta(
				[ 'object', 'bar' ],
				[ -1000001, +3000001 ],
			) )
			
			$mol_assert_like( store.delta( clock2 ), $hyoo_crowd_delta([],[]) )
			
		},
		
		'Reinterpret list as reg'() {
			
			const store = $hyoo_crowd_union.of({
				counter: $hyoo_crowd_numb,
				string: $hyoo_crowd_reg,
				object: $hyoo_crowd_set,
				array: $hyoo_crowd_list,
			}).make().fork(1)
			
			store.to( 'string' ).str = 'foo'
			store.to( 'string' ).str = 'bar'
			$mol_assert_like( store.to( 'array' ).items, [ 'bar' ] )
			
			store.as( 'array' )!.insert( 'xxx' )
			$mol_assert_like( store.to( 'string' ).str, 'xxx' )
			
		},
		
		'Cross merge list and register'() {
			
			const base = $hyoo_crowd_union.of({
				counter: $hyoo_crowd_numb,
				string: $hyoo_crowd_reg,
				object: $hyoo_crowd_set,
				array: $hyoo_crowd_list,
			}).make().fork(1)
			
			base.to( 'string' ).str = 'foo'
			
			const left = base.fork(2)
			left.as( 'string' )!.str = 'bar'
			
			const right = base.fork(3)
			right.to( 'array' ).insert( 'xxx' )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			$mol_assert_like(
				
				left.apply( right_delta ).delta(),
				right.apply( left_delta ).delta(),
				
				$hyoo_crowd_delta(
					[ 'array', 'bar', 'foo', 'xxx' ],
					[ -3000003, +3000002, +2000001, +4000003 ],
				),
				
			)
			
		},
		
	})
}
