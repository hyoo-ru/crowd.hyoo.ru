namespace $ {
	$mol_test({
		
		'is_new'() {
			
			const clock = new $hyoo_crowd_clock
			clock.feed( 1_000_001 )
			clock.feed( -2_000_002 )
			
			$mol_assert_ok( clock.is_new( -2_000_003 ) )
			$mol_assert_ok( clock.is_new( 2_000_003 ) )
			$mol_assert_ok( clock.is_new( 3_000_001 ) )
			
			$mol_assert_not( clock.is_new( 1_000_002 ) )
			$mol_assert_not( 0 )
			
		},
		
		'is_ahead'() {
			
			const clock1 = new $hyoo_crowd_clock
			clock1.feed( 1_000_001 )
			clock1.feed( -2_000_002 )
			
			const clock2 = new $hyoo_crowd_clock
			clock2.feed( 1_000_001 )
			clock2.feed( -2_000_003 )
			
			const clock3 = new $hyoo_crowd_clock
			clock3.feed( 1_000_001 )
			clock3.feed( 2_000_002 )
			clock3.feed( 2_000_003 )
			
			$mol_assert_ok( clock1.is_ahead( clock2 ) )
			$mol_assert_ok( clock2.is_ahead( clock1 ) )
			
			$mol_assert_ok( clock3.is_ahead( clock1 ) )
			$mol_assert_ok( clock3.is_ahead( clock2 ) )
			
			$mol_assert_not( clock1.is_ahead( clock3 ) )
			$mol_assert_not( clock2.is_ahead( clock3 ) )
			
		},
		
	})
}
