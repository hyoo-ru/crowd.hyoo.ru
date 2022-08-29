namespace $ {
	$mol_test({
		
		'fresh'() {
			
			const clock = new $hyoo_crowd_clock
			clock.see_peer( 'b_33', 1 )
			clock.see_peer( 'm_66', 2 )
			
			$mol_assert_ok( clock.fresh( 'm_66', 3 ) )
			$mol_assert_ok( clock.fresh( 'x_99', 1 ) )
			
			$mol_assert_not( clock.fresh( 'm_66', 1 ) )
			
		},
		
		'fork'() {
			
			const left = new $hyoo_crowd_clock
			left.see_peer( 'b_33', 1 )
			left.see_peer( 'm_66', 2 )
			
			const right = new $hyoo_crowd_clock( left )
			
			$mol_assert_equal( right.last_time, 2 )
			
			$mol_assert_like(
				[ ... right ],
				[
					[ 'b_33', 1 ],
					[ 'm_66', 2 ],
				],
			)
			
		},
		
		'generate'() {
			
			const clock = new $hyoo_crowd_clock
			clock.see_peer( 'b_33', $mol_int62_min + 1 )
			clock.see_peer( 'm_66', $mol_int62_min + 2 )
			
			const now = clock.now() as number
			
			const time1 = clock.tick( 'b_33' )
			$mol_assert_like( time1, now )
			$mol_assert_like( clock.last_time, now )
			
			clock.see_peer( 'm_66', clock.now() + 10 )
			
			const time2 = clock.tick( 'm_66' )
			$mol_assert_like( time2, now + 11 )
			$mol_assert_like( clock.last_time, now + 11 )
			
		},
		
		'ahead'() {
			
			const clock1 = new $hyoo_crowd_clock
			clock1.see_peer( 'b_33', 1 )
			clock1.see_peer( 'm_66', 2 )
			
			const clock2 = new $hyoo_crowd_clock
			clock2.see_peer( 'b_33', 1 )
			clock2.see_peer( 'x_99', 2 )
			
			const clock3 = new $hyoo_crowd_clock
			clock3.see_peer( 'b_33', 1 )
			clock3.see_peer( 'm_66', 2 )
			clock3.see_peer( 'x_99', 2 )
			
			$mol_assert_ok( clock1.ahead( clock2 ) )
			$mol_assert_ok( clock2.ahead( clock1 ) )
			
			$mol_assert_ok( clock3.ahead( clock1 ) )
			$mol_assert_ok( clock3.ahead( clock2 ) )
			
			$mol_assert_not( clock1.ahead( clock3 ) )
			$mol_assert_not( clock2.ahead( clock3 ) )
			
		},
		
		'bin'() {
			
			const clocks1 = [ new $hyoo_crowd_clock, new $hyoo_crowd_clock ] as const
			clocks1[ $hyoo_crowd_unit_group.auth ].see_peer( 'b_33', 1 )
			clocks1[ $hyoo_crowd_unit_group.data ].see_peer( 'b_33', 2 )
			
			const bin = $hyoo_crowd_clock_bin.from( '2_b', clocks1 )
			
			$mol_assert_like( bin.land(), '2_b' )
			
			const clocks2 = [ new $hyoo_crowd_clock, new $hyoo_crowd_clock ] as const
			clocks2[ $hyoo_crowd_unit_group.auth ].see_bin( bin, $hyoo_crowd_unit_group.auth )
			clocks2[ $hyoo_crowd_unit_group.data ].see_bin( bin, $hyoo_crowd_unit_group.data )
			
			$mol_assert_like(
				clocks2.map( clock => new Map( clock ) ),
				[
					new Map([
						[ 'b_33', 1 ],
					]),
					new Map([
						[ 'b_33', 2 ],
					]),
				]
			)
			
		},
		
	})
}
