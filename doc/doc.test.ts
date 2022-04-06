namespace $ {
	$mol_test({
		
		'Default state'() {
			
			const store = new $hyoo_crowd_doc( 123 )
			
			$mol_assert_like( $hyoo_crowd_reg.for( store ).value(), null )
			$mol_assert_like( $hyoo_crowd_reg.for( store ).bool(), false )
			$mol_assert_like( $hyoo_crowd_reg.for( store ).numb(), 0 )
			$mol_assert_like( $hyoo_crowd_reg.for( store ).str(), '' )
			$mol_assert_like( $hyoo_crowd_list.for( store ).list(), [] )
			$mol_assert_like( store.delta(), [] )
			
		},
		
		'Serial changes'() {
			
			const store = new $hyoo_crowd_doc( 123 )
			$mol_assert_like( $hyoo_crowd_reg.for( store ).value(), null )
			$mol_assert_like( $hyoo_crowd_list.for( store ).list(), [] )
			
			$mol_assert_like( $hyoo_crowd_reg.for( store ).bool(), false )
			$hyoo_crowd_reg.for( store ).bool( true )
			$mol_assert_like( $hyoo_crowd_reg.for( store ).value(), true )
			$mol_assert_like( $hyoo_crowd_list.for( store ).list(), [ true ] )
			
			$mol_assert_like( $hyoo_crowd_reg.for( store ).numb(), 1 )
			$hyoo_crowd_reg.for( store ).numb( 1 )
			$mol_assert_like( $hyoo_crowd_reg.for( store ).value(), 1 )
			$mol_assert_like( $hyoo_crowd_list.for( store ).list(), [ 1 ] )
			
			$mol_assert_like( $hyoo_crowd_reg.for( store ).str(), '1' )
			$hyoo_crowd_reg.for( store ).str( 'x' )
			$mol_assert_like( $hyoo_crowd_reg.for( store ).value(), 'x' )
			$mol_assert_like( $hyoo_crowd_list.for( store ).list(), [ 'x' ] )
			
			$hyoo_crowd_reg.for( store ).value( null )
			$mol_assert_like( $hyoo_crowd_reg.for( store ).value(), null )
			$mol_assert_like( $hyoo_crowd_list.for( store ).list(), [] )
			
			$mol_assert_like(
				store.delta().map( chunk => chunk.data ),
				[ null ]
			)
			
		},
		
		'Name spaces'() {
			
			const store = new $hyoo_crowd_doc( 123 )
			
			store.root.sub( 'foo', $hyoo_crowd_struct ).sub( 'bar', $hyoo_crowd_reg ).numb( 111 )
			store.root.sub( 'foo', $hyoo_crowd_struct ).sub( 'ton', $hyoo_crowd_reg ).numb( 222 )

			$mol_assert_like( $hyoo_crowd_list.for( store ).list(), [] )
			$mol_assert_like( store.root.sub( 'foo', $hyoo_crowd_list ).list(), [] )
			$mol_assert_like( store.root.sub( 'foo', $hyoo_crowd_struct ).sub( 'bar', $hyoo_crowd_list ).list(), [ 111 ] )
			$mol_assert_like( store.root.sub( 'foo', $hyoo_crowd_struct ).sub( 'ton', $hyoo_crowd_list ).list(), [ 222 ] )
			
		},
		
		'Name spaces merging'() {
			
			const left = new $hyoo_crowd_doc( 123 )
			left.root.sub( 'foo', $hyoo_crowd_list ).list([ 111 ])
			
			const right = new $hyoo_crowd_doc( 234 )
			right.root.sub( 'foo', $hyoo_crowd_list ).list([ 222 ])
			
			const left_delta = left.delta()
			const right_delta = right.delta()
			
			left.apply( right_delta )
			right.apply( left_delta )

			$mol_assert_like(
				left.root.sub( 'foo', $hyoo_crowd_list ).list(),
				right.root.sub( 'foo', $hyoo_crowd_list ).list(),
				[ 222, 111 ],
			)
			
		},
		
		'Ignore same changes'() {
			
			const store = new $hyoo_crowd_doc( 123 )
			$hyoo_crowd_reg.for( store ).str( 'foo' )
			const time = store.clock.now
			
			$hyoo_crowd_reg.for( store ).str( 'foo' )
			$hyoo_crowd_list.for( store ).list( [ 'foo' ] )
			
			$mol_assert_like(
				store.delta().map( chunk => chunk.time ),
				[ time ]
			)
			
		},
		
		'Serial insert values'() {
			
			const store = new $hyoo_crowd_doc( 123 )
			
			$hyoo_crowd_list.for( store ).insert([ 'foo' ])
			$hyoo_crowd_list.for( store ).insert([ 'bar' ])
			
			$mol_assert_like( $hyoo_crowd_list.for( store ).list(), [ 'foo', 'bar' ] )
			
		},
		
		'Concurent insert values'() {
			
			const store = new $hyoo_crowd_doc( 123 )
			
			$hyoo_crowd_list.for( store ).insert( [ 'foo' ], 0 )
			$hyoo_crowd_list.for( store ).insert( [ 'bar' ], 0 )
			
			$mol_assert_like( $hyoo_crowd_list.for( store ).list(), [ 'bar', 'foo' ] )
			
		},
		
		'Insert value between others'() {
			
			const store = new $hyoo_crowd_doc( 123 )
			
			$hyoo_crowd_list.for( store ).insert([ 'foo' ])
			$hyoo_crowd_list.for( store ).insert([ 'bar' ])
			$hyoo_crowd_list.for( store ).insert( [ 'lol' ], 1 )
			
			$mol_assert_like( $hyoo_crowd_list.for( store ).list(), [ 'foo', 'lol', 'bar' ] )
			
		},
		
		'Insert value inside other'() {
			
			const store = new $hyoo_crowd_doc( 123 )
			
			$hyoo_crowd_list.for( store ).insert([ 'foo' ])
			store.root.nodes( $hyoo_crowd_list )[0].insert([ 'bar' ])
			
			$mol_assert_like( $hyoo_crowd_list.for( store ).list(), [ 'foo' ] )
			$mol_assert_like( store.root.nodes( $hyoo_crowd_list )[0].list(), [ 'bar' ] )
			
		},
		
		'Move existen Chunk'() {
			
			const store = new $hyoo_crowd_doc( 123 )
			
			$hyoo_crowd_text.for( store ).text( 'FooBarLol' )
			$hyoo_crowd_list.for( store ).move( 0, 2 )
			
			$mol_assert_like( $hyoo_crowd_text.for( store ).text(), 'BarFooLol' )
			
		},
		
		'Deltas for different versions'() {
			
			const store = new $hyoo_crowd_doc( 123 )
			
			$hyoo_crowd_list.for( store ).list( [ 'foo', 'bar', 'lol' ] )
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ 321, 2 ],
				]) ).map( chunk => chunk.data ),
				[ 'foo', 'bar', 'lol' ],
			)
			
			const time = store.clock.now
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ 123, time - 3 ],
				]) ).map( chunk => chunk.data ),
				[ 'foo', 'bar', 'lol' ],
			)
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ 123, time - 2 ],
				]) ).map( chunk => chunk.data ),
				[ 'bar', 'lol' ],
			)
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ 123, time - 1 ],
				]) ).map( chunk => chunk.data ),
				[ 'lol' ],
			)
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ 123, time ],
				]) ),
				[],
			)
			
		},
		
		'Delete with subtree and ignore inserted into deleted'() {
			
			const store = new $hyoo_crowd_doc( 123 )
			$hyoo_crowd_text.for( store ).text( 'foo' )
			
			const b2 = store.root.nodes( $hyoo_crowd_text )[0]
			b2.text( 'bar' )
			
			const b3 = b2.nodes( $hyoo_crowd_text )[0]
			b3.text( 'lol' )
			
			$mol_assert_like( $hyoo_crowd_reg.for( store ).value(), 'foo' )
			$mol_assert_like( b2.as( $hyoo_crowd_reg ).value(), 'bar' )
			$mol_assert_like( b3.as( $hyoo_crowd_reg ).value(), 'lol' )
			
			$hyoo_crowd_list.for( store ).cut( 0 )
			
			$mol_assert_like( $hyoo_crowd_reg.for( store ).value(), null )
			$mol_assert_like( b2.as( $hyoo_crowd_reg ).value(), null )
			$mol_assert_like( b3.as( $hyoo_crowd_reg ).value(), null )
			
		},
		
		'Put/get list'() {
			
			const store = new $hyoo_crowd_doc( 123 )
			$mol_assert_like( $hyoo_crowd_list.for( store ).list(), [] )
			
			$hyoo_crowd_list.for( store ).list( [ 'foo', 'bar', 'foo' ] )
			const first = store.root.nodes( $hyoo_crowd_list )[0]
			first.list( [  'bar', 'foo', 'bar' ] )
			
			$mol_assert_like( $hyoo_crowd_list.for( store ).list(), [ 'foo', 'bar', 'foo' ] )
			$mol_assert_like( first.list(), [ 'bar', 'foo', 'bar' ] )
			
		},
		
		'Put/get text'() {
			
			const store1 = new $hyoo_crowd_doc( 123 )
			
			$hyoo_crowd_text.for( store1 ).text( 'foo bar foo' )
			$mol_assert_like( $hyoo_crowd_text.for( store1 ).text(), 'foo bar foo' )
			$mol_assert_like( $hyoo_crowd_list.for( store1 ).list(), [ 'foo', ' ', 'bar', ' ', 'foo' ] )
			
			const store2 = store1.fork( 234 )
			$hyoo_crowd_text.for( store2 ).text( 'barFFFoo  bar' )
			$mol_assert_like( $hyoo_crowd_text.for( store2 ).text(), 'barFFFoo  bar' )
			$mol_assert_like( $hyoo_crowd_list.for( store2 ).list(), [ 'bar', 'FFFoo', '  ', 'bar' ] )
			
		},
		
		'Text modifications'() {
			
			const store1 = new $hyoo_crowd_doc( 123 )
			$hyoo_crowd_text.for( store1 ).text( 'foo bar' )
			
			const store2 = store1.fork( 234 )
			$hyoo_crowd_text.for( store2 ).text( 'foo  bar' )
			$mol_assert_like(
				store1.root.chunks().map( chunk => chunk.self ),
				store2.root.chunks().map( chunk => chunk.self ),
			)
			
			const store3 = store2.fork( 345 )
			$hyoo_crowd_text.for( store3 ).text( 'foo ton bar' )
			$mol_assert_like(
				store2.root.chunks().map( chunk => chunk.self ),
				[
					store3.root.chunks()[0].self,
					store3.root.chunks()[3].self,
					store3.root.chunks()[4].self,
				],
			)
			
			const store4 = store3.fork( 456 )
			$hyoo_crowd_text.for( store4 ).text( 'foo bar' )
			$mol_assert_like(
				[
					store3.root.chunks()[0].self,
					store3.root.chunks()[1].self,
					store3.root.chunks()[4].self,
				],
				store4.root.chunks().map( chunk => chunk.self ),
			)
			
			const store5 = store3.fork( 567 )
			$hyoo_crowd_text.for( store5 ).text( 'foo ' )
			$mol_assert_like(
				[
					store4.root.chunks()[0].self,
					store4.root.chunks()[1].self,
				],
				store5.root.chunks().map( chunk => chunk.self ),
			)
			
		},
		
		'Change sequences'() {
			
			const store = new $hyoo_crowd_doc( 123 )
			$mol_assert_like( $hyoo_crowd_text.for( store ).text(), '' )
			
			$hyoo_crowd_text.for( store ).text( 'foo' )
			$mol_assert_like( $hyoo_crowd_text.for( store ).text(), 'foo' )
			
			$hyoo_crowd_text.for( store ).text( 'foo bar' )
			$mol_assert_like( $hyoo_crowd_text.for( store ).text(), 'foo bar' )
			
			$hyoo_crowd_text.for( store ).text( 'foo lol bar' )
			$mol_assert_like( $hyoo_crowd_text.for( store ).text(), 'foo lol bar' )
			
			$hyoo_crowd_text.for( store ).text( 'lol bar' )
			$mol_assert_like( $hyoo_crowd_text.for( store ).text(), 'lol bar' )
			
			$hyoo_crowd_text.for( store ).text( 'foo bar' )
			$mol_assert_like( $hyoo_crowd_text.for( store ).text(), 'foo bar' )
			
		},
		
		'Merge different sequences'() {
			
			const left = new $hyoo_crowd_doc( 123 )
			$hyoo_crowd_text.for( left ).text( 'foo bar.' )
			
			const right = new $hyoo_crowd_doc( 234 )
			$hyoo_crowd_text.for( right ).text( 'xxx yyy.' )
			
			const left_delta = left.delta()
			const right_delta = right.delta()
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				$hyoo_crowd_text.for( left ).text(),
				$hyoo_crowd_text.for( right ).text(),
				'xxx yyy.foo bar.',
			)
			
		},
		
		'Merge different insertions to same place of same sequence'() {
			
			const base = new $hyoo_crowd_doc( 123 )
			$hyoo_crowd_text.for( base).text( 'foo bar' )
			
			const left = base.fork( 234 )
			$hyoo_crowd_text.for( left ).text( 'foo xxx bar' )
			
			const right = base.fork( 345 )
			$hyoo_crowd_text.for( right ).text( 'foo yyy bar' )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				$hyoo_crowd_text.for( left ).text(),
				$hyoo_crowd_text.for( right ).text(),
				'foo yyy xxx bar',
			)
			
		},
		
		'Insert after moved'() {
			
			const base = new $hyoo_crowd_doc( 123 )
			$hyoo_crowd_text.for( base).text( 'FooBarZak' )
			
			const left = base.fork( 234 )
			$hyoo_crowd_text.for( left ).text( 'FooXxxBarZak' )
			
			const right = base.fork( 345 )
			right.insert( right.root.chunks()[0], 0, 2 )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				$hyoo_crowd_text.for( left ).text(),
				$hyoo_crowd_text.for( right ).text(),
				'XxxBarFooZak',
			)
			
		},
		
		'Insert before moved left'() {
			
			const base = new $hyoo_crowd_doc( 123 )
			$hyoo_crowd_text.for( base).text( 'fooBarZak' )
			
			const left = base.fork( 234 )
			$hyoo_crowd_text.for( left ).text( 'FooXxxBarZak' )
			
			const right = base.fork( 345 )
			right.insert( right.root.chunks()[1], 0, 0 )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				$hyoo_crowd_text.for( left ).text(),
				$hyoo_crowd_text.for( right ).text(),
				'BarFooXxxZak',
			)
			
		},
		
		'Insert before moved right'() {
			
			const base = new $hyoo_crowd_doc( 123 )
			$hyoo_crowd_text.for( base).text( 'FooBarZak' )
			
			const left = base.fork( 234 )
			$hyoo_crowd_text.for( left ).text( 'FooXxxBarZak' )
			
			const right = base.fork( 345 )
			right.insert( right.root.chunks()[1], 0, 3 )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				$hyoo_crowd_text.for( left ).text(),
				$hyoo_crowd_text.for( right ).text(),
				'FooXxxZakBar',
			)
			
		},
		
		'Insert after removed'() {
			
			const base = new $hyoo_crowd_doc( 123 )
			$hyoo_crowd_text.for( base).text( 'FooBar' )
			
			const left = base.fork( 234 )
			$hyoo_crowd_text.for( left ).text( 'FooXxxBar' )
			
			const right = base.fork( 345 )
			$hyoo_crowd_text.for( right ).text( 'Bar' )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				$hyoo_crowd_text.for( left ).text(),
				$hyoo_crowd_text.for( right ).text(),
				'XxxBar',
			)
			
		},
		
		'Insert after removed out'() {
			
			const base = new $hyoo_crowd_doc( 123 )
			$hyoo_crowd_text.for( base, 111 ).text( 'FooBarZak' )
			
			const left = base.fork( 234 )
			$hyoo_crowd_text.for( left, 111 ).text( 'FooBarXxxZak' )
			
			const right = base.fork( 345 )
			right.insert( $hyoo_crowd_node.for( right, 111 ).chunks()[1], 222, 0 )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				$hyoo_crowd_text.for( left, 111 ).text(),
				$hyoo_crowd_text.for( right, 111 ).text(),
				'FooXxxZak',
			)
			
			$mol_assert_like(
				$hyoo_crowd_text.for( left, 222 ).text(),
				$hyoo_crowd_text.for( right, 222 ).text(),
				'Bar',
			)
			
		},
		
		'Insert before changed'() {
			
			const base = new $hyoo_crowd_doc( 123 )
			$hyoo_crowd_text.for( base).text( 'XxxYyyZzz' )
			
			const left = base.fork( 234 )
			$hyoo_crowd_text.for( left ).text( 'XxxFooYyyZzz' )
			
			const right = base.fork( 345 )
			$hyoo_crowd_text.for( right ).text( 'XxxBarZzz' )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				$hyoo_crowd_text.for( left ).text(),
				$hyoo_crowd_text.for( right ).text(),
				'XxxBarFooZzz',
			)
			
		},
		
		'Insert between moved'() {
			
			const base = new $hyoo_crowd_doc( 123 )
			$hyoo_crowd_text.for( base).text( '111 222 333 444 555 666' )
			
			const left = base.fork( 234 )
			$hyoo_crowd_text.for( left ).text( '111 222 xxx 333 444 555 666' )
			
			const right = base.fork( 345 )
			right.insert( right.root.chunks()[2], 0, 10 )
			right.insert( right.root.chunks()[2], 0, 10 )
			right.insert( right.root.chunks()[2], 0, 10 )
			right.insert( right.root.chunks()[2], 0, 10 )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				$hyoo_crowd_text.for( left ).text(),
				$hyoo_crowd_text.for( right ).text(),
				'111 444 555 222 333 xxx 666',
			)
			
		},
		
		'Merge text changes'() {
			
			const base = new $hyoo_crowd_doc( 123 )
			$hyoo_crowd_text.for( base).text( 'Hello World and fun!' )
			
			const left = base.fork( 234 )
			const right = base.fork( 345 )
			
			$hyoo_crowd_text.for( left ).text( 'Hello Alice and fun!' )
			$hyoo_crowd_text.for( right ).text( 'Bye World and fun!' )
			
			const left_delta = left.delta()
			const right_delta = right.delta()
			
			left.apply( right_delta )
			right.apply( left_delta )

			$mol_assert_equal(
				$hyoo_crowd_text.for( left ).text(),
				$hyoo_crowd_text.for( right ).text(),
				'Bye Alice and fun!',
			)

		},
		
		'Write into token'() {
			
			const store = new $hyoo_crowd_doc( 123 )
			$hyoo_crowd_text.for( store ).text( 'foobar' )
			$hyoo_crowd_text.for( store ).write( 'xyz', 3 )
			
			$mol_assert_like( $hyoo_crowd_list.for( store ).list(), [ 'fooxyzbar' ] )
			
		},
		
		'Write into token with split'() {
			
			const store = new $hyoo_crowd_doc( 123 )
			$hyoo_crowd_text.for( store ).text( 'foobar' )
			$hyoo_crowd_text.for( store ).write( 'XYZ', 2, 4 )
			
			$mol_assert_like( $hyoo_crowd_list.for( store ).list(), [ 'fo', 'XYZar' ] )
			
		},
		
		'Write over few tokens'() {
			
			const store = new $hyoo_crowd_doc( 123 )
			$hyoo_crowd_text.for( store ).text( 'xxx foo bar yyy' )
			$hyoo_crowd_text.for( store ).write( 'X Y Z', 6, 9 )
			
			$mol_assert_like( $hyoo_crowd_list.for( store ).list(), [ 'xxx', ' ', 'fo', 'X', ' ', 'Y', ' ', 'Zar', ' ', 'yyy' ] )
			
		},
		
		'Write whole token'() {
			
			const store = new $hyoo_crowd_doc( 123 )
			$hyoo_crowd_text.for( store ).text( 'xxxFoo yyy' )
			$hyoo_crowd_text.for( store ).write( 'bar', 3, 7 )
			
			$mol_assert_like( $hyoo_crowd_list.for( store ).list(), [ 'xxxbaryyy' ] )
			
		},
		
		'Write whole text'() {
			
			const store = new $hyoo_crowd_doc( 123 )
			$hyoo_crowd_text.for( store ).text( 'foo bar' )
			$hyoo_crowd_text.for( store ).write( 'xxx', 0, 7 )
			
			$mol_assert_like( $hyoo_crowd_list.for( store ).list(), [ 'xxx' ] )
			
		},
		
		'Write at the end'() {
			
			const store = new $hyoo_crowd_doc( 123 )
			$hyoo_crowd_text.for( store ).text( 'foo' )
			$hyoo_crowd_text.for( store ).write( 'bar' )
			
			$mol_assert_like( $hyoo_crowd_list.for( store ).list(), [ 'foobar' ] )
			
		},
		
		'Write between tokens'() {
			
			const store = new $hyoo_crowd_doc( 123 )
			$hyoo_crowd_text.for( store ).text( 'foo bar' )
			$hyoo_crowd_text.for( store ).write( 'xxx', 4 )
			
			$mol_assert_like( $hyoo_crowd_list.for( store ).list(), [ 'foo', ' ', 'xxxbar' ] )
			
		},

		'Offset <=> Point'() {
			
			const store = new $hyoo_crowd_doc( 123 )
			$hyoo_crowd_text.for( store ).text( 'fooBar' )
			const [ first, second ] = store.root.chunks()
			
			$mol_assert_like(
				$hyoo_crowd_text.for( store ).point_by_offset( 0 ),
				{ chunk: first.self, offset: 0 },
			)
			$mol_assert_like(
				$hyoo_crowd_text.for( store ).offset_by_point({ chunk: first.self, offset: 0 }),
				0,
			)
			
			$mol_assert_like(
				$hyoo_crowd_text.for( store ).point_by_offset( 3 ),
				{ chunk: second.self, offset: 0 },
			)
			$mol_assert_like(
				$hyoo_crowd_text.for( store ).offset_by_point({ chunk: second.self, offset: 0 }),
				3,
			)
			
			$mol_assert_like(
				$hyoo_crowd_text.for( store ).point_by_offset( 5 ),
				{ chunk: second.self, offset: 2 },
			)
			$mol_assert_like(
				$hyoo_crowd_text.for( store ).offset_by_point({ chunk: second.self, offset: 2 }),
				5,
			)
			
			$mol_assert_like(
				$hyoo_crowd_text.for( store ).point_by_offset( 6 ),
				{ chunk: store.root.head, offset: 6 },
			)
			$mol_assert_like(
				$hyoo_crowd_text.for( store ).offset_by_point({ chunk: store.root.head, offset: 6 }),
				6,
			)
			
		},

	})
}
