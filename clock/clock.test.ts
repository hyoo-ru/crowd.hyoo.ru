namespace $ {
	$mol_test({
		
		'fresh'() {
			
			const clock = new $hyoo_crowd_clock
			clock.see_peer( { lo: 11, hi: 111 }, 1, 1 )
			clock.see_peer( { lo: 22, hi: 222 }, 2, 2 )
			
			$mol_assert_ok( clock.fresh( { lo: 22, hi: 222 }, 3, 3 ) )
			$mol_assert_ok( clock.fresh( { lo: 33, hi: 333 }, 1, 1 ) )
			
			$mol_assert_not( clock.fresh( { lo: 22, hi: 222 }, 1, 1 ) )
			
		},
		
		'fork'() {
			
			const left = new $hyoo_crowd_clock
			left.see_peer( { lo: 11, hi: 111 }, 1, 1 )
			left.see_peer( { lo: 22, hi: 222 }, 2, 2 )
			
			const right = new $hyoo_crowd_clock( left )
			
			$mol_assert_equal( right.last_time, 2 )
			$mol_assert_equal( right.last_spin, 2 )
			
			$mol_assert_like(
				[ ... right ],
				[
					[ { lo: 11, hi: 111 }, [ 1, 1 ] ],
					[ { lo: 22, hi: 222 }, [ 2, 2 ] ],
				],
			)
			
		},
		
		'generate'() {
			
			const clock = new $hyoo_crowd_clock
			clock.see_peer( { lo: 11, hi: 111 }, 1, $mol_int62_min + 1 )
			clock.see_peer( { lo: 22, hi: 222 }, 2, $mol_int62_min + 2 )
			
			const now = clock.now() as number
			
			const [ spin1, time1 ] = clock.tick( { lo: 11, hi: 111 } )
			$mol_assert_like( [ spin1, time1 ], [ 0, now ] )
			$mol_assert_like( [ clock.last_spin, clock.last_time ], [0, now ] )
			
			clock.see_peer( { lo: 22, hi: 222 }, 123, now + 10 )
			
			const [ spin2, time2 ] = clock.tick( { lo: 22, hi: 222 } )
			$mol_assert_like( [ spin2, time2 ], [ 124, now + 10 ] )
			$mol_assert_like( [ clock.last_spin, clock.last_time ], [ 124, now + 10 ] )
			
		},
		
		'ahead'() {
			
			const clock1 = new $hyoo_crowd_clock
			clock1.see_peer( { lo: 11, hi: 111 }, 0, 1 )
			clock1.see_peer( { lo: 22, hi: 222 }, 0, 2 )
			
			const clock2 = new $hyoo_crowd_clock
			clock2.see_peer( { lo: 11, hi: 111 }, 0, 1 )
			clock2.see_peer( { lo: 33, hi: 333 }, 0, 2 )
			
			const clock3 = new $hyoo_crowd_clock
			clock3.see_peer( { lo: 11, hi: 111 }, 0, 1 )
			clock3.see_peer( { lo: 22, hi: 222 }, 0, 2 )
			clock3.see_peer( { lo: 33, hi: 333 }, 0, 2 )
			
			$mol_assert_ok( clock1.ahead( clock2 ) )
			$mol_assert_ok( clock2.ahead( clock1 ) )
			
			$mol_assert_ok( clock3.ahead( clock1 ) )
			$mol_assert_ok( clock3.ahead( clock2 ) )
			
			$mol_assert_not( clock1.ahead( clock3 ) )
			$mol_assert_not( clock2.ahead( clock3 ) )
			
		},
		
	})
}
