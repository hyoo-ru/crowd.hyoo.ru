namespace $ {
	$mol_test({
		
		'Put values cuncurrent to the root'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.put( 0, 111, 0, '', 'foo' )
			store.put( 0, 222, 0, '', 'bar' )
			
			$mol_assert_like(
				store.kids(0).map( node => ({ ... node }) ),
				[
					{
						head: 0,
						self: 222,
						lead: 0,
						offset: 0,
						peer: 123,
						version: 2,
						name: '',
						data: 'bar',
					},
					{
						head: 0,
						self: 111,
						lead: 0,
						offset: 0,
						peer: 123,
						version: 1,
						name: '',
						data: 'foo',
					},
				],
			)
			
		},
		
		'Put values serial to the root'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.put( 0, 111, 0, '', 'foo' )
			store.put( 0, 222, 111, '', 'bar' )
			
			$mol_assert_like(
				store.kids( 0 ).map( node => ({ ... node }) ),
				[
					{
						head: 0,
						self: 111,
						lead: 0,
						offset: 0,
						peer: 123,
						version: 1,
						name: '',
						data: 'foo',
					},
					{
						head: 0,
						self: 222,
						lead: 111,
						offset: 1,
						peer: 123,
						version: 2,
						name: '',
						data: 'bar',
					},
				],
			)
			
		},
		
		'Put value between others'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.put( 0, 111, 0, '', 'foo' )
			store.put( 0, 222, 111, '', 'bar' )
			store.put( 0, 333, 111, '', 'lol' )
			
			$mol_assert_like(
				store.kids( 0 ).map( node => node.self ),
				[ 111, 333, 222 ],
			)
			
		},
		
		'Put value inside other'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.put( 0, 111, 0, '', 'foo' )
			store.put( 111, 222, 0, '', 'bar' )
			
			$mol_assert_like(
				store.kids( 0 ).map( node => node.self ),
				[ 111 ],
			)
			
			$mol_assert_like(
				store.kids( 111 ).map( node => node.self ),
				[ 222 ],
			)
			
		},
		
		'Move existen node'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.put( 0, 111, 0, '', 'foo' )
			store.put( 0, 222, 111, '', 'bar' )
			store.put( 0, 111, 222, '', 'lol' )
			
			$mol_assert_like(
				store.kids( 0 ).map( node => node.self ),
				[ 222, 111 ],
			)
			
		},
		
		'Deltas for different versions'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.put( 0, 111, 0, '', 'foo' )
			store.put( 111, 222, 0, '', 'bar' )
			store.put( 111, 333, 0, '', 'lol' )
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ 321, 2 ],
				]) ).map( node => node.self ),
				[ 111, 222, 333 ],
			)
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ 123, 0 ],
				]) ).map( node => node.self ),
				[ 111, 222, 333 ],
			)
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ 123, 1 ],
				]) ).map( node => node.self ),
				[ 222, 333 ],
			)
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ 123, 2 ],
				]) ).map( node => node.self ),
				[ 333 ],
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
			
			const node1 = store.put( 0, 111, 0, '', 'foo' )
			const node2 = store.put( 111, 222, 0, '', 'bar' )
			let node3 = store.put( 222, 333, 0, '', 'lol' )
			
			$mol_assert_like( store.kids( 0 ), [ node1 ] )
			$mol_assert_like( store.kids( node1.self ), [ node2 ] )
			$mol_assert_like( store.kids( node2.self ), [ node3 ] )
			
			store.wipe( node1 )
			
			$mol_assert_like( store.kids( 0 ), [] )
			$mol_assert_like( store.kids( node1.self ), [] )
			$mol_assert_like( store.kids( node2.self ), [] )
			
			node3 = store.put( node3.head, node3.self, node3.lead, node3.name, node3.data )
			
			$mol_assert_like( store.kids( 0 ), [] )
			$mol_assert_like( store.kids( node1.self ), [] )
			$mol_assert_like( store.kids( node2.self ), [ node3 ] )
			
		},
		
		'Put/get list'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			$mol_assert_like( store.root.list(), [] )
			
			store.root.list([ 'foo', 'bar', 'foo' ])
			const first = store.root.nodes()[0]
			first.list([ 'bar', 'foo', 'bar' ])
			
			$mol_assert_like( store.root.list(), [ 'foo', 'bar', 'foo' ] )
			$mol_assert_like( first.list(), [ 'bar', 'foo', 'bar' ] )
			
		},
		
		'Put/get text'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			$mol_assert_like( store.root.text(), '' )
			
			store.root.text( 'foo bar foo' )
			const first = store.root.nodes()[0]
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
			right.insert( right.kids( 0 )[0], 0, 2 )
			
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
			right.insert( right.kids( 0 )[1], 0, 0 )
			
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
			right.insert( right.kids( 0 )[1], 0, 3 )
			
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
			base.node( 111 ).text( 'foo bar|zak' )
			
			const left = base.fork( 234 )
			left.node( 111 ).text( 'foo bar|xxx zak' )
			
			const right = base.fork( 345 )
			right.insert( right.node( 111 ).chunks()[1], 222, 0 )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.node( 111 ).text(),
				right.node( 111 ).text(),
				'foo xxx zak',
			)
			
			$mol_assert_like(
				left.node( 222 ).text(),
				right.node( 222 ).text(),
				'bar|',
			)
			
		},
		
	})
}
