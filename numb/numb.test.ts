namespace $ {
	$mol_test({
		
		'Default state'() {
			
			const val = new $hyoo_crowd_numb()
			
			$mol_assert_like( val.delta(), $hyoo_crowd_delta([],[],[]) )
			$mol_assert_like( val.numb(), 0 )
			
		},
		
		'Serial changes'() {
			
			const store = new $hyoo_crowd_numb().fork(1).shift( +5 ).shift( -3 )
			
			$mol_assert_like( store.delta(), $hyoo_crowd_delta(
				[ +2 ],
				[ +2000001 ],
				[ +2000001 ],
			) )
			
			$mol_assert_like( store.numb(), 2 )
			
		},
		
		'Slice after version'() {
			
			const store = new $hyoo_crowd_numb()
			
			const store1 = store.fork(1).shift( +5 )
			const clock1 = store1.clock.fork(0)
			
			store1.shift( -3 )
			const clock2 = store1.clock.fork(0)
			
			const store2 = store1.fork(2).shift( -2 )
			const clock3 = store2.clock.fork(0)

			$mol_assert_like( store2.delta( clock1 ), $hyoo_crowd_delta(
				[ +2, -2 ],
				[ +2000001, +3000002 ],
				[ +2000001, +3000002 ],
			) )
			
			$mol_assert_like( store2.delta( clock2 ), $hyoo_crowd_delta(
				[ -2 ],
				[ +3000002 ],
				[ 2000001, +3000002 ],
			 ) )
			
			$mol_assert_like(
				store2.delta( clock3 ),
				$hyoo_crowd_delta( [], [], [ 2000001, +3000002 ] ),
			)
			
		},
		
		'Concurrent changes'() {
			
			const base = new $hyoo_crowd_numb().fork(1).shift( +5 )
			
			const left = base.fork(2).shift( +3 ).shift( +1 )
			const right = base.fork(3).shift( -2 ).shift( +1 )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
			
			$mol_assert_like(
				left.numb(),
				right.numb(),
				8,
			)
			
		},
		
	})
}
