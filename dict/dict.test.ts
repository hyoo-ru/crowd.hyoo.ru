namespace $ {
	$mol_test({
		
		'Change dict by different keys'() {
			
			const val = $hyoo_crowd_dict.of({ val: $hyoo_crowd_list }).make().fork(1)
			val.for( 'foo' ).insert( 666 )
			val.for( 'bar' ).insert( 777 )
			val.for( 'foo' ).insert( 888, 0 )
			val.for( 'bar' ).cut( 777 )
			
			$mol_assert_like( val.delta(), $hyoo_crowd_delta(
				[ 'foo', 888, 666, 'bar', 777 ],
				[ -2, 3000001, 1000001, -1, -4000001 ],
				[ 4000001 ],
			) )
			
		},
		
		'Slice dict after version'() {
			
			const val = $hyoo_crowd_dict.of({ val: $hyoo_crowd_set }).make().fork(1)
			
			val.for( 'foo' ).add( 1 )
			val.for( 'bar' ).add( 2 )
			val.for( 'xxx' ).add( 3 )
			
			const clock1 = val.clock.fork(0)
			
			val.for( 'foo' ).add( 4 )
			val.for( 'bar' ).add( 5 )
			val.for( 'xxx' ).add( 6 )

			const clock2 = val.clock.fork(0)
			
			$mol_assert_like( val.delta( clock1 ), $hyoo_crowd_delta(
				[ 'foo', 4, 'bar', 5, 'xxx', 6 ],
				[ -1, +4000001, -1, +5000001, -1, +6000001 ],
				[ 6000001 ],
			) )
			
			$mol_assert_like(
				val.delta( clock2 ),
				$hyoo_crowd_delta( [], [], [ 6000001 ] ),
			)
			
		},
		
		'Merge different dicts'() {
			
			const left = $hyoo_crowd_dict.of({ val: $hyoo_crowd_list }).make().fork(1)
			left.for( 'foo' ).insert( 666 )
			left.for( '' ).insert( 'xxx' )
			
			const right = $hyoo_crowd_dict.of({ val: $hyoo_crowd_list }).make().fork(2)
			right.for( 'foo' ).insert( 777 )
			right.for( 'bar' ).insert( 'yyy' )
			right.for( 'bar' ).insert( 'zzz' )
			
			const left_delta = left.delta() 
			const right_delta = right.delta() 
			
			$mol_assert_like(
				left.apply( right_delta ).delta(),
				$hyoo_crowd_delta(
					[ 'foo', 777, 666, '', 'xxx', 'bar', 'yyy', 'zzz' ],
					[ -2, 1000002, 1000001, -1, 2000001, -2, 2000002, 3000002 ],
					[ 2000001, 3000002 ],
				),
			)
			
			$mol_assert_like(
				right.apply( left_delta ).delta(),
				$hyoo_crowd_delta(
					[ 'foo', 777, 666, 'bar', 'yyy', 'zzz', '', 'xxx' ],
					[ -2, 1000002, 1000001, -2, 2000002, 3000002, -1, 2000001 ],
					[ 2000001, 3000002 ],
				),
			)
			
		},
		
		'Merge increases versions in dicts'() {
			
			const base = $hyoo_crowd_dict.of({ val: $hyoo_crowd_list }).make()
			
			const left = base.fork(1)
			left.for( 'foo' ).insert( 'xxx' )
			
			const right = base.fork(2)
			right.for( 'bar' ).insert( 17 )
			right.for( 'bar' ).insert( 18 )
			
			left.apply( right.delta() )
			left.for( 'foo' ).insert( 'yyy' )
			
			$mol_assert_like( left.delta(), $hyoo_crowd_delta(
				[ 'foo', 'xxx', 'yyy', 'bar', 17, 18 ],
				[ -2, 1000001, 3000001, -2, 1000002, 2000002 ],
				[ 2000002, 3000001 ],
			) )
			
		},
		
		'Dictionary of Union'() {
			
			const base = $hyoo_crowd_dict.of({
				val: $hyoo_crowd_union.of({
					string: $hyoo_crowd_reg,
					array: $hyoo_crowd_list,
					object: $hyoo_crowd_set,
				})
			}).make()

			const left = base.fork(1)
			const right = base.fork(2)
			
			left.for( 'foo' ).to( 'string' ).str( 'bar' )
			right.for( 'foo' ).to( 'array' ).insert( 'xxx' )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			$mol_assert_like(
				left.apply( right_delta ).delta(),
				right.apply( left_delta ).delta(),
				$hyoo_crowd_delta(
					[ 'foo', 'array', 'xxx', 'bar' ],
					[ -3, -1000002, 2000002, 2000001 ],
					[ 2000001, 2000002 ],
				),
			)
			
		},
		
		'Dictionary of Dictionary'() {
			
			const base = $hyoo_crowd_dict.of({
				val: $hyoo_crowd_dict.of({
					val: $hyoo_crowd_reg,
				}),
			}).make()

			const left = base.fork(1)
			const right = base.fork(2)
			
			left.for( 'foo' ).for( 'xxx' ).str( '321' )
			right.for( 'foo' ).for( 'yyy' ).str( '123' )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
			
			$mol_assert_like(
				left.for( 'foo' ).for( 'xxx' ).str(),
				right.for( 'foo' ).for( 'xxx' ).str(),
				'321',
			)
			
			$mol_assert_like(
				left.for( 'foo' ).for( 'yyy' ).str(),
				right.for( 'foo' ).for( 'yyy' ).str(),
				'123',
			)
			
		},
		
		'Default tuple state'() {
			
			const store = $hyoo_crowd_dict.of({
				keys: $hyoo_crowd_list,
				vals: $hyoo_crowd_dict.of({ val: $hyoo_crowd_reg }),
			}).make()
			
			$mol_assert_like( store.for('keys').items(), [] )
			$mol_assert_like( store.for('vals').for( 'foo' ).str(), '' )
			
			$mol_assert_like(
				store.delta(),
				$hyoo_crowd_delta( [], [], [] )
			)
			
		},
		
		'Changed tuple state'() {
			
			const Map = $hyoo_crowd_dict.of({
				vers: $hyoo_crowd_numb,
				keys: $hyoo_crowd_set,
				vals: $hyoo_crowd_dict.of({ val: $hyoo_crowd_reg }),
			})
			
			const store = Map.make().fork(1)
			
			store.for( 'keys' ).add( 'foo' ).add( 'bar' )
			store.for( 'vals' ).for( 'xxx' ).str( 'yyy' )
			
			$mol_assert_like( store.for('vers').numb(), 0 )
			$mol_assert_like( store.for('keys').items, [ 'foo', 'bar' ] )
			$mol_assert_like( store.for('vals').for( 'xxx' ).str(), 'yyy' )
			
			$mol_assert_like( store.delta(), $hyoo_crowd_delta(
				[ 'keys', 'foo', 'bar', 'vals', 'xxx', 'yyy' ],
				[ -2, +1000001, +2000001, -2, -1, +3000001 ],
				[ 3000001 ],
			) )
			
		},
		
		'Tuple of tuples'() {
			
			const Point = $hyoo_crowd_dict.of({
				X: $hyoo_crowd_numb,
				Y: $hyoo_crowd_numb,
			})
			
			const Rect = $hyoo_crowd_dict.of({
				TL: Point,
				BR: Point,
			})
			
			const store = Rect.make().fork(1)
			
			store.for( 'TL' ).for( 'X' ).shift( -2 )
			store.for( 'TL' ).for( 'Y' ).shift( -3 )
			store.for( 'BR' ).for( 'X' ).shift( +5 )
			store.for( 'BR' ).for( 'Y' ).shift( +7 )
			
			$mol_assert_like( store.for( 'TL' ).for( 'X' ).numb(), -2 )
			$mol_assert_like( store.for( 'TL' ).for( 'Y' ).numb(), -3 )
			$mol_assert_like( store.for( 'BR' ).for( 'X' ).numb(), +5 )
			$mol_assert_like( store.for( 'BR' ).for( 'Y' ).numb(), +7 )
			
			$mol_assert_like( store.delta(), $hyoo_crowd_delta(
				[ "TL", "X", -2, "Y", -3, "BR", "X", +5, "Y", +7 ],
				[ -4, -1, +1000001, -1, +2000001, -4, -1, +3000001, -1, +4000001 ],
				[ 4000001 ],
			) )
			
		},
		
	})
}
