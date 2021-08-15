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
			$mol_assert_like( store.list( 0 ), [] )
			
			store.list( 0, [ 'foo', 'bar', 'foo' ] )
			const self1 = store.kids( 0 )[0].self
			store.list( self1, [ 'bar', 'foo', 'bar' ] )
			
			$mol_assert_like( store.list( 0 ), [ 'foo', 'bar', 'foo' ] )
			$mol_assert_like( store.list( self1 ), [ 'bar', 'foo', 'bar' ] )
			
		},
		
		'Change list'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			$mol_assert_like( store.list( 0 ), [] )
			
			store.list( 0, [ 'foo' ] )
			$mol_assert_like( store.list( 0 ), [ 'foo' ] )
			
			store.list( 0, [ 'foo', 'bar' ] )
			$mol_assert_like( store.list( 0 ), [ 'foo', 'bar' ] )
			
			store.list( 0, [ 'foo', 'lol', 'bar' ] )
			$mol_assert_like( store.list( 0 ), [ 'foo', 'lol', 'bar' ] )
			
			store.list( 0, [ 'lol', 'bar' ] )
			$mol_assert_like( store.list( 0 ), [ 'lol', 'bar' ] )
			
			store.list( 0, [ 'foo', 'bar' ] )
			$mol_assert_like( store.list( 0 ), [ 'foo', 'bar' ] )
			
		},
		
		'Merge different lists'() {
			
			const left = new $hyoo_crowd_tree( 123 )
			left.list( 0, [ 'foo', 'bar' ] )
			
			const right = new $hyoo_crowd_tree( 234 )
			right.list( 0, [ 'xxx', 'yyy' ] )
			
			const left_delta = left.delta()
			const right_delta = right.delta()
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.list( 0 ),
				right.list( 0 ),
				[ 'xxx', 'yyy', 'foo', 'bar' ],
			)
			
		},
		
		'Merge different insertions to same place of same list'() {
			
			const base = new $hyoo_crowd_tree( 123 )
			base.list( 0, [ 'foo', 'bar' ] )
			
			const left = base.fork( 234 )
			left.list( 0, [ 'foo', 'xxx', 'bar' ] )
			
			const right = base.fork( 345 )
			right.list( 0, [ 'foo', 'yyy', 'bar' ] )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.list( 0 ),
				right.list( 0 ),
				[ 'foo', 'yyy', 'xxx', 'bar' ],
			)
			
		},
		
		'Insert after moved'() {
			
			const base = new $hyoo_crowd_tree( 123 )
			base.list( 0, [ 'foo', 'bar', 'zak' ] )
			
			const left = base.fork( 234 )
			left.list( 0, [ 'foo', 'xxx', 'bar', 'zak' ] )
			
			const right = base.fork( 345 )
			right.move( right.kids( 0 )[0], right.kids( 0 )[1].self )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.list( 0 ),
				right.list( 0 ),
				[ 'bar', 'foo', 'xxx', 'zak' ],
			)
			
		},
		
		'Insert before moved left'() {
			
			const base = new $hyoo_crowd_tree( 123 )
			base.list( 0, [ 'foo', 'bar', 'zak' ] )
			
			const left = base.fork( 234 )
			left.list( 0, [ 'foo', 'xxx', 'bar', 'zak' ] )
			
			const right = base.fork( 345 )
			right.move( right.kids( 0 )[1], 0 )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.list( 0 ),
				right.list( 0 ),
				[ 'bar', 'foo', 'xxx', 'zak' ],
			)
			
		},
		
		'Insert before moved right'() {
			
			const base = new $hyoo_crowd_tree( 123 )
			base.list( 0, [ 'foo', 'bar', 'zak' ] )
			
			const left = base.fork( 234 )
			left.list( 0, [ 'foo', 'xxx', 'bar', 'zak' ] )
			
			const right = base.fork( 345 )
			right.move( right.kids( 0 )[1], right.kids( 0 )[2].self )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.list( 0 ),
				right.list( 0 ),
				[ 'foo', 'xxx', 'zak', 'bar' ],
			)
			
		},
		
		'Insert after removed'() {
			
			const base = new $hyoo_crowd_tree( 123 )
			base.list( 0, [ 'foo', 'bar' ] )
			
			const left = base.fork( 234 )
			left.list( 0, [ 'foo', 'xxx', 'bar' ] )
			
			const right = base.fork( 345 )
			right.list( 0, [ 'bar' ] )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.list( 0 ),
				right.list( 0 ),
				[ 'xxx', 'bar' ],
			)
			
		},
		
	})
}
