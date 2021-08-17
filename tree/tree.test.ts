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
			
			store.root.bool( true )
			$mol_assert_like( store.root.value(), true )
			$mol_assert_like( store.root.list(), [ true ] )
			
			store.root.numb( 1 )
			$mol_assert_like( store.root.value(), 1 )
			$mol_assert_like( store.root.list(), [ 1 ] )
			
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
			
			store.root.numb( 111 )
			store.root.sub( 111 ).sub( 'aaa' ).numb( 222 )
			store.root.sub( 111 ).sub( 'bbb' ).numb( 333 )

			$mol_assert_like( store.root.value(), 111 )
			$mol_assert_like( store.root.sub( 111 ).value(), 'bbb' )
			$mol_assert_like( store.root.sub( 111 ).sub( 'aaa' ).value(), 222 )
			
			$mol_assert_like( store.root.list(), [ 111 ] )
			$mol_assert_like( store.root.sub( 111 ).list(), [ 'bbb', 'aaa' ] )
			$mol_assert_like( store.root.sub( 111 ).sub( 'bbb' ).list(), [ 333 ] )
			
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
			
			store.root.insert( 'foo' )
			store.root.insert( 'bar' )
			
			$mol_assert_like( store.root.list(), [ 'foo', 'bar' ] )
			
		},
		
		'Concurent insert values'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.root.insert( 'foo', 0 )
			store.root.insert( 'bar', 0 )
			
			$mol_assert_like( store.root.list(), [ 'bar', 'foo' ] )
			
		},
		
		'Insert value between others'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.root.insert( 'foo' )
			store.root.insert( 'bar' )
			store.root.insert( 'lol', 1 )
			
			$mol_assert_like( store.root.list(), [ 'foo', 'lol', 'bar' ] )
			
		},
		
		'Insert value inside other'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			const id = store.root.insert( 'foo' ).self
			store.branch( id ).insert( 'bar' )
			
			$mol_assert_like( store.root.list(), [ 'foo' ] )
			$mol_assert_like( store.branch( id ).list(), [ 'bar' ] )
			
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
			
			const chunk1 = store.root.insert( 'foo' )
			const chunk2 = store.branch( chunk1.self ).insert( 'bar' )
			let chunk3 = store.branch( chunk2.self ).insert( 'lol' )
			
			$mol_assert_like( store.root.text(), 'foo' )
			$mol_assert_like( store.branch( chunk1.self ).text(), 'bar' )
			$mol_assert_like( store.branch( chunk2.self ).text(), 'lol' )
			
			store.root.cut( 0 )
			
			$mol_assert_like( store.root.text(), '' )
			$mol_assert_like( store.branch( chunk1.self ).text(), '' )
			$mol_assert_like( store.branch( chunk2.self ).text(), '' )
			
			chunk3 = store.move( chunk3, chunk3.head, chunk3.lead )
			
			$mol_assert_like( store.root.text(), '' )
			$mol_assert_like( store.branch( chunk1.self ).text(), '' )
			$mol_assert_like( store.branch( chunk2.self ).text(), 'lol' )
			
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
			
			const store = new $hyoo_crowd_tree( 123 )
			$mol_assert_like( store.root.text(), '' )
			
			store.root.text( 'foo bar foo' )
			const first = store.root.branches()[0]
			first.text( 'bar foo bar' )
			
			$mol_assert_like( store.root.text(), 'foo bar foo' )
			$mol_assert_like( first.text(), 'bar foo bar' )
			
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
		
	})
}
