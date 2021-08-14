namespace $ {
	$mol_test({
		
		'Put values cuncurrent to the root'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.put( '/111', '', 'foo' )
			store.put( '/222', '', 'bar' )
			
			$mol_assert_like(
				store.kids('').map( node => ({ ... node }) ),
				[
					{
						guid: '/222',
						leader: '',
						offset: 0,
						peer: 123,
						version: 2,
						data: 'bar',
					},
					{
						guid: '/111',
						leader: '',
						offset: 0,
						peer: 123,
						version: 1,
						data: 'foo',
					},
				],
			)
			
		},
		
		'Put values serial to the root'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.put( '/111', '', 'foo' )
			store.put( '/222', '111', 'bar' )
			
			$mol_assert_like(
				store.kids( '' ).map( node => ({ ... node }) ),
				[
					{
						guid: '/111',
						leader: '',
						offset: 0,
						peer: 123,
						version: 1,
						data: 'foo',
					},
					{
						guid: '/222',
						leader: '111',
						offset: 1,
						peer: 123,
						version: 2,
						data: 'bar',
					},
				],
			)
			
		},
		
		'Put value between others'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.put( '/111', '', 'foo' )
			store.put( '/222', '111', 'bar' )
			store.put( '/333', '111', 'lol' )
			
			$mol_assert_like(
				store.kids( '' ).map( node => node.guid ),
				[ '/111', '/333', '/222' ],
			)
			
		},
		
		'Put value inside other'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.put( '/111', '', 'foo' )
			store.put( '/111/222', '', 'bar' )
			
			$mol_assert_like(
				store.kids( '' ).map( node => node.guid ),
				[ '/111' ],
			)
			
			$mol_assert_like(
				store.kids( '/111' ).map( node => node.guid ),
				[ '/111/222' ],
			)
			
		},
		
		'Move existen node'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.put( '/111', '', 'foo' )
			store.put( '/222', '111', 'bar' )
			store.put( '/111', '222', 'lol' )
			
			$mol_assert_like(
				store.kids( '' ).map( node => node.guid ),
				[ '/222', '/111' ],
			)
			
		},
		
		'Deltas for different versions'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.put( '/111', '', 'foo' )
			store.put( '/111/222', '', 'bar' )
			store.put( '/111/333', '', 'lol' )
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ 321, 2 ],
				]) ).map( node => node.guid ),
				[ '/111', '/111/222', '/111/333' ],
			)
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ 123, 0 ],
				]) ).map( node => node.guid ),
				[ '/111', '/111/222', '/111/333' ],
			)
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ 123, 1 ],
				]) ).map( node => node.guid ),
				[ '/111/222', '/111/333' ],
			)
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ 123, 2 ],
				]) ).map( node => node.guid ),
				[ '/111/333' ],
			)
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ 123, 3 ],
				]) ),
				[],
			)
			
		},
		
		'Delete with subtree and ignore inserted to deleted'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			const node1 = store.put( '/111', '', 'foo' )
			const node2 = store.put( '/111/222', '', 'bar' )
			let node3 = store.put( '/111/222/333', '', 'lol' )
			
			$mol_assert_like( store.kids( '' ), [ node1 ] )
			$mol_assert_like( store.kids( node1.guid ), [ node2 ] )
			$mol_assert_like( store.kids( node2.guid ), [ node3 ] )
			
			store.wipe( node1 )
			
			$mol_assert_like( store.kids( '' ), [] )
			$mol_assert_like( store.kids( node1.guid ), [] )
			$mol_assert_like( store.kids( node2.guid ), [] )
			
			node3 = store.put( node3.guid, node3.leader, node3.data )
			
			$mol_assert_like( store.kids( '' ), [] )
			$mol_assert_like( store.kids( node1.guid ), [] )
			$mol_assert_like( store.kids( node2.guid ), [ node3 ] )
			
		},
		
		'Put/get list'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			$mol_assert_like( store.list( '' ), [] )
			
			store.list( '', [ 'foo', 'bar', 'foo' ] )
			const guid1 = store.kids( '' )[0].guid
			store.list( guid1, [ 'bar', 'foo', 'bar' ] )
			
			$mol_assert_like( store.list( '' ), [ 'foo', 'bar', 'foo' ] )
			$mol_assert_like( store.list( guid1 ), [ 'bar', 'foo', 'bar' ] )
			
		},
		
		'Change list'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			$mol_assert_like( store.list( '' ), [] )
			
			store.list( '', [ 'foo' ] )
			$mol_assert_like( store.list( '' ), [ 'foo' ] )
			
			store.list( '', [ 'foo', 'bar' ] )
			$mol_assert_like( store.list( '' ), [ 'foo', 'bar' ] )
			
			store.list( '', [ 'foo', 'lol', 'bar' ] )
			$mol_assert_like( store.list( '' ), [ 'foo', 'lol', 'bar' ] )
			
			store.list( '', [ 'lol', 'bar' ] )
			$mol_assert_like( store.list( '' ), [ 'lol', 'bar' ] )
			
			store.list( '', [ 'foo', 'bar' ] )
			$mol_assert_like( store.list( '' ), [ 'foo', 'bar' ] )
			
		},
		
		'Merge different lists'() {
			
			const left = new $hyoo_crowd_tree( 123 )
			left.list( '', [ 'foo', 'bar' ] )
			
			const right = new $hyoo_crowd_tree( 234 )
			right.list( '', [ 'xxx', 'yyy' ] )
			
			const left_delta = left.delta()
			const right_delta = right.delta()
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.list( '' ),
				right.list( '' ),
				[ 'xxx', 'yyy', 'foo', 'bar' ],
			)
			
		},
		
		'Merge different insertions to same place of same list'() {
			
			const base = new $hyoo_crowd_tree( 123 )
			base.list( '', [ 'foo', 'bar' ] )
			
			const left = base.fork( 234 )
			left.list( '', [ 'foo', 'xxx', 'bar' ] )
			
			const right = base.fork( 345 )
			right.list( '', [ 'foo', 'yyy', 'bar' ] )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.list( '' ),
				right.list( '' ),
				[ 'foo', 'yyy', 'xxx', 'bar' ],
			)
			
		},
		
		'Insert after moved'() {
			
			const base = new $hyoo_crowd_tree( 123 )
			base.list( '', [ 'foo', 'bar', 'zak' ] )
			
			const left = base.fork( 234 )
			left.list( '', [ 'foo', 'xxx', 'bar', 'zak' ] )
			
			const right = base.fork( 345 )
			right.move( right.kids( '' )[0], right.kids( '' )[1].luid )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.list( '' ),
				right.list( '' ),
				[ 'bar', 'foo', 'xxx', 'zak' ],
			)
			
		},
		
		'Insert after moved 2'() {
			
			const base = new $hyoo_crowd_tree( 123 )
			base.list( '', [ 'foo', 'bar', 'zak' ] )
			
			const left = base.fork( 345 )
			left.list( '', [ 'foo', 'xxx', 'bar', 'zak' ] )
			
			const right = base.fork( 234 )
			right.move( right.kids( '' )[0], right.kids( '' )[1].luid )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.list( '' ),
				right.list( '' ),
				[ 'bar', 'foo', 'xxx', 'zak' ],
			)
			
		},
		
		'Insert before moved'() {
			
			const base = new $hyoo_crowd_tree( 123 )
			base.list( '', [ 'foo', 'bar', 'zak' ] )
			
			const left = base.fork( 234 )
			left.list( '', [ 'foo', 'xxx', 'bar', 'zak' ] )
			
			const right = base.fork( 345 )
			right.move( right.kids( '' )[1], '' )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.list( '' ),
				right.list( '' ),
				[ 'bar', 'foo', 'xxx', 'zak' ],
			)
			
		},
		
		'Insert after removed'() {
			
			const base = new $hyoo_crowd_tree( 123 )
			base.list( '', [ 'foo', 'bar' ] )
			
			const left = base.fork( 234 )
			left.list( '', [ 'foo', 'xxx', 'bar' ] )
			
			const right = base.fork( 345 )
			right.list( '', [ 'bar' ] )
			
			const left_delta = left.delta( base.clock )
			const right_delta = right.delta( base.clock )
			
			left.apply( right_delta )
			right.apply( left_delta )
	
			$mol_assert_like(
				left.list( '' ),
				right.list( '' ),
				[ 'xxx', 'bar' ],
			)
			
		},
		
	})
}
