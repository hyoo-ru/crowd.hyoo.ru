namespace $ {
	$mol_test({
		
		'Default state'() {
			
			const store = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_reg ).value(), null )
			$mol_assert_like( store.root.as( $hyoo_crowd_reg ).bool(), false )
			$mol_assert_like( store.root.as( $hyoo_crowd_reg ).numb(), 0 )
			$mol_assert_like( store.root.as( $hyoo_crowd_reg ).str(), '' )
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [] )
			$mol_assert_like( store.delta(), [] )
			
		},
		
		'Serial changes'() {
			
			const store = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			$mol_assert_like( store.root.as( $hyoo_crowd_reg ).value(), null )
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [] )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_reg ).bool(), false )
			store.root.as( $hyoo_crowd_reg ).bool( true )
			$mol_assert_like( store.root.as( $hyoo_crowd_reg ).value(), true )
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ true ] )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_reg ).numb(), 1 )
			store.root.as( $hyoo_crowd_reg ).numb( 1 )
			$mol_assert_like( store.root.as( $hyoo_crowd_reg ).value(), 1 )
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 1 ] )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_reg ).str(), '1' )
			store.root.as( $hyoo_crowd_reg ).str( 'x' )
			$mol_assert_like( store.root.as( $hyoo_crowd_reg ).value(), 'x' )
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'x' ] )
			
			store.root.as( $hyoo_crowd_reg ).value( null )
			$mol_assert_like( store.root.as( $hyoo_crowd_reg ).value(), null )
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [] )
			
			$mol_assert_like(
				store.delta().map( chunk => chunk.data ),
				[ null ]
			)
			
		},
		
		'Name spaces'() {
			
			const store = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			
			store.root.sub( 'foo', $hyoo_crowd_struct ).sub( 'bar', $hyoo_crowd_reg ).numb( 111 )
			store.root.sub( 'foo', $hyoo_crowd_struct ).sub( 'ton', $hyoo_crowd_reg ).numb( 222 )

			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [] )
			$mol_assert_like( store.root.sub( 'foo', $hyoo_crowd_list ).list(), [] )
			$mol_assert_like( store.root.sub( 'foo', $hyoo_crowd_struct ).sub( 'bar', $hyoo_crowd_list ).list(), [ 111 ] )
			$mol_assert_like( store.root.sub( 'foo', $hyoo_crowd_struct ).sub( 'ton', $hyoo_crowd_list ).list(), [ 222 ] )
			
		},
		
		'Name spaces merging'() {
			
			const left = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			left.root.sub( 'foo', $hyoo_crowd_list ).list([ 111 ])
			
			const right = new $hyoo_crowd_doc( -1, -23, { hi: 2, lo: 34 } )
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
			
			const store = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			store.root.as( $hyoo_crowd_reg ).str( 'foo' )
			const [ time_hi, time_lo ] = [ store.clock.last_hi, store.clock.last_lo ]
			
			store.root.as( $hyoo_crowd_reg ).str( 'foo' )
			store.root.as( $hyoo_crowd_list ).list( [ 'foo' ] )
			
			$mol_assert_like(
				store.delta().map( chunk => [ chunk.time_hi, chunk.time_lo ] ),
				[ [ time_hi, time_lo ] ],
			)
			
		},
		
		'Serial insert values'() {
			
			const store = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			
			store.root.as( $hyoo_crowd_list ).insert([ 'foo' ])
			store.root.as( $hyoo_crowd_list ).insert([ 'bar' ])
			
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'foo', 'bar' ] )
			
		},
		
		'Concurent insert values'() {
			
			const store = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			
			store.root.as( $hyoo_crowd_list ).insert( [ 'foo' ], 0 )
			store.root.as( $hyoo_crowd_list ).insert( [ 'bar' ], 0 )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'bar', 'foo' ] )
			
		},
		
		'Insert value between others'() {
			
			const store = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			
			store.root.as( $hyoo_crowd_list ).insert([ 'foo' ])
			store.root.as( $hyoo_crowd_list ).insert([ 'bar' ])
			store.root.as( $hyoo_crowd_list ).insert( [ 'lol' ], 1 )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'foo', 'lol', 'bar' ] )
			
		},
		
		'Insert value inside other'() {
			
			const store = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			
			store.root.as( $hyoo_crowd_list ).insert([ 'foo' ])
			store.root.nodes( $hyoo_crowd_list )[0].insert([ 'bar' ])
			
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'foo' ] )
			$mol_assert_like( store.root.nodes( $hyoo_crowd_list )[0].list(), [ 'bar' ] )
			
		},
		
		'Insert before removed before changed'() {
			
			const store = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			const node = store.root.as( $hyoo_crowd_list )
			
			node.list([ 'foo', 'bar' ])
			node.list([ 'xxx', 'foo', 'bar' ])
			node.list([ 'xxx', 'bars' ])
			
			$mol_assert_like( node.list(), [ 'xxx', 'bars' ] )
			
		},
		
		'Move existen Chunk'() {
			
			const store = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			
			store.root.as( $hyoo_crowd_text ).text( 'FooBarLol' )
			store.root.as( $hyoo_crowd_list ).move( 0, 2 )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_text ).text(), 'BarFooLol' )
			
		},
		
		'Deltas for different versions'() {
			
			const store = new $hyoo_crowd_doc( -1, -2, { hi: 1, lo: 2 } )
			store.clock.see_time( store.clock.now()[0] + 60, 0 )
			
			store.root.as( $hyoo_crowd_list ).list( [ 'foo', 'bar', 'lol' ] )
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ `3_2`, [2, 22] ],
				]) ).map( chunk => chunk.data ),
				[ 'foo', 'bar', 'lol' ],
			)
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ `1_2`, [ store.clock.last_hi, store.clock.last_lo - 3 ] ],
				]) ).map( chunk => chunk.data ),
				[ 'foo', 'bar', 'lol' ],
			)
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ `1_2`, [ store.clock.last_hi, store.clock.last_lo - 2 ] ],
				]) ).map( chunk => chunk.data ),
				[ 'bar', 'lol' ],
			)
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ `1_2`, [ store.clock.last_hi, store.clock.last_lo - 1 ] ],
				]) ).map( chunk => chunk.data ),
				[ 'lol' ],
			)
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ `1_2`, [ store.clock.last_hi, store.clock.last_lo ] ],
				]) ),
				[],
			)
			
		},
		
		'Delete with subtree and ignore inserted into deleted'() {
			
			const store = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			store.root.as( $hyoo_crowd_text ).text( 'foo' )
			
			const b2 = store.root.nodes( $hyoo_crowd_text )[0]
			b2.text( 'bar' )
			
			const b3 = b2.nodes( $hyoo_crowd_text )[0]
			b3.text( 'lol' )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_reg ).value(), 'foo' )
			$mol_assert_like( b2.as( $hyoo_crowd_reg ).value(), 'bar' )
			$mol_assert_like( b3.as( $hyoo_crowd_reg ).value(), 'lol' )
			
			store.root.as( $hyoo_crowd_list ).cut( 0 )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_reg ).value(), null )
			$mol_assert_like( b2.as( $hyoo_crowd_reg ).value(), null )
			$mol_assert_like( b3.as( $hyoo_crowd_reg ).value(), null )
			
		},
		
		'Put/get list'() {
			
			const store = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [] )
			
			store.root.as( $hyoo_crowd_list ).list( [ 'foo', 'bar', 'foo' ] )
			const first = store.root.nodes( $hyoo_crowd_list )[0]
			first.list( [  'bar', 'foo', 'bar' ] )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'foo', 'bar', 'foo' ] )
			$mol_assert_like( first.list(), [ 'bar', 'foo', 'bar' ] )
			
		},
		
		'Put/get text'() {
			
			const store1 = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			
			store1.root.as( $hyoo_crowd_text ).text( 'foo bar foo' )
			$mol_assert_like( store1.root.as( $hyoo_crowd_text ).text(), 'foo bar foo' )
			$mol_assert_like( store1.root.as( $hyoo_crowd_list ).list(), [ 'foo', ' bar', ' foo' ] )
			
			const store2 = store1.fork({ hi: 2, lo: 34 } )
			store2.root.as( $hyoo_crowd_text ).text( 'barFFFoo  bar' )
			$mol_assert_like( store2.root.as( $hyoo_crowd_text ).text(), 'barFFFoo  bar' )
			$mol_assert_like( store2.root.as( $hyoo_crowd_list ).list(), [ 'bar', 'FFFoo', ' ', ' bar' ] )
			
		},
		
		'Text modifications'() {
			
			const store1 = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			store1.root.as( $hyoo_crowd_text ).text( 'foo bar' )
			
			const store2 = store1.fork({ hi: 2, lo: 34 } )
			store2.root.as( $hyoo_crowd_text ).text( 'foo  bar' )
			$mol_assert_like(
				store1.root.chunks().map( chunk => chunk.self_hi ),
				[
					store2.root.chunks()[0].self_hi,
					store2.root.chunks()[2].self_hi,
				],
			)
			
			const store3 = store2.fork({ hi: 3, lo: 45 })
			store3.root.as( $hyoo_crowd_text ).text( 'foo ton bar' )
			$mol_assert_like(
				store2.root.chunks().map( chunk => chunk.self_hi ),
				[
					store3.root.chunks()[0].self_hi,
					store3.root.chunks()[1].self_hi,
					store3.root.chunks()[2].self_hi,
				],
			)
			
			const store4 = store3.fork({ hi: 4, lo: 56 })
			store4.root.as( $hyoo_crowd_text ).text( 'foo bar' )
			$mol_assert_like(
				[
					store3.root.chunks()[0].self_hi,
					store3.root.chunks()[2].self_hi,
				],
				store4.root.chunks().map( chunk => chunk.self_hi ),
			)
			
			const store5 = store3.fork({ hi: 5, lo: 67 })
			store5.root.as( $hyoo_crowd_text ).text( 'foo ' )
			$mol_assert_like(
				[
					store4.root.chunks()[0].self_hi,
					store4.root.chunks()[1].self_hi,
				],
				store5.root.chunks().map( chunk => chunk.self_hi ),
			)
			
		},
		
		'Change sequences'() {
			
			const store = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			$mol_assert_like( store.root.as( $hyoo_crowd_text ).text(), '' )
			
			store.root.as( $hyoo_crowd_text ).text( 'foo' )
			$mol_assert_like( store.root.as( $hyoo_crowd_text ).text(), 'foo' )
			
			store.root.as( $hyoo_crowd_text ).text( 'foo bar' )
			$mol_assert_like( store.root.as( $hyoo_crowd_text ).text(), 'foo bar' )
			
			store.root.as( $hyoo_crowd_text ).text( 'foo lol bar' )
			$mol_assert_like( store.root.as( $hyoo_crowd_text ).text(), 'foo lol bar' )
			
			store.root.as( $hyoo_crowd_text ).text( 'lol bar' )
			$mol_assert_like( store.root.as( $hyoo_crowd_text ).text(), 'lol bar' )
			
			store.root.as( $hyoo_crowd_text ).text( 'foo bar' )
			$mol_assert_like( store.root.as( $hyoo_crowd_text ).text(), 'foo bar' )
			
		},
		
		'Merge different sequences'() {
			
			const left = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			left.root.as( $hyoo_crowd_text ).text( 'foo bar.' )
			
			const right = new $hyoo_crowd_doc( -1, -23, { hi: 2, lo: 34 } )
			right.root.as( $hyoo_crowd_text ).text( 'xxx yyy.' )
			
			const left_delta = left.delta()
			const right_delta = right.delta()
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.root.as( $hyoo_crowd_text ).text(),
				right.root.as( $hyoo_crowd_text ).text(),
				'xxx yyy.foo bar.',
			)
			
		},
		
		'Merge different insertions to same place of same sequence'() {
			
			const base = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			base.root.as( $hyoo_crowd_text ).text( 'foo bar' )
			
			const left = base.fork({ hi: 2, lo: 34 } )
			left.root.as( $hyoo_crowd_text ).text( 'foo xxx bar' )
			
			const right = base.fork({ hi: 3, lo: 45 })
			right.root.as( $hyoo_crowd_text ).text( 'foo yyy bar' )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.root.as( $hyoo_crowd_text ).text(),
				right.root.as( $hyoo_crowd_text ).text(),
				'foo yyy xxx bar',
			)
			
		},
		
		'Insert after moved'() {
			
			const base = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			base.root.as( $hyoo_crowd_text ).text( 'FooBarZak' )
			
			const left = base.fork({ hi: 2, lo: 34 } )
			left.root.as( $hyoo_crowd_text ).text( 'FooXxxBarZak' )
			
			const right = base.fork({ hi: 3, lo: 45 })
			right.insert( right.root.chunks()[0], 0, 0, 2 )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.root.as( $hyoo_crowd_text ).text(),
				right.root.as( $hyoo_crowd_text ).text(),
				'XxxBarFooZak',
			)
			
		},
		
		'Insert before moved left'() {
			
			const base = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			base.root.as( $hyoo_crowd_text ).text( 'fooBarZak' )
			
			const left = base.fork({ hi: 2, lo: 34 } )
			left.root.as( $hyoo_crowd_text ).text( 'FooXxxBarZak' )
			
			const right = base.fork({ hi: 3, lo: 45 })
			right.insert( right.root.chunks()[1], 0, 0, 0 )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.root.as( $hyoo_crowd_text ).text(),
				right.root.as( $hyoo_crowd_text ).text(),
				'BarFooXxxZak',
			)
			
		},
		
		'Insert before moved right'() {
			
			const base = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			base.root.as( $hyoo_crowd_text ).text( 'FooBarZak' )
			
			const left = base.fork({ hi: 2, lo: 34 } )
			left.root.as( $hyoo_crowd_text ).text( 'FooXxxBarZak' )
			
			const right = base.fork({ hi: 3, lo: 45 })
			right.insert( right.root.chunks()[1], 0, 0, 3 )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.root.as( $hyoo_crowd_text ).text(),
				right.root.as( $hyoo_crowd_text ).text(),
				'FooXxxZakBar',
			)
			
		},
		
		'Insert after removed'() {
			
			const base = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			base.root.as( $hyoo_crowd_text ).text( 'FooBar' )
			
			const left = base.fork({ hi: 2, lo: 34 } )
			left.root.as( $hyoo_crowd_text ).text( 'FooXxxBar' )
			
			const right = base.fork({ hi: 3, lo: 45 })
			right.root.as( $hyoo_crowd_text ).text( 'Bar' )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.root.as( $hyoo_crowd_text ).text(),
				right.root.as( $hyoo_crowd_text ).text(),
				'XxxBar',
			)
			
		},
		
		'Insert after removed out'() {
			
			const base = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			$hyoo_crowd_text.for( base, 1, 11 ).text( 'FooBarZak' )
			
			const left = base.fork({ hi: 2, lo: 34 } )
			$hyoo_crowd_text.for( left, 1, 11 ).text( 'FooBarXxxZak' )
			
			const right = base.fork({ hi: 3, lo: 45 })
			right.insert( $hyoo_crowd_node.for( right, 1, 11 ).chunks()[1], 2, 22, 0 )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				$hyoo_crowd_text.for( left, 1, 11 ).text(),
				$hyoo_crowd_text.for( right, 1, 11 ).text(),
				'FooXxxZak',
			)
			
			$mol_assert_like(
				$hyoo_crowd_text.for( left, 2, 22 ).text(),
				$hyoo_crowd_text.for( right, 2, 22 ).text(),
				'Bar',
			)
			
		},
		
		'Insert before changed'() {
			
			const base = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			base.root.as( $hyoo_crowd_text ).text( 'XxxYyyZzz' )
			
			const left = base.fork({ hi: 2, lo: 34 } )
			left.root.as( $hyoo_crowd_text ).text( 'XxxFooYyyZzz' )
			
			const right = base.fork({ hi: 3, lo: 45 })
			right.root.as( $hyoo_crowd_text ).text( 'XxxBarZzz' )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.root.as( $hyoo_crowd_text ).text(),
				right.root.as( $hyoo_crowd_text ).text(),
				'XxxBarFooZzz',
			)
			
		},
		
		'Insert between moved'() {
			
			const base = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			base.root.as( $hyoo_crowd_list ).list([ 111, 222, 333, 444, 555, 666 ])
			
			const left = base.fork({ hi: 2, lo: 34 } )
			left.root.as( $hyoo_crowd_list ).list([ 111, 222, 777, 333, 444, 555, 666 ])
			
			const right = base.fork({ hi: 3, lo: 45 })
			right.insert( right.root.chunks()[1], 0, 0, 5 )
			right.insert( right.root.chunks()[1], 0, 0, 5 )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.root.as( $hyoo_crowd_list ).list(),
				right.root.as( $hyoo_crowd_list ).list(),
				[ 111, 444, 555, 222, 333, 777, 666 ],
			)
			
		},
		
		'Merge text changes'() {
			
			const base = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			base.root.as( $hyoo_crowd_text ).text( 'Hello World and fun!' )
			
			const left = base.fork({ hi: 2, lo: 34 } )
			const right = base.fork({ hi: 3, lo: 45 })
			
			left.root.as( $hyoo_crowd_text ).text( 'Hello Alice and fun!' )
			right.root.as( $hyoo_crowd_text ).text( 'Bye World and fun!' )
			
			const left_delta = left.delta()
			const right_delta = right.delta()
			
			left.apply( right_delta )
			right.apply( left_delta )

			$mol_assert_equal(
				left.root.as( $hyoo_crowd_text ).text(),
				right.root.as( $hyoo_crowd_text ).text(),
				'Bye Alice and fun!',
			)

		},
		
		'Write into token'() {
			
			const store = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			store.root.as( $hyoo_crowd_text ).text( 'foobar' )
			store.root.as( $hyoo_crowd_text ).write( 'xyz', 3 )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'fooxyzbar' ] )
			
		},
		
		'Write into token with split'() {
			
			const store = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			store.root.as( $hyoo_crowd_text ).text( 'foobar' )
			store.root.as( $hyoo_crowd_text ).write( 'XYZ', 2, 4 )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'fo', 'XYZar' ] )
			
		},
		
		'Write over few tokens'() {
			
			const store = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			store.root.as( $hyoo_crowd_text ).text( 'xxx foo bar yyy' )
			store.root.as( $hyoo_crowd_text ).write( 'X Y Z', 6, 9 )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'xxx', ' fo', 'X', ' Y', ' Zar', ' yyy' ] )
			
		},
		
		'Write whole token'() {
			
			const store = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			store.root.as( $hyoo_crowd_text ).text( 'xxxFoo yyy' )
			store.root.as( $hyoo_crowd_text ).write( 'bar', 3, 7 )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'xxxbaryyy' ] )
			
		},
		
		'Write whole text'() {
			
			const store = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			store.root.as( $hyoo_crowd_text ).text( 'foo bar' )
			store.root.as( $hyoo_crowd_text ).write( 'xxx', 0, 7 )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'xxx' ] )
			
		},
		
		'Write at the end'() {
			
			const store = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			store.root.as( $hyoo_crowd_text ).text( 'foo' )
			store.root.as( $hyoo_crowd_text ).write( 'bar' )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'foobar' ] )
			
		},
		
		'Write between tokens'() {
			
			const store = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			store.root.as( $hyoo_crowd_text ).text( 'foo bar' )
			store.root.as( $hyoo_crowd_text ).write( 'xxx', 4 )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'foo', ' xxxbar' ] )
			
		},

		'Offset <=> Point'() {
			
			const store = new $hyoo_crowd_doc( -1, -23, { hi: 1, lo: 23 } )
			store.root.as( $hyoo_crowd_text ).text( 'fooBar' )
			const [ first, second ] = store.root.chunks()
			
			$mol_assert_like(
				store.root.as( $hyoo_crowd_text ).point_by_offset( 0 ),
				{ self_hi: first.self_hi, self_lo: first.self_lo, offset: 0 },
			)
			$mol_assert_like(
				store.root.as( $hyoo_crowd_text )
					.offset_by_point({ self_hi: first.self_hi, self_lo: first.self_lo, offset: 0 }),
				0,
			)
			
			$mol_assert_like(
				store.root.as( $hyoo_crowd_text ).point_by_offset( 3 ),
				{ self_hi: second.self_hi, self_lo: second.self_lo, offset: 0 },
			)
			$mol_assert_like(
				store.root.as( $hyoo_crowd_text )
					.offset_by_point({ self_hi: second.self_hi, self_lo: second.self_lo, offset: 0 }),
				3,
			)
			
			$mol_assert_like(
				store.root.as( $hyoo_crowd_text ).point_by_offset( 5 ),
				{ self_hi: second.self_hi, self_lo: second.self_lo, offset: 2 },
			)
			$mol_assert_like(
				store.root.as( $hyoo_crowd_text )
					.offset_by_point({ self_hi: second.self_hi, self_lo: second.self_lo, offset: 2 }),
				5,
			)
			
			$mol_assert_like(
				store.root.as( $hyoo_crowd_text ).point_by_offset( 6 ),
				{ self_hi: store.root.head_hi, self_lo: store.root.head_lo, offset: 6 },
			)
			$mol_assert_like(
				store.root.as( $hyoo_crowd_text )
					.offset_by_point({ self_hi: store.root.head_hi, self_lo: store.root.head_lo, offset: 6 }),
				6,
			)
			
		},

	})
}
