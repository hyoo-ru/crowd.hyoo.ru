namespace $ {
	
	async function make_land( id = '2_b' as $mol_int62_string ) {
		return $hyoo_crowd_land.make({
			id: $mol_const( id ),
			peer: $mol_const( await $hyoo_crowd_peer.generate() ),
		})
	}
	
	$mol_test({
		
		async 'Default state'() {
			
			const store = await make_land()
			
			$mol_assert_like( store.chief.as( $hyoo_crowd_reg ).value(), null )
			$mol_assert_like( store.chief.as( $hyoo_crowd_reg ).bool(), false )
			$mol_assert_like( store.chief.as( $hyoo_crowd_reg ).numb(), 0 )
			$mol_assert_like( store.chief.as( $hyoo_crowd_reg ).str(), '' )
			$mol_assert_like( store.chief.as( $hyoo_crowd_list ).list(), [] )
			$mol_assert_like( store.delta(), [] )
			
		},
		
		async 'Return default state'() {
			
			const store = await make_land()
			const reg = store.chief.as( $hyoo_crowd_reg )
			const list = store.chief.as( $hyoo_crowd_list )
			const text = store.chief.as( $hyoo_crowd_text )
			
			$mol_assert_like( reg.bool( false ), false )
			$mol_assert_like( reg.str( '' ), '' )
			$mol_assert_like( reg.numb( 0 ), 0 )
			$mol_assert_like( text.str( '' ), '' )
			$mol_assert_like( reg.value( null ), null )
			$mol_assert_like( list.list(), [] )
			
		},
		
		async 'Serial changes'() {
			
			const store = await make_land()
			Object.assign( store.peer(), { key_public_serial: null } )
			
			$mol_assert_like( store.chief.as( $hyoo_crowd_reg ).value(), null )
			$mol_assert_like( store.chief.as( $hyoo_crowd_list ).list(), [] )
			
			$mol_assert_like( store.chief.as( $hyoo_crowd_reg ).bool(), false )
			store.chief.as( $hyoo_crowd_reg ).bool( true )
			$mol_assert_like( store.chief.as( $hyoo_crowd_reg ).value(), true )
			$mol_assert_like( store.chief.as( $hyoo_crowd_list ).list(), [ true ] )
			
			$mol_assert_like( store.chief.as( $hyoo_crowd_reg ).numb(), 1 )
			store.chief.as( $hyoo_crowd_reg ).numb( 1 )
			$mol_assert_like( store.chief.as( $hyoo_crowd_reg ).value(), 1 )
			$mol_assert_like( store.chief.as( $hyoo_crowd_list ).list(), [ 1 ] )
			
			$mol_assert_like( store.chief.as( $hyoo_crowd_reg ).str(), '1' )
			store.chief.as( $hyoo_crowd_reg ).str( 'x' )
			$mol_assert_like( store.chief.as( $hyoo_crowd_reg ).value(), 'x' )
			$mol_assert_like( store.chief.as( $hyoo_crowd_list ).list(), [ 'x' ] )
			
			store.chief.as( $hyoo_crowd_reg ).value( null )
			$mol_assert_like( store.chief.as( $hyoo_crowd_reg ).value(), null )
			$mol_assert_like( store.chief.as( $hyoo_crowd_list ).list(), [] )
			
			$mol_assert_like(
				store.delta().map( unit => unit.data ),
				[ null ]
			)
			
		},
		
		async 'Name spaces'() {
			
			const store = await make_land()
			
			store.chief.sub( 'foo', $hyoo_crowd_struct ).sub( 'bar', $hyoo_crowd_reg ).numb( 111 )
			store.chief.sub( 'foo', $hyoo_crowd_struct ).sub( 'ton', $hyoo_crowd_reg ).numb( 222 )

			$mol_assert_like( store.chief.as( $hyoo_crowd_list ).list(), [] )
			$mol_assert_like( store.chief.sub( 'foo', $hyoo_crowd_list ).list(), [] )
			$mol_assert_like( store.chief.sub( 'foo', $hyoo_crowd_struct ).sub( 'bar', $hyoo_crowd_list ).list(), [ 111 ] )
			$mol_assert_like( store.chief.sub( 'foo', $hyoo_crowd_struct ).sub( 'ton', $hyoo_crowd_list ).list(), [ 222 ] )
			
		},
		
		async 'Name spaces merging'() {
			
			const left = await make_land()
			left.chief.sub( 'foo', $hyoo_crowd_list ).list([ 111 ])
			
			const right = await make_land('a_2')
			right.clock_data.tick( right.peer().id )
			right.chief.sub( 'foo', $hyoo_crowd_list ).list([ 222 ])
			
			const left_delta = left.delta()
			const right_delta = right.delta()
			
			left.apply( right_delta )
			right.apply( left_delta )

			$mol_assert_like(
				left.chief.sub( 'foo', $hyoo_crowd_list ).list(),
				right.chief.sub( 'foo', $hyoo_crowd_list ).list(),
				[ 222, 111 ],
			)
			
		},
		
		async 'Ignore same changes'() {
			
			const store = await make_land()
			store.chief.as( $hyoo_crowd_reg ).str( 'foo' )
			const time = store.clock_data.last_time
			
			store.chief.as( $hyoo_crowd_reg ).str( 'foo' )
			store.chief.as( $hyoo_crowd_list ).list( [ 'foo' ] )
			
			$mol_assert_like(
				store.delta().map( unit => unit.time ),
				[ time, time ],
			)
			
		},
		
		async 'Serial insert values'() {
			
			const store = await make_land()
			
			store.chief.as( $hyoo_crowd_list ).insert([ 'foo' ])
			store.chief.as( $hyoo_crowd_list ).insert([ 'bar' ])
			
			$mol_assert_like( store.chief.as( $hyoo_crowd_list ).list(), [ 'foo', 'bar' ] )
			
		},
		
		async 'Concurent insert values'() {
			
			const store = await make_land()
			
			store.chief.as( $hyoo_crowd_list ).insert( [ 'foo' ], 0 )
			store.chief.as( $hyoo_crowd_list ).insert( [ 'bar' ], 0 )
			
			$mol_assert_like( store.chief.as( $hyoo_crowd_list ).list(), [ 'bar', 'foo' ] )
			
		},
		
		async 'Insert value between others'() {
			
			const store = await make_land()
			
			store.chief.as( $hyoo_crowd_list ).insert([ 'foo' ])
			store.chief.as( $hyoo_crowd_list ).insert([ 'bar' ])
			store.chief.as( $hyoo_crowd_list ).insert( [ 'lol' ], 1 )
			
			$mol_assert_like( store.chief.as( $hyoo_crowd_list ).list(), [ 'foo', 'lol', 'bar' ] )
			
		},
		
		async 'Insert value inside other'() {
			
			const store = await make_land()
			
			store.chief.as( $hyoo_crowd_list ).insert([ 'foo' ])
			store.chief.nodes( $hyoo_crowd_list )[0].insert([ 'bar' ])
			
			$mol_assert_like( store.chief.as( $hyoo_crowd_list ).list(), [ 'foo' ] )
			$mol_assert_like( store.chief.nodes( $hyoo_crowd_list )[0].list(), [ 'bar' ] )
			
		},
		
		async 'Insert before removed before changed'() {
			
			const store = await make_land()
			const node = store.chief.as( $hyoo_crowd_list )
			
			node.list([ 'foo', 'bar' ])
			node.list([ 'xxx', 'foo', 'bar' ])
			node.list([ 'xxx', 'bars' ])
			
			$mol_assert_like( node.list(), [ 'xxx', 'bars' ] )
			
		},
		
		async 'Move existen Unit'() {
			
			const store = await make_land()
			
			store.chief.as( $hyoo_crowd_text ).str( 'FooBarLol' )
			store.chief.as( $hyoo_crowd_list ).move( 0, 2 )
			
			$mol_assert_like( store.chief.as( $hyoo_crowd_text ).str(), 'BarFooLol' )
			
		},
		
		async 'Deltas for different versions'() {
			
			const store = await make_land()
			Object.assign( store.peer(), { key_public_serial: null } )
			
			store.clock_data.see_time( store.clock_data.now() + 60 )
			
			store.chief.as( $hyoo_crowd_list ).list( [ 'foo', 'bar', 'lol' ] )
			
			$mol_assert_like(
				store.delta([
					new $hyoo_crowd_clock,
					new $hyoo_crowd_clock([
						[ store.peer().id, store.clock_data.last_time - 3 ],
					])
				]).map( unit => unit.data ),
				[ 'foo', 'bar', 'lol' ],
			)
			
			$mol_assert_like(
				store.delta([
					new $hyoo_crowd_clock,
					new $hyoo_crowd_clock([
						[ store.peer().id, store.clock_data.last_time - 2 ],
					])
				]).map( unit => unit.data ),
				[ 'bar', 'lol' ],
			)
			
			$mol_assert_like(
				store.delta([
					new $hyoo_crowd_clock,
					new $hyoo_crowd_clock([
						[ store.peer().id, store.clock_data.last_time - 1 ],
					])
				]).map( unit => unit.data ),
				[ 'lol' ],
			)
			
			$mol_assert_like(
				store.delta([
					new $hyoo_crowd_clock,
					new $hyoo_crowd_clock([
						[ store.peer().id, store.clock_data.last_time ],
					])
				]),
				[],
			)
			
		},
		
		async 'Delete without subtree and ignore inserted into deleted'() {
			
			const store = await make_land()
			store.chief.as( $hyoo_crowd_text ).str( 'foo' )
			
			const b2 = store.chief.nodes( $hyoo_crowd_text )[0]
			b2.str( 'bar' )
			
			const b3 = b2.nodes( $hyoo_crowd_text )[0]
			b3.str( 'lol' )
			
			$mol_assert_like( store.chief.as( $hyoo_crowd_reg ).value(), 'foo' )
			$mol_assert_like( b2.as( $hyoo_crowd_reg ).value(), 'bar' )
			$mol_assert_like( b3.as( $hyoo_crowd_reg ).value(), 'lol' )
			
			store.chief.as( $hyoo_crowd_list ).cut( 0 )
			
			$mol_assert_like( store.chief.as( $hyoo_crowd_reg ).value(), null )
			$mol_assert_like( b2.as( $hyoo_crowd_reg ).value(), 'bar' )
			$mol_assert_like( b3.as( $hyoo_crowd_reg ).value(), 'lol' )
			
		},
		
		async 'Put/get list'() {
			
			const store = await make_land()
			$mol_assert_like( store.chief.as( $hyoo_crowd_list ).list(), [] )
			
			store.chief.as( $hyoo_crowd_list ).list( [ 'foo', 'bar', 'foo' ] )
			const first = store.chief.nodes( $hyoo_crowd_list )[0]
			first.list( [  'bar', 'foo', 'bar' ] )
			
			$mol_assert_like( store.chief.as( $hyoo_crowd_list ).list(), [ 'foo', 'bar', 'foo' ] )
			$mol_assert_like( first.list(), [ 'bar', 'foo', 'bar' ] )
			
		},
		
		async 'Put/get text'() {
			
			const store1 = await make_land()
			
			store1.chief.as( $hyoo_crowd_text ).str( 'foo bar foo' )
			$mol_assert_like( store1.chief.as( $hyoo_crowd_text ).str(), 'foo bar foo' )
			$mol_assert_like( store1.chief.as( $hyoo_crowd_list ).list(), [ 'foo', ' bar', ' foo' ] )
			
			const store2 = store1.fork( await $hyoo_crowd_peer.generate() )
			store2.chief.as( $hyoo_crowd_text ).str( 'barFFFoo  bar' )
			$mol_assert_like( store2.chief.as( $hyoo_crowd_text ).str(), 'barFFFoo  bar' )
			$mol_assert_like( store2.chief.as( $hyoo_crowd_list ).list(), [ 'bar', 'FFFoo', ' ', ' bar' ] )
			
		},
		
		async 'Text modifications'() {
			
			const store1 = await make_land()
			store1.chief.as( $hyoo_crowd_text ).str( 'foo bar' )
			
			const store2 = store1.fork( await $hyoo_crowd_peer.generate() )
			store2.chief.as( $hyoo_crowd_text ).str( 'foo  bar' )
			$mol_assert_like(
				store1.chief.units().map( unit => unit.self ),
				[
					store2.chief.units()[0].self,
					store2.chief.units()[2].self,
				],
			)
			
			const store3 = store2.fork( await $hyoo_crowd_peer.generate() )
			store3.chief.as( $hyoo_crowd_text ).str( 'foo ton bar' )
			$mol_assert_like(
				store2.chief.units().map( unit => unit.self ),
				[
					store3.chief.units()[0].self,
					store3.chief.units()[1].self,
					store3.chief.units()[2].self,
				],
			)
			
			const store4 = store3.fork( await $hyoo_crowd_peer.generate() )
			store4.chief.as( $hyoo_crowd_text ).str( 'foo bar' )
			$mol_assert_like(
				[
					store3.chief.units()[0].self,
					store3.chief.units()[2].self,
				],
				store4.chief.units().map( unit => unit.self ),
			)
			
			const store5 = store3.fork( await $hyoo_crowd_peer.generate() )
			store5.chief.as( $hyoo_crowd_text ).str( 'foo ' )
			$mol_assert_like(
				[
					store4.chief.units()[0].self,
					store4.chief.units()[1].self,
				],
				store5.chief.units().map( unit => unit.self ),
			)
			
		},
		
		async 'Change sequences'() {
			
			const store = await make_land()
			$mol_assert_like( store.chief.as( $hyoo_crowd_text ).str(), '' )
			
			store.chief.as( $hyoo_crowd_text ).str( 'foo' )
			$mol_assert_like( store.chief.as( $hyoo_crowd_text ).str(), 'foo' )
			
			store.chief.as( $hyoo_crowd_text ).str( 'foo bar' )
			$mol_assert_like( store.chief.as( $hyoo_crowd_text ).str(), 'foo bar' )
			
			store.chief.as( $hyoo_crowd_text ).str( 'foo lol bar' )
			$mol_assert_like( store.chief.as( $hyoo_crowd_text ).str(), 'foo lol bar' )
			
			store.chief.as( $hyoo_crowd_text ).str( 'lol bar' )
			$mol_assert_like( store.chief.as( $hyoo_crowd_text ).str(), 'lol bar' )
			
			store.chief.as( $hyoo_crowd_text ).str( 'foo bar' )
			$mol_assert_like( store.chief.as( $hyoo_crowd_text ).str(), 'foo bar' )
			
		},
		
		async 'Merge different sequences'() {
			
			const left = await make_land()
			left.chief.as( $hyoo_crowd_text ).str( 'foo bar.' )
			
			const right = await make_land('a_2')
			right.clock_data.tick( right.peer().id )
			right.chief.as( $hyoo_crowd_text ).str( 'xxx yyy.' )
			
			const left_delta = left.delta()
			const right_delta = right.delta()
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.chief.as( $hyoo_crowd_text ).str(),
				right.chief.as( $hyoo_crowd_text ).str(),
				'xxx yyy.foo bar.',
			)
			
		},
		
		async 'Merge different insertions to same place of same sequence'() {
			
			const base = await make_land()
			base.chief.as( $hyoo_crowd_text ).str( 'foo bar' )
			
			const left = base.fork( await $hyoo_crowd_peer.generate() )
			left.chief.as( $hyoo_crowd_text ).str( 'foo xxx bar' )
			
			const right = base.fork( await $hyoo_crowd_peer.generate() )
			right.clock_data.tick( right.peer().id )
			right.chief.as( $hyoo_crowd_text ).str( 'foo yyy bar' )
			
			const left_delta = left.delta( base.clocks )
			const right_delta = right.delta( base.clocks )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.chief.as( $hyoo_crowd_text ).str(),
				right.chief.as( $hyoo_crowd_text ).str(),
				'foo yyy xxx bar',
			)
			
		},
		
		async 'Insert after moved'() {
			
			const base = await make_land()
			base.chief.as( $hyoo_crowd_text ).str( 'FooBarZak' )
			
			const left = base.fork( await $hyoo_crowd_peer.generate() )
			left.chief.as( $hyoo_crowd_text ).str( 'FooXxxBarZak' )
			
			const right = base.fork( await $hyoo_crowd_peer.generate() )
			right.clock_data.tick( right.peer().id )
			right.insert( right.chief.units()[0], '0_0', 2 )
			
			const left_delta = left.delta( base.clocks )
			const right_delta = right.delta( base.clocks )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.chief.as( $hyoo_crowd_text ).str(),
				right.chief.as( $hyoo_crowd_text ).str(),
				'XxxBarFooZak',
			)
			
		},
		
		async 'Insert before moved left'() {
			
			const base = await make_land()
			base.chief.as( $hyoo_crowd_text ).str( 'fooBarZak' )
			
			const left = base.fork( await $hyoo_crowd_peer.generate() )
			left.chief.as( $hyoo_crowd_text ).str( 'FooXxxBarZak' )
			
			const right = base.fork( await $hyoo_crowd_peer.generate() )
			right.clock_data.tick( right.peer().id )
			right.insert( right.chief.units()[1], '0_0', 0 )
			
			const left_delta = left.delta( base.clocks )
			const right_delta = right.delta( base.clocks )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.chief.as( $hyoo_crowd_text ).str(),
				right.chief.as( $hyoo_crowd_text ).str(),
				'BarFooXxxZak',
			)
			
		},
		
		async 'Insert before moved right'() {
			
			const base = await make_land()
			base.chief.as( $hyoo_crowd_text ).str( 'FooBarZak' )
			
			const left = base.fork( await $hyoo_crowd_peer.generate() )
			left.chief.as( $hyoo_crowd_text ).str( 'FooXxxBarZak' )
			
			const right = base.fork( await $hyoo_crowd_peer.generate() )
			right.clock_data.tick( right.peer().id )
			right.insert( right.chief.units()[1], '0_0', 3 )
			
			const left_delta = left.delta( base.clocks )
			const right_delta = right.delta( base.clocks )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.chief.as( $hyoo_crowd_text ).str(),
				right.chief.as( $hyoo_crowd_text ).str(),
				'FooXxxZakBar',
			)
			
		},
		
		async 'Insert after removed'() {
			
			const base = await make_land()
			base.chief.as( $hyoo_crowd_text ).str( 'FooBar' )
			
			const left = base.fork( await $hyoo_crowd_peer.generate() )
			left.chief.as( $hyoo_crowd_text ).str( 'FooXxxBar' )
			
			const right = base.fork( await $hyoo_crowd_peer.generate() )
			right.clock_data.tick( right.peer().id )
			right.chief.as( $hyoo_crowd_text ).str( 'Bar' )
			
			const left_delta = left.delta( base.clocks )
			const right_delta = right.delta( base.clocks )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.chief.as( $hyoo_crowd_text ).str(),
				right.chief.as( $hyoo_crowd_text ).str(),
				'XxxBar',
			)
			
		},
		
		async 'Insert after removed out'() {
			
			const base = await make_land()
			$hyoo_crowd_text.for( base, '1_1' ).str( 'FooBarZak' )
			
			const left = base.fork( await $hyoo_crowd_peer.generate() )
			$hyoo_crowd_text.for( left, '1_1' ).str( 'FooBarXxxZak' )
			
			const right = base.fork( await $hyoo_crowd_peer.generate() )
			right.clock_data.tick( right.peer().id )
			right.insert( $hyoo_crowd_node.for( right, '1_1' ).units()[1], '2_2', 0 )
			
			const left_delta = left.delta( base.clocks )
			const right_delta = right.delta( base.clocks )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				$hyoo_crowd_text.for( left, '1_1' ).str(),
				$hyoo_crowd_text.for( right, '1_1' ).str(),
				'FooXxxZak',
			)
			
			$mol_assert_like(
				$hyoo_crowd_text.for( left, '2_2' ).str(),
				$hyoo_crowd_text.for( right, '2_2' ).str(),
				'Bar',
			)
			
		},
		
		async 'Insert before changed'() {
			
			const base = await make_land()
			base.chief.as( $hyoo_crowd_text ).str( 'XxxYyyZzz' )
			
			const left = base.fork( await $hyoo_crowd_peer.generate() )
			left.chief.as( $hyoo_crowd_text ).str( 'XxxFooYyyZzz' )
			
			const right = base.fork( await $hyoo_crowd_peer.generate() )
			right.clock_data.tick( right.peer().id )
			right.chief.as( $hyoo_crowd_text ).str( 'XxxBarZzz' )
			
			const left_delta = left.delta( base.clocks )
			const right_delta = right.delta( base.clocks )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.chief.as( $hyoo_crowd_text ).str(),
				right.chief.as( $hyoo_crowd_text ).str(),
				'XxxBarFooZzz',
			)
			
		},
		
		async 'Insert between moved'() {
			
			const base = await make_land()
			base.chief.as( $hyoo_crowd_list ).list([ 111, 222, 333, 444, 555, 666 ])
			
			const left = base.fork( await $hyoo_crowd_peer.generate() )
			left.chief.as( $hyoo_crowd_list ).list([ 111, 222, 777, 333, 444, 555, 666 ])
			
			const right = base.fork( await $hyoo_crowd_peer.generate() )
			right.clock_data.tick( right.peer().id )
			right.insert( right.chief.units()[1], '0_0', 5 )
			right.insert( right.chief.units()[1], '0_0', 5 )
			
			const left_delta = left.delta( base.clocks )
			const right_delta = right.delta( base.clocks )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.chief.as( $hyoo_crowd_list ).list(),
				right.chief.as( $hyoo_crowd_list ).list(),
				[ 111, 444, 555, 222, 333, 777, 666 ],
			)
			
		},
		
		async 'Merge text changes'() {
			
			const base = await make_land()
			base.chief.as( $hyoo_crowd_text ).str( 'Hello World and fun!' )
			
			const left = base.fork( await $hyoo_crowd_peer.generate() )
			const right = base.fork( await $hyoo_crowd_peer.generate() )
			right.clock_data.tick( right.peer().id )
			
			left.chief.as( $hyoo_crowd_text ).str( 'Hello Alice and fun!' )
			right.chief.as( $hyoo_crowd_text ).str( 'Bye World and fun!' )
			
			const left_delta = left.delta()
			const right_delta = right.delta()
			
			left.apply( right_delta )
			right.apply( left_delta )

			$mol_assert_equal(
				left.chief.as( $hyoo_crowd_text ).str(),
				right.chief.as( $hyoo_crowd_text ).str(),
				'Bye Alice and fun!',
			)

		},
		
		async 'Write into token'() {
			
			const store = await make_land()
			store.chief.as( $hyoo_crowd_text ).str( 'foobar' )
			store.chief.as( $hyoo_crowd_text ).write( 'xyz', 3 )
			
			$mol_assert_like( store.chief.as( $hyoo_crowd_list ).list(), [ 'fooxyzbar' ] )
			
		},
		
		async 'Write into token with split'() {
			
			const store = await make_land()
			store.chief.as( $hyoo_crowd_text ).str( 'foobar' )
			store.chief.as( $hyoo_crowd_text ).write( 'XYZ', 2, 4 )
			
			$mol_assert_like( store.chief.as( $hyoo_crowd_list ).list(), [ 'fo', 'XYZar' ] )
			
		},
		
		async 'Write over few tokens'() {
			
			const store = await make_land()
			store.chief.as( $hyoo_crowd_text ).str( 'xxx foo bar yyy' )
			store.chief.as( $hyoo_crowd_text ).write( 'X Y Z', 6, 9 )
			
			$mol_assert_like( store.chief.as( $hyoo_crowd_list ).list(), [ 'xxx', ' fo', 'X', ' Y', ' Zar', ' yyy' ] )
			
		},
		
		async 'Write whole token'() {
			
			const store = await make_land()
			store.chief.as( $hyoo_crowd_text ).str( 'xxxFoo yyy' )
			store.chief.as( $hyoo_crowd_text ).write( 'bar', 3, 7 )
			
			$mol_assert_like( store.chief.as( $hyoo_crowd_list ).list(), [ 'xxxbaryyy' ] )
			
		},
		
		async 'Write whole text'() {
			
			const store = await make_land()
			store.chief.as( $hyoo_crowd_text ).str( 'foo bar' )
			store.chief.as( $hyoo_crowd_text ).write( 'xxx', 0, 7 )
			
			$mol_assert_like( store.chief.as( $hyoo_crowd_list ).list(), [ 'xxx' ] )
			
		},
		
		async 'Write at the end'() {
			
			const store = await make_land()
			store.chief.as( $hyoo_crowd_text ).str( 'foo' )
			store.chief.as( $hyoo_crowd_text ).write( 'bar' )
			
			$mol_assert_like( store.chief.as( $hyoo_crowd_list ).list(), [ 'foobar' ] )
			
		},
		
		async 'Write between tokens'() {
			
			const store = await make_land()
			store.chief.as( $hyoo_crowd_text ).str( 'foo bar' )
			store.chief.as( $hyoo_crowd_text ).write( 'xxx', 4 )
			
			$mol_assert_like( store.chief.as( $hyoo_crowd_list ).list(), [ 'foo', ' xxxbar' ] )
			
		},

	})
}
