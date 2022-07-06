namespace $ {
	$mol_test({
		
		'fresh'() {
			
			const clock = new $hyoo_crowd_clock
			clock.see_peer( `1_11`, 1, 1 )
			clock.see_peer( `2_22`, 2, 2 )
			
			$mol_assert_ok( clock.fresh( `2_22`, 3, 3 ) )
			$mol_assert_ok( clock.fresh( `3_33`, 1, 1 ) )
			
			$mol_assert_not( clock.fresh( `2_22`, 1, 1 ) )
			
		},
		
		'fork'() {
			
			const left = new $hyoo_crowd_clock
			left.see_peer( `1_11`, 1, 1 )
			left.see_peer( `2_22`, 2, 2 )
			
			const right = new $hyoo_crowd_clock( left )
			
			$mol_assert_equal( right.last_hi, 2 )
			$mol_assert_equal( right.last_lo, 2 )
			
			$mol_assert_like(
				[ ... right ],
				[
					[ `1_11`, [ 1, 1 ] ],
					[ `2_22`, [ 2, 2 ] ],
				],
			)
			
		},
		
		'generate'() {
			
			const clock = new $hyoo_crowd_clock
			clock.see_peer( `1_11`, $mol_int62_min + 1, 1 )
			clock.see_peer( `2_22`, $mol_int62_min + 2, 2 )
			
			const [ now_hi, now_lo ] = clock.now()
			
			const [ time1_hi, time1_lo ] = clock.tick( `1_11` )
			$mol_assert_ok( $mol_int62_compare( now_hi, now_lo, time1_hi, time1_lo ) >= 0 )
			$mol_assert_ok( $mol_int62_compare( now_hi, now_lo, clock.last_hi, clock.last_lo ) >= 0 )
			
			clock.see_peer( `2_22`, now_hi + 10, 123 )
			const [ time2_hi, time2_lo ] = clock.tick( `2_22` )
			
			$mol_assert_equal( time2_hi, now_hi + 10 )
			$mol_assert_equal( clock.last_hi, now_hi + 10 )
			$mol_assert_equal( time2_lo, 124 )
			
		},
		
		'ahead'() {
			
			const clock1 = new $hyoo_crowd_clock
			clock1.see_peer( `1_11`, 1, 0 )
			clock1.see_peer( `2_22`, 2, 0 )
			
			const clock2 = new $hyoo_crowd_clock
			clock2.see_peer( `1_11`, 1, 0 )
			clock2.see_peer( `3_33`, 2, 0 )
			
			const clock3 = new $hyoo_crowd_clock
			clock3.see_peer( `1_11`, 1, 0 )
			clock3.see_peer( `2_22`, 2, 0 )
			clock3.see_peer( `3_33`, 2, 0 )
			
			$mol_assert_ok( clock1.ahead( clock2 ) )
			$mol_assert_ok( clock2.ahead( clock1 ) )
			
			$mol_assert_ok( clock3.ahead( clock1 ) )
			$mol_assert_ok( clock3.ahead( clock2 ) )
			
			$mol_assert_not( clock1.ahead( clock3 ) )
			$mol_assert_not( clock2.ahead( clock3 ) )
			
		},
		
	})
}
