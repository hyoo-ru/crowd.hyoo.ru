namespace $ {
	$mol_test({
		
		'Default state'() {
			const store = new $hyoo_crowd_text()
			$mol_assert_like( store.text(), '' )
		},
		
		'Auto tokenize'() {
			
			const store = new $hyoo_crowd_text().fork(1)
			store.text( 'foo bar' )
			
			$mol_assert_like( store.tokens.length, 2 )
			$mol_assert_like( store.text(), 'foo bar' )
			$mol_assert_like( store.root.delta().stamps, [ +2000001, +4000001 ] )
			
		},
		
		'Replace with same tokens count'() {
			
			const store = new $hyoo_crowd_text().fork(1)
			store.text( 'foo bar' )
			store.text( 'xxx yyy' )
			
			$mol_assert_like( store.tokens.length, 2 )
			$mol_assert_like( store.text(), 'xxx yyy' )
			$mol_assert_like( store.root.delta().stamps, [ +2000001, +4000001 ] )
			
		},
		
		'Replace with more tokens count'() {
			
			const store = new $hyoo_crowd_text().fork(1)
			store.text( 'foo bar' )
			store.text( 'foo de bar' )
			
			$mol_assert_like( store.tokens.length, 3 )
			$mol_assert_like( store.text(), 'foo de bar' )
			$mol_assert_like( store.root.delta().stamps, [ +2000001, +6000001, +4000001 ] )
			
		},
		
		'Replace with more tokens count with side changes'() {
			
			const store = new $hyoo_crowd_text().fork(1)
			store.text( 'foo  bar' )
			store.text( 'foo de bar' )
			
			$mol_assert_like( store.tokens.length, 3 )
			$mol_assert_like( store.text(), 'foo de bar' )
			$mol_assert_like( store.root.delta().stamps, [ +2000001, +4000001, +6000001 ] )
			
		},
		
		'Space doubling'() {
			
			const store = new $hyoo_crowd_text().fork(1)
			store.text( 'foo bar' )
			store.text( 'foo  bar' )
			
			$mol_assert_like( store.tokens.length, 3 )
			$mol_assert_like( store.text(), 'foo  bar' )
			$mol_assert_like( store.root.delta().stamps, [ +2000001, +6000001, +4000001 ] )
			
		},
		
		'Replace with less tokens count'() {
			
			const store = new $hyoo_crowd_text().fork(1)
			store.text( 'foo de bar' )
			store.text( 'foo bar' )
			
			$mol_assert_like( store.tokens.length, 2 )
			$mol_assert_like( store.text(), 'foo bar' )
			$mol_assert_like( store.root.delta().stamps, [ +2000001, +6000001, -7000001 ] )
			
		},
		
		'Cut from end'() {
			
			const store = new $hyoo_crowd_text().fork(1)
			store.text( 'foo bar' )
			store.text( 'foo' )
			
			$mol_assert_like( store.text(), 'foo' )
			$mol_assert_like( store.tokens.length, 1 )
			$mol_assert_like( store.root.delta().stamps, [ +2000001, -6000001 ] )
			
		},
		
		'Concurrent changes'() {
			
			const base = new $hyoo_crowd_text()
			base.text( 'Hello World and fun!' )
			
			const left = base.fork(1)
			const right = base.fork(2)
			
			left.text( 'Hello Alice and fun!' )
			right.text( 'Say: Hello World and fun!' )
			
			const left_delta = left.delta()
			const right_delta = right.delta()
			
			left.apply( right_delta )
			right.apply( left_delta )

			$mol_assert_equal(
				left.text(),
				right.text(),
				'Say: Hello Alice and fun!',
			)
			
		},
		
		'Splice inside token'() {
			
			const store = new $hyoo_crowd_text().fork(1)
			store.text( 'foobar' )
			store.write( 'XYZ', 2, 2 )
			
			$mol_assert_like( store.text(), 'foXYZar' )
			$mol_assert_like( store.tokens.length, 2 )
			
		},
		
		'Splice over some tokens'() {
			
			const store = new $hyoo_crowd_text().fork(1)
			store.text( 'xxx foo bar yyy' )
			store.write( 'X Y Z', 6, 3 )
			
			$mol_assert_like( store.text(), 'xxx foX Y Zar yyy' )
			$mol_assert_like( store.tokens.length, 6 )
			
		},
		
		'Splice whole token'() {
			
			const store = new $hyoo_crowd_text().fork(1)
			store.text( 'xxx foo yyy' )
			store.write( 'bar', 4, 4 )
			
			$mol_assert_like( store.text(), 'xxx baryyy' )
			$mol_assert_like( store.tokens.length, 2 )
			
		},
		
		'Splice whole text'() {
			
			const store = new $hyoo_crowd_text().fork(1)
			store.text( 'foo bar' )
			store.write( 'xxx', 0, 7 )
			
			$mol_assert_like( store.text(), 'xxx' )
			$mol_assert_like( store.tokens.length, 1 )
			
		},
		
		'Splice at the end'() {
			
			const store = new $hyoo_crowd_text().fork(1)
			store.text( 'foo' )
			store.write( 'xxx', 3 )
			
			$mol_assert_like( store.text(), 'fooxxx' )
			$mol_assert_like( store.tokens.length, 1 )
			
		},
		
		'Splice between tokens'() {
			
			const store = new $hyoo_crowd_text().fork(1)
			store.text( 'foo bar' )
			store.write( 'xxx', 4 )
			
			$mol_assert_like( store.text(), 'foo xxxbar' )
			$mol_assert_like( store.tokens.length, 2 )
			
		},
		
		'Offset <=> path'() {
			
			const obj = { foo: 1, bar: 2 };
			const { foo, ...restObjectItems } = obj;
			
			const store = new $hyoo_crowd_text().fork(1)
			store.text( 'foo bar' )
			
			$mol_assert_like(
				store.point_by_offset( 0 ),
				[ store.tokens[0], 0 ],
			)
			$mol_assert_like(
				store.offset_by_point([ store.tokens[0], 0 ]),
				0,
			)
			
			$mol_assert_like(
				store.point_by_offset( 4 ),
				[ store.tokens[1], 0 ],
			)
			$mol_assert_like(
				store.offset_by_point([ store.tokens[1], 0 ]),
				4,
			)
			
			$mol_assert_like(
				store.point_by_offset( 6 ),
				[ store.tokens[1], 2 ],
			)
			$mol_assert_like(
				store.offset_by_point([ store.tokens[1], 2 ]),
				6,
			)
			
			$mol_assert_like(
				store.point_by_offset( 7 ),
				[ 0, 0 ],
			)
			$mol_assert_like(
				store.offset_by_point([ 0, 0 ]),
				7,
			)
			
		},
		
	})
}
