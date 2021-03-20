namespace $ {
	$mol_test({
		
		'Default state'() {
			
			const store = $hyoo_crowd_tuple.of({
				keys: $hyoo_crowd_list,
				vals: $hyoo_crowd_dict.of( $hyoo_crowd_reg ),
			}).make()
			
			$mol_assert_like( store.for('keys').items, [] )
			$mol_assert_like( store.for('vals').for( 'foo' ).str, '' )
			
			$mol_assert_like( store.toJSON(), $hyoo_crowd_delta([],[]) )
			
		},
		
		'Changed state'() {
			
			const Map = $hyoo_crowd_tuple.of({
				vers: $hyoo_crowd_numb,
				keys: $hyoo_crowd_set,
				vals: $hyoo_crowd_dict.of( $hyoo_crowd_reg ),
			})
			
			const store = Map.make().fork(1)
			
			store.for( 'keys' ).add( 'foo' ).add( 'bar' )
			store.for( 'vals' ).for( 'xxx' ).value = 'yyy'
			
			$mol_assert_like( store.for('vers').numb, 0 )
			$mol_assert_like( store.for('keys').items, [ 'foo', 'bar' ] )
			$mol_assert_like( store.for('vals').for( 'xxx' ).str, 'yyy' )
			
			$mol_assert_like( store.toJSON(), $hyoo_crowd_delta(
				[ 'keys', 'foo', 'bar', 'vals', 'xxx', 'yyy' ],
				[ -2, +1000001, +2000001, -2, -1, +3000001 ],
			) )
			
		},
		
		'Tuple of tuples'() {
			
			const Point = $hyoo_crowd_tuple.of({
				X: $hyoo_crowd_numb,
				Y: $hyoo_crowd_numb,
			})
			
			const Rect = $hyoo_crowd_tuple.of({
				TL: Point,
				BR: Point,
			})
			
			const store = Rect.make().fork(1)
			
			store.for( 'TL' ).for( 'X' ).shift( -2 )
			store.for( 'TL' ).for( 'Y' ).shift( -3 )
			store.for( 'BR' ).for( 'X' ).shift( +5 )
			store.for( 'BR' ).for( 'Y' ).shift( +7 )
			
			$mol_assert_like( store.for( 'TL' ).for( 'X' ).value, -2 )
			$mol_assert_like( store.for( 'TL' ).for( 'Y' ).value, -3 )
			$mol_assert_like( store.for( 'BR' ).for( 'X' ).value, +5 )
			$mol_assert_like( store.for( 'BR' ).for( 'Y' ).value, +7 )
			
			$mol_assert_like( store.toJSON(), $hyoo_crowd_delta(
				[ "TL", "X", -2, "Y", -3, "BR", "X", +5, "Y", +7 ],
				[ -4, -1, +1000001, -1, +2000001, -4, -1, +3000001, -1, +4000001 ],
			) )
			
		},
		
	})
}
