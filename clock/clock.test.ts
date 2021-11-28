namespace $ {
	$mol_test({
		
		'fresh'() {
			
			const clock = new $hyoo_crowd_clock
			clock.see( 111, 1 )
			clock.see( 222, 2 )
			
			$mol_assert_ok( clock.fresh( 222, 3 ) )
			$mol_assert_ok( clock.fresh( 333, 1 ) )
			
			$mol_assert_not( clock.fresh( 222, 1 ) )
			$mol_assert_not( clock.fresh( 333, 0 ) )
			
		},
		
		'fork'() {
			
			const left = new $hyoo_crowd_clock
			left.see( 111, 1 )
			left.see( 222, 2 )
			
			const right = new $hyoo_crowd_clock( left )
			
			$mol_assert_equal( right.now, 2 )
			
			$mol_assert_like(
				[ ... right ],
				[
					[ 111, 1 ],
					[ 222, 2 ],
				],
			)
			
		},
		
		'generate'() {
			
			const clock = new $hyoo_crowd_clock
			clock.see( 111, 1 )
			clock.see( 222, 2 )
			
			const now = Date.now()
			
			const time1 = clock.tick( 111 )
			$mol_assert_ok( time1 >= now )
			$mol_assert_ok( clock.now >= now )
			
			clock.see( 222, now + 1000 )
			const time2 = clock.tick( 222 )
			$mol_assert_ok( time2 > now + 1000 )
			$mol_assert_ok( clock.now > now + 1000 )
			
		},
		
		'ahead'() {
			
			const clock1 = new $hyoo_crowd_clock
			clock1.see( 111, 1 )
			clock1.see( 222, 2 )
			
			const clock2 = new $hyoo_crowd_clock
			clock2.see( 111, 1 )
			clock2.see( 333, 2 )
			
			const clock3 = new $hyoo_crowd_clock
			clock3.see( 111, 1 )
			clock3.see( 222, 2 )
			clock3.see( 333, 2 )
			
			$mol_assert_ok( clock1.ahead( clock2 ) )
			$mol_assert_ok( clock2.ahead( clock1 ) )
			
			$mol_assert_ok( clock3.ahead( clock1 ) )
			$mol_assert_ok( clock3.ahead( clock2 ) )
			
			$mol_assert_not( clock1.ahead( clock3 ) )
			$mol_assert_not( clock2.ahead( clock3 ) )
			
		},
		
	})
}
