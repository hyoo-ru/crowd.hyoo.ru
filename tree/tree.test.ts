namespace $ {
	$mol_test({
		
		'Default state'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			$mol_assert_like( store.root.value(), null )
			$mol_assert_like( store.root.bool(), false )
			$mol_assert_like( store.root.numb(), 0 )
			$mol_assert_like( store.root.str(), '' )
			$mol_assert_like( store.root.list(), [] )
			$mol_assert_like( store.delta(), [] )
			
		},
		
		'Serial changes'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			$mol_assert_like( store.root.value(), null )
			$mol_assert_like( store.root.list(), [] )
			
			$mol_assert_like( store.root.bool(), false )
			store.root.bool( true )
			$mol_assert_like( store.root.value(), true )
			$mol_assert_like( store.root.list(), [ true ] )
			
			$mol_assert_like( store.root.numb(), 1 )
			store.root.numb( 1 )
			$mol_assert_like( store.root.value(), 1 )
			$mol_assert_like( store.root.list(), [ 1 ] )
			
			$mol_assert_like( store.root.str(), '1' )
			store.root.str( 'x' )
			$mol_assert_like( store.root.value(), 'x' )
			$mol_assert_like( store.root.list(), [ 'x' ] )
			
			store.root.value( null )
			$mol_assert_like( store.root.value(), null )
			$mol_assert_like( store.root.list(), [] )
			
			$mol_assert_like(
				store.delta().map( chunk => chunk.data ),
				[ null ]
			)
			
		},
		
		'Name spaces'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.root.sub( 'foo' ).sub( 'bar' ).numb( 111 )
			store.root.sub( 'foo' ).sub( 'ton' ).numb( 222 )

			$mol_assert_like( store.root.list(), [] )
			$mol_assert_like( store.root.sub( 'foo' ).list(), [] )
			$mol_assert_like( store.root.sub( 'foo' ).sub( 'bar' ).list(), [ 111 ] )
			$mol_assert_like( store.root.sub( 'foo' ).sub( 'ton' ).list(), [ 222 ] )
			
		},
		
		'Name spaces merging'() {
			
			const left = new $hyoo_crowd_tree( 123 )
			left.root.sub( 'foo' ).list([ 111 ])
			
			const right = new $hyoo_crowd_tree( 234 )
			right.root.sub( 'foo' ).list([ 222 ])
			
			const left_delta = left.delta()
			const right_delta = right.delta()
			
			left.apply( right_delta )
			right.apply( left_delta )

			$mol_assert_like(
				left.root.sub( 'foo' ).list(),
				right.root.sub( 'foo' ).list(),
				[ 222, 111 ],
			)
			
		},
		
		'Ignore same changes'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			store.root.str( 'foo' )
			store.root.str( 'foo' )
			store.root.list( [ 'foo' ] )
			
			$mol_assert_like(
				store.delta().map( chunk => chunk.time ),
				[ 1 ]
			)
			
		},
		
		'Serial insert values'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.root.insert([ 'foo' ])
			store.root.insert([ 'bar' ])
			
			$mol_assert_like( store.root.list(), [ 'foo', 'bar' ] )
			
		},
		
		'Concurent insert values'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.root.insert( [ 'foo' ], 0 )
			store.root.insert( [ 'bar' ], 0 )
			
			$mol_assert_like( store.root.list(), [ 'bar', 'foo' ] )
			
		},
		
		'Insert value between others'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.root.insert([ 'foo' ])
			store.root.insert([ 'bar' ])
			store.root.insert( [ 'lol' ], 1 )
			
			$mol_assert_like( store.root.list(), [ 'foo', 'lol', 'bar' ] )
			
		},
		
		'Insert value inside other'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.root.insert([ 'foo' ])
			store.root.branches()[0].insert([ 'bar' ])
			
			$mol_assert_like( store.root.list(), [ 'foo' ] )
			$mol_assert_like( store.root.branches()[0].list(), [ 'bar' ] )
			
		},
		
		'Move existen Chunk'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.root.text( 'foo.bar.lol.' )
			store.root.move( 0, 2 )
			
			$mol_assert_like( store.root.text(), 'bar.foo.lol.' )
			
		},
		
		'Deltas for different versions'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.root.list( [ 'foo', 'bar', 'lol' ] )
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ 321, 2 ],
				]) ).map( chunk => chunk.data ),
				[ 'foo', 'bar', 'lol' ],
			)
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ 123, 0 ],
				]) ).map( chunk => chunk.data ),
				[ 'foo', 'bar', 'lol' ],
			)
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ 123, 1 ],
				]) ).map( chunk => chunk.data ),
				[ 'bar', 'lol' ],
			)
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ 123, 2 ],
				]) ).map( chunk => chunk.data ),
				[ 'lol' ],
			)
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ 123, 3 ],
				]) ),
				[],
			)
			
		},
		
		'Delete with subtree and ignore inserted into deleted'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			store.root.text( 'foo' )
			
			const b2 = store.root.branches()[0]
			b2.text( 'bar' )
			
			const b3 = b2.branches()[0]
			b3.text( 'lol' )
			
			$mol_assert_like( store.root.value(), 'foo' )
			$mol_assert_like( b2.value(), 'bar' )
			$mol_assert_like( b3.value(), 'lol' )
			
			store.root.cut( 0 )
			
			$mol_assert_like( store.root.value(), null )
			$mol_assert_like( b2.value(), null )
			$mol_assert_like( b3.value(), null )
			
		},
		
		'Put/get list'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			$mol_assert_like( store.root.list(), [] )
			
			store.root.list( [ 'foo', 'bar', 'foo' ] )
			const first = store.root.branches()[0]
			first.list( [  'bar', 'foo', 'bar' ] )
			
			$mol_assert_like( store.root.list(), [ 'foo', 'bar', 'foo' ] )
			$mol_assert_like( first.list(), [ 'bar', 'foo', 'bar' ] )
			
		},
		
		'Put/get text'() {
			
			const store1 = new $hyoo_crowd_tree( 123 )
			
			store1.root.text( 'foo bar foo' )
			$mol_assert_like( store1.root.text(), 'foo bar foo' )
			$mol_assert_like( store1.root.list(), [ 'foo ', 'bar ', 'foo' ] )
			
			const store2 = store1.fork( 234 )
			store2.root.text( 'barFFFoo  bar' )
			$mol_assert_like( store2.root.text(), 'barFFFoo  bar' )
			$mol_assert_like( store2.root.list(), [ 'bar', 'FFFoo ', ' ', 'bar' ] )
			
		},
		
		'Text modifications'() {
			
			const store1 = new $hyoo_crowd_tree( 123 )
			store1.root.text( 'foo bar' )
			
			const store2 = store1.fork( 234 )
			store2.root.text( 'foo  bar' )
			$mol_assert_like(
				store1.root.chunks().map( chunk => chunk.self ),
				[
					store2.root.chunks()[0].self,
					store2.root.chunks()[2].self,
				],
			)
			
			const store3 = store2.fork( 345 )
			store3.root.text( 'foo ton bar' )
			$mol_assert_like(
				store2.root.chunks().map( chunk => chunk.self ),
				store3.root.chunks().map( chunk => chunk.self ),
			)
			
			const store4 = store3.fork( 456 )
			store4.root.text( 'foo bar' )
			$mol_assert_like(
				[
					store3.root.chunks()[0].self,
					store3.root.chunks()[2].self,
				],
				store4.root.chunks().map( chunk => chunk.self ),
			)
			
			const store5 = store3.fork( 567 )
			store5.root.text( 'foo ' )
			$mol_assert_like(
				[
					store4.root.chunks()[0].self,
				],
				store5.root.chunks().map( chunk => chunk.self ),
			)
			
		},
		
		'Change sequences'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			$mol_assert_like( store.root.text(), '' )
			
			store.root.text( 'foo' )
			$mol_assert_like( store.root.text(), 'foo' )
			
			store.root.text( 'foo bar' )
			$mol_assert_like( store.root.text(), 'foo bar' )
			
			store.root.text( 'foo lol bar' )
			$mol_assert_like( store.root.text(), 'foo lol bar' )
			
			store.root.text( 'lol bar' )
			$mol_assert_like( store.root.text(), 'lol bar' )
			
			store.root.text( 'foo bar' )
			$mol_assert_like( store.root.text(), 'foo bar' )
			
		},
		
		'Merge different sequences'() {
			
			const left = new $hyoo_crowd_tree( 123 )
			left.root.text( 'foo bar.' )
			
			const right = new $hyoo_crowd_tree( 234 )
			right.root.text( 'xxx yyy.' )
			
			const left_delta = left.delta()
			const right_delta = right.delta()
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.root.text(),
				right.root.text(),
				'xxx yyy.foo bar.',
			)
			
		},
		
		'Merge different insertions to same place of same sequence'() {
			
			const base = new $hyoo_crowd_tree( 123 )
			base.root.text( 'foo bar' )
			
			const left = base.fork( 234 )
			left.root.text( 'foo xxx bar' )
			
			const right = base.fork( 345 )
			right.root.text( 'foo yyy bar' )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.root.text(),
				right.root.text(),
				'foo yyy xxx bar',
			)
			
		},
		
		'Insert after moved'() {
			
			const base = new $hyoo_crowd_tree( 123 )
			base.root.text( 'foo bar zak' )
			
			const left = base.fork( 234 )
			left.root.text( 'foo xxx bar zak' )
			
			const right = base.fork( 345 )
			right.insert( right.root.chunks()[0], 0, 2 )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.root.text(),
				right.root.text(),
				'bar foo xxx zak',
			)
			
		},
		
		'Insert before moved left'() {
			
			const base = new $hyoo_crowd_tree( 123 )
			base.root.text( 'foo bar zak' )
			
			const left = base.fork( 234 )
			left.root.text( 'foo xxx bar zak' )
			
			const right = base.fork( 345 )
			right.insert( right.root.chunks()[1], 0, 0 )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.root.text(),
				right.root.text(),
				'bar foo xxx zak',
			)
			
		},
		
		'Insert before moved right'() {
			
			const base = new $hyoo_crowd_tree( 123 )
			base.root.text( 'foo bar.zak.' )
			
			const left = base.fork( 234 )
			left.root.text( 'foo xxx bar.zak.' )
			
			const right = base.fork( 345 )
			right.insert( right.root.chunks()[1], 0, 3 )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.root.text(),
				right.root.text(),
				'foo xxx zak.bar.',
			)
			
		},
		
		'Insert after removed'() {
			
			const base = new $hyoo_crowd_tree( 123 )
			base.root.text( 'foo bar' )
			
			const left = base.fork( 234 )
			left.root.text( 'foo xxx bar' )
			
			const right = base.fork( 345 )
			right.root.text( 'bar' )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.root.text(),
				right.root.text(),
				'xxx bar',
			)
			
		},
		
		'Insert after removed out'() {
			
			const base = new $hyoo_crowd_tree( 123 )
			base.branch( 111 ).text( 'foo bar|zak' )
			
			const left = base.fork( 234 )
			left.branch( 111 ).text( 'foo bar|xxx zak' )
			
			const right = base.fork( 345 )
			right.insert( right.branch( 111 ).chunks()[1], 222, 0 )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.branch( 111 ).text(),
				right.branch( 111 ).text(),
				'foo xxx zak',
			)
			
			$mol_assert_like(
				left.branch( 222 ).text(),
				right.branch( 222 ).text(),
				'bar|',
			)
			
		},
		
		'Merge text changes'() {
			
			const base = new $hyoo_crowd_tree( 123 )
			base.root.text( 'Hello World and fun!' )
			
			const left = base.fork( 234 )
			const right = base.fork( 345 )
			
			left.root.text( 'Hello Alice and fun!' )
			right.root.text( 'Bye World and fun!' )
			
			const left_delta = left.delta()
			const right_delta = right.delta()
			
			left.apply( right_delta )
			right.apply( left_delta )

			$mol_assert_equal(
				left.root.text(),
				right.root.text(),
				'Bye Alice and fun!',
			)

		},
		
		'Write into token'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			store.root.text( 'foobar' )
			store.root.write( 'xyz', 3 )
			
			$mol_assert_like( store.root.list(), [ 'fooxyzbar' ] )
			
		},
		
		'Write into token with split'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			store.root.text( 'foobar' )
			store.root.write( 'XYZ', 2, 4 )
			
			$mol_assert_like( store.root.list(), [ 'fo', 'XYZar' ] )
			
		},
		
		'Write over few tokens'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			store.root.text( 'xxx foo bar yyy' )
			store.root.write( 'X Y Z', 6, 9 )
			
			$mol_assert_like( store.root.list(), [ 'xxx ', 'fo', 'X ', 'Y ', 'Zar ', 'yyy' ] )
			
		},
		
		'Write whole token'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			store.root.text( 'xxxFoo yyy' )
			store.root.write( 'bar', 3, 7 )
			
			$mol_assert_like( store.root.list(), [ 'xxxbaryyy' ] )
			
		},
		
		'Write whole text'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			store.root.text( 'foo bar' )
			store.root.write( 'xxx', 0, 7 )
			
			$mol_assert_like( store.root.list(), [ 'xxx' ] )
			
		},
		
		'Write at the end'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			store.root.text( 'foo' )
			store.root.write( 'bar' )
			
			$mol_assert_like( store.root.list(), [ 'foobar' ] )
			
		},
		
		'Write between tokens'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			store.root.text( 'foo bar' )
			store.root.write( 'xxx', 4 )
			
			$mol_assert_like( store.root.list(), [ 'foo ', 'xxxbar' ] )
			
		},

		'Offset <=> path'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			store.root.text( 'foo bar' )
			const [ first, second ] = store.root.chunks()
			
			$mol_assert_like(
				store.root.point_by_offset( 0 ),
				{ chunk: first.self, offset: 0 },
			)
			$mol_assert_like(
				store.root.offset_by_point({ chunk: first.self, offset: 0 }),
				0,
			)
			
			$mol_assert_like(
				store.root.point_by_offset( 4 ),
				{ chunk: second.self, offset: 0 },
			)
			$mol_assert_like(
				store.root.offset_by_point({ chunk: second.self, offset: 0 }),
				4,
			)
			
			$mol_assert_like(
				store.root.point_by_offset( 6 ),
				{ chunk: second.self, offset: 2 },
			)
			$mol_assert_like(
				store.root.offset_by_point({ chunk: second.self, offset: 2 }),
				6,
			)
			
			$mol_assert_like(
				store.root.point_by_offset( 7 ),
				{ chunk: store.root.head, offset: 7 },
			)
			$mol_assert_like(
				store.root.offset_by_point({ chunk: store.root.head, offset: 7 }),
				7,
			)
			
		},

	})
}
