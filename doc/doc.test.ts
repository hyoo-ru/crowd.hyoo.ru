namespace $ {
	
	$mol_test({
		
		async 'Default state'() {
			
			const store = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_reg ).value(), null )
			$mol_assert_like( store.root.as( $hyoo_crowd_reg ).bool(), false )
			$mol_assert_like( store.root.as( $hyoo_crowd_reg ).numb(), 0 )
			$mol_assert_like( store.root.as( $hyoo_crowd_reg ).str(), '' )
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [] )
			$mol_assert_like( store.delta(), [] )
			
		},
		
		async 'Serial changes'() {
			
			const store = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, { ... await $hyoo_crowd_peer.generate(), key_public_serial: null as any } )
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
		
		async 'Name spaces'() {
			
			const store = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			
			store.root.sub( 'foo', $hyoo_crowd_struct ).sub( 'bar', $hyoo_crowd_reg ).numb( 111 )
			store.root.sub( 'foo', $hyoo_crowd_struct ).sub( 'ton', $hyoo_crowd_reg ).numb( 222 )

			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [] )
			$mol_assert_like( store.root.sub( 'foo', $hyoo_crowd_list ).list(), [] )
			$mol_assert_like( store.root.sub( 'foo', $hyoo_crowd_struct ).sub( 'bar', $hyoo_crowd_list ).list(), [ 111 ] )
			$mol_assert_like( store.root.sub( 'foo', $hyoo_crowd_struct ).sub( 'ton', $hyoo_crowd_list ).list(), [ 222 ] )
			
		},
		
		async 'Name spaces merging'() {
			
			const left = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			left.root.sub( 'foo', $hyoo_crowd_list ).list([ 111 ])
			
			const right = new $hyoo_crowd_doc( { lo: 2, hi: 22 }, await $hyoo_crowd_peer.generate() )
			right.clock.tick( right.auth.id )
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
		
		async 'Ignore same changes'() {
			
			const store = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			store.root.as( $hyoo_crowd_reg ).str( 'foo' )
			const [ spin, time ] = [ store.clock.last_spin, store.clock.last_time ]
			
			store.root.as( $hyoo_crowd_reg ).str( 'foo' )
			store.root.as( $hyoo_crowd_list ).list( [ 'foo' ] )
			
			$mol_assert_like(
				store.delta().map( chunk => [ chunk.spin, chunk.time ] ),
				[ [ spin - 1, time ], [ spin, time ] ],
			)
			
		},
		
		async 'Serial insert values'() {
			
			const store = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			
			store.root.as( $hyoo_crowd_list ).insert([ 'foo' ])
			store.root.as( $hyoo_crowd_list ).insert([ 'bar' ])
			
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'foo', 'bar' ] )
			
		},
		
		async 'Concurent insert values'() {
			
			const store = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			
			store.root.as( $hyoo_crowd_list ).insert( [ 'foo' ], 0 )
			store.root.as( $hyoo_crowd_list ).insert( [ 'bar' ], 0 )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'bar', 'foo' ] )
			
		},
		
		async 'Insert value between others'() {
			
			const store = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			
			store.root.as( $hyoo_crowd_list ).insert([ 'foo' ])
			store.root.as( $hyoo_crowd_list ).insert([ 'bar' ])
			store.root.as( $hyoo_crowd_list ).insert( [ 'lol' ], 1 )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'foo', 'lol', 'bar' ] )
			
		},
		
		async 'Insert value inside other'() {
			
			const store = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			
			store.root.as( $hyoo_crowd_list ).insert([ 'foo' ])
			store.root.nodes( $hyoo_crowd_list )[0].insert([ 'bar' ])
			
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'foo' ] )
			$mol_assert_like( store.root.nodes( $hyoo_crowd_list )[0].list(), [ 'bar' ] )
			
		},
		
		async 'Insert before removed before changed'() {
			
			const store = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			const node = store.root.as( $hyoo_crowd_list )
			
			node.list([ 'foo', 'bar' ])
			node.list([ 'xxx', 'foo', 'bar' ])
			node.list([ 'xxx', 'bars' ])
			
			$mol_assert_like( node.list(), [ 'xxx', 'bars' ] )
			
		},
		
		async 'Move existen Chunk'() {
			
			const store = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			
			store.root.as( $hyoo_crowd_text ).text( 'FooBarLol' )
			store.root.as( $hyoo_crowd_list ).move( 0, 2 )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_text ).text(), 'BarFooLol' )
			
		},
		
		async 'Deltas for different versions'() {
			
			const store = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, { ... await $hyoo_crowd_peer.generate(), key_public_serial: null as any } )
			store.clock.see_time( 0, store.clock.now()[0] + 60 )
			
			store.root.as( $hyoo_crowd_list ).list( [ 'foo', 'bar', 'lol' ] )
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ { lo: 2, hi: 22 }, [2, 22] ],
				]) ).map( chunk => chunk.data ),
				[ 'foo', 'bar', 'lol' ],
			)
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ store.auth.id, [ store.clock.last_spin - 3, store.clock.last_time ] ],
				]) ).map( chunk => chunk.data ),
				[ 'foo', 'bar', 'lol' ],
			)
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ store.auth.id, [ store.clock.last_spin - 2, store.clock.last_time ] ],
				]) ).map( chunk => chunk.data ),
				[ 'bar', 'lol' ],
			)
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ store.auth.id, [ store.clock.last_spin - 1, store.clock.last_time ] ],
				]) ).map( chunk => chunk.data ),
				[ 'lol' ],
			)
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ store.auth.id, [ store.clock.last_spin - 0, store.clock.last_time ] ],
				]) ),
				[],
			)
			
		},
		
		async 'Delete with subtree and ignore inserted into deleted'() {
			
			const store = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
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
		
		async 'Put/get list'() {
			
			const store = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [] )
			
			store.root.as( $hyoo_crowd_list ).list( [ 'foo', 'bar', 'foo' ] )
			const first = store.root.nodes( $hyoo_crowd_list )[0]
			first.list( [  'bar', 'foo', 'bar' ] )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'foo', 'bar', 'foo' ] )
			$mol_assert_like( first.list(), [ 'bar', 'foo', 'bar' ] )
			
		},
		
		async 'Put/get text'() {
			
			const store1 = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			
			store1.root.as( $hyoo_crowd_text ).text( 'foo bar foo' )
			$mol_assert_like( store1.root.as( $hyoo_crowd_text ).text(), 'foo bar foo' )
			$mol_assert_like( store1.root.as( $hyoo_crowd_list ).list(), [ 'foo', ' bar', ' foo' ] )
			
			const store2 = store1.fork( await $hyoo_crowd_peer.generate() )
			store2.root.as( $hyoo_crowd_text ).text( 'barFFFoo  bar' )
			$mol_assert_like( store2.root.as( $hyoo_crowd_text ).text(), 'barFFFoo  bar' )
			$mol_assert_like( store2.root.as( $hyoo_crowd_list ).list(), [ 'bar', 'FFFoo', ' ', ' bar' ] )
			
		},
		
		async 'Text modifications'() {
			
			const store1 = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			store1.root.as( $hyoo_crowd_text ).text( 'foo bar' )
			
			const store2 = store1.fork( await $hyoo_crowd_peer.generate() )
			store2.root.as( $hyoo_crowd_text ).text( 'foo  bar' )
			$mol_assert_like(
				store1.root.chunks().map( chunk => chunk.self ),
				[
					store2.root.chunks()[0].self,
					store2.root.chunks()[2].self,
				],
			)
			
			const store3 = store2.fork( await $hyoo_crowd_peer.generate() )
			store3.root.as( $hyoo_crowd_text ).text( 'foo ton bar' )
			$mol_assert_like(
				store2.root.chunks().map( chunk => chunk.self ),
				[
					store3.root.chunks()[0].self,
					store3.root.chunks()[1].self,
					store3.root.chunks()[2].self,
				],
			)
			
			const store4 = store3.fork( await $hyoo_crowd_peer.generate() )
			store4.root.as( $hyoo_crowd_text ).text( 'foo bar' )
			$mol_assert_like(
				[
					store3.root.chunks()[0].self,
					store3.root.chunks()[2].self,
				],
				store4.root.chunks().map( chunk => chunk.self ),
			)
			
			const store5 = store3.fork( await $hyoo_crowd_peer.generate() )
			store5.root.as( $hyoo_crowd_text ).text( 'foo ' )
			$mol_assert_like(
				[
					store4.root.chunks()[0].self,
					store4.root.chunks()[1].self,
				],
				store5.root.chunks().map( chunk => chunk.self ),
			)
			
		},
		
		async 'Change sequences'() {
			
			const store = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
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
		
		async 'Merge different sequences'() {
			
			const left = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			left.root.as( $hyoo_crowd_text ).text( 'foo bar.' )
			
			const right = new $hyoo_crowd_doc( { lo: 2, hi: 22 }, await $hyoo_crowd_peer.generate() )
			right.clock.tick( right.auth.id )
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
		
		async 'Merge different insertions to same place of same sequence'() {
			
			const base = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			base.root.as( $hyoo_crowd_text ).text( 'foo bar' )
			
			const left = base.fork( await $hyoo_crowd_peer.generate() )
			left.root.as( $hyoo_crowd_text ).text( 'foo xxx bar' )
			
			const right = base.fork( await $hyoo_crowd_peer.generate() )
			right.clock.tick( right.auth.id )
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
		
		async 'Insert after moved'() {
			
			const base = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			base.root.as( $hyoo_crowd_text ).text( 'FooBarZak' )
			
			const left = base.fork( await $hyoo_crowd_peer.generate() )
			left.root.as( $hyoo_crowd_text ).text( 'FooXxxBarZak' )
			
			const right = base.fork( await $hyoo_crowd_peer.generate() )
			right.clock.tick( right.auth.id )
			right.insert( right.root.chunks()[0], { lo: 0, hi: 0 }, 2 )
			
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
		
		async 'Insert before moved left'() {
			
			const base = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			base.root.as( $hyoo_crowd_text ).text( 'fooBarZak' )
			
			const left = base.fork( await $hyoo_crowd_peer.generate() )
			left.root.as( $hyoo_crowd_text ).text( 'FooXxxBarZak' )
			
			const right = base.fork( await $hyoo_crowd_peer.generate() )
			right.clock.tick( right.auth.id )
			right.insert( right.root.chunks()[1], { lo: 0, hi: 0 }, 0 )
			
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
		
		async 'Insert before moved right'() {
			
			const base = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			base.root.as( $hyoo_crowd_text ).text( 'FooBarZak' )
			
			const left = base.fork( await $hyoo_crowd_peer.generate() )
			left.root.as( $hyoo_crowd_text ).text( 'FooXxxBarZak' )
			
			const right = base.fork( await $hyoo_crowd_peer.generate() )
			right.clock.tick( right.auth.id )
			right.insert( right.root.chunks()[1], { lo: 0, hi: 0 }, 3 )
			
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
		
		async 'Insert after removed'() {
			
			const base = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			base.root.as( $hyoo_crowd_text ).text( 'FooBar' )
			
			const left = base.fork( await $hyoo_crowd_peer.generate() )
			left.root.as( $hyoo_crowd_text ).text( 'FooXxxBar' )
			
			const right = base.fork( await $hyoo_crowd_peer.generate() )
			right.clock.tick( right.auth.id )
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
		
		async 'Insert after removed out'() {
			
			const base = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			$hyoo_crowd_text.for( base, { lo: 1, hi: 11 } ).text( 'FooBarZak' )
			
			const left = base.fork( await $hyoo_crowd_peer.generate() )
			$hyoo_crowd_text.for( left, { lo: 1, hi: 11 } ).text( 'FooBarXxxZak' )
			
			const right = base.fork( await $hyoo_crowd_peer.generate() )
			right.clock.tick( right.auth.id )
			right.insert( $hyoo_crowd_node.for( right, { lo: 1, hi: 11 } ).chunks()[1], { lo: 2, hi: 22 }, 0 )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				$hyoo_crowd_text.for( left, { lo: 1, hi: 11 } ).text(),
				$hyoo_crowd_text.for( right, { lo: 1, hi: 11 } ).text(),
				'FooXxxZak',
			)
			
			$mol_assert_like(
				$hyoo_crowd_text.for( left, { lo: 2, hi: 22 } ).text(),
				$hyoo_crowd_text.for( right, { lo: 2, hi: 22 } ).text(),
				'Bar',
			)
			
		},
		
		async 'Insert before changed'() {
			
			const base = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			base.root.as( $hyoo_crowd_text ).text( 'XxxYyyZzz' )
			
			const left = base.fork( await $hyoo_crowd_peer.generate() )
			left.root.as( $hyoo_crowd_text ).text( 'XxxFooYyyZzz' )
			
			const right = base.fork( await $hyoo_crowd_peer.generate() )
			right.clock.tick( right.auth.id )
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
		
		async 'Insert between moved'() {
			
			const base = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			base.root.as( $hyoo_crowd_list ).list([ 111, 222, 333, 444, 555, 666 ])
			
			const left = base.fork( await $hyoo_crowd_peer.generate() )
			left.root.as( $hyoo_crowd_list ).list([ 111, 222, 777, 333, 444, 555, 666 ])
			
			const right = base.fork( await $hyoo_crowd_peer.generate() )
			right.clock.tick( right.auth.id )
			right.insert( right.root.chunks()[1], { lo: 0, hi: 0 }, 5 )
			right.insert( right.root.chunks()[1], { lo: 0, hi: 0 }, 5 )
			
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
		
		async 'Merge text changes'() {
			
			const base = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			base.root.as( $hyoo_crowd_text ).text( 'Hello World and fun!' )
			
			const left = base.fork( await $hyoo_crowd_peer.generate() )
			const right = base.fork( await $hyoo_crowd_peer.generate() )
			right.clock.tick( right.auth.id )
			
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
		
		async 'Write into token'() {
			
			const store = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			store.root.as( $hyoo_crowd_text ).text( 'foobar' )
			store.root.as( $hyoo_crowd_text ).write( 'xyz', 3 )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'fooxyzbar' ] )
			
		},
		
		async 'Write into token with split'() {
			
			const store = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			store.root.as( $hyoo_crowd_text ).text( 'foobar' )
			store.root.as( $hyoo_crowd_text ).write( 'XYZ', 2, 4 )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'fo', 'XYZar' ] )
			
		},
		
		async 'Write over few tokens'() {
			
			const store = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			store.root.as( $hyoo_crowd_text ).text( 'xxx foo bar yyy' )
			store.root.as( $hyoo_crowd_text ).write( 'X Y Z', 6, 9 )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'xxx', ' fo', 'X', ' Y', ' Zar', ' yyy' ] )
			
		},
		
		async 'Write whole token'() {
			
			const store = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			store.root.as( $hyoo_crowd_text ).text( 'xxxFoo yyy' )
			store.root.as( $hyoo_crowd_text ).write( 'bar', 3, 7 )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'xxxbaryyy' ] )
			
		},
		
		async 'Write whole text'() {
			
			const store = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			store.root.as( $hyoo_crowd_text ).text( 'foo bar' )
			store.root.as( $hyoo_crowd_text ).write( 'xxx', 0, 7 )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'xxx' ] )
			
		},
		
		async 'Write at the end'() {
			
			const store = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			store.root.as( $hyoo_crowd_text ).text( 'foo' )
			store.root.as( $hyoo_crowd_text ).write( 'bar' )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'foobar' ] )
			
		},
		
		async 'Write between tokens'() {
			
			const store = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			store.root.as( $hyoo_crowd_text ).text( 'foo bar' )
			store.root.as( $hyoo_crowd_text ).write( 'xxx', 4 )
			
			$mol_assert_like( store.root.as( $hyoo_crowd_list ).list(), [ 'foo', ' xxxbar' ] )
			
		},

		async 'Offset <=> Point'() {
			
			const store = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			store.root.as( $hyoo_crowd_text ).text( 'fooBar' )
			const [ first, second ] = store.root.chunks()
			
			$mol_assert_like(
				store.root.as( $hyoo_crowd_text ).point_by_offset( 0 ),
				{ self: first.self(), offset: 0 },
			)
			$mol_assert_like(
				store.root.as( $hyoo_crowd_text )
					.offset_by_point({ self: first.self(), offset: 0 }),
				0,
			)
			
			$mol_assert_like(
				store.root.as( $hyoo_crowd_text ).point_by_offset( 3 ),
				{ self: second.self(), offset: 0 },
			)
			$mol_assert_like(
				store.root.as( $hyoo_crowd_text )
					.offset_by_point({ self: second.self(), offset: 0 }),
				3,
			)
			
			$mol_assert_like(
				store.root.as( $hyoo_crowd_text ).point_by_offset( 5 ),
				{ self: second.self(), offset: 2 },
			)
			$mol_assert_like(
				store.root.as( $hyoo_crowd_text )
					.offset_by_point({ self: second.self(), offset: 2 }),
				5,
			)
			
			$mol_assert_like(
				store.root.as( $hyoo_crowd_text ).point_by_offset( 6 ),
				{ self: store.root.head, offset: 6 },
			)
			$mol_assert_like(
				store.root.as( $hyoo_crowd_text )
					.offset_by_point({ self: store.root.head, offset: 6 }),
				6,
			)
			
		},

	})
}
