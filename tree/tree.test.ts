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
						peer: 123,
						version: 2,
						data: 'bar',
						sign: null,
					},
					{
						guid: '/111',
						leader: '',
						peer: 123,
						version: 1,
						data: 'foo',
						sign: null,
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
						peer: 123,
						version: 1,
						data: 'foo',
						sign: null,
					},
					{
						guid: '/222',
						leader: '111',
						peer: 123,
						version: 2,
						data: 'bar',
						sign: null,
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
				store.kids( '' ).map( node => ({ ... node }) ),
				[
					{
						guid: '/111',
						leader: '',
						peer: 123,
						version: 1,
						data: 'foo',
						sign: null,
					},
					{
						guid: '/333',
						leader: '111',
						peer: 123,
						version: 3,
						data: 'lol',
						sign: null,
					},
					{
						guid: '/222',
						leader: '111',
						peer: 123,
						version: 2,
						data: 'bar',
						sign: null,
					},
				],
			)
			
		},
		
		'Put value inside other'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.put( '/111', '', 'foo' )
			store.put( '/111/222', '', 'bar' )
			
			$mol_assert_like(
				store.kids( '' ).map( node => ({ ... node }) ),
				[
					{
						guid: '/111',
						leader: '',
						peer: 123,
						version: 1,
						data: 'foo',
						sign: null,
					},
				],
			)
			
			$mol_assert_like(
				store.kids( '/111' ).map( node => ({ ... node }) ),
				[
					{
						guid: '/111/222',
						leader: '',
						peer: 123,
						version: 2,
						data: 'bar',
						sign: null,
					},
				],
			)
			
		},
		
		'Move existen node'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.put( '/111', '', 'foo' )
			store.put( '/222', '111', 'bar' )
			store.put( '/111', '222', 'lol' )
			
			$mol_assert_like(
				store.kids( '' ).map( node => ({ ... node }) ),
				[
					{
						guid: '/222',
						leader: '111',
						peer: 123,
						version: 2,
						data: 'bar',
						sign: null,
					},
					{
						guid: '/111',
						leader: '222',
						peer: 123,
						version: 3,
						data: 'lol',
						sign: null,
					},
				],
			)
			
		},
		
		'Deltas for different versions'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.put( '/111', '', 'foo' )
			store.put( '/111/222', '', 'bar' )
			store.put( '/111/333', '', 'lol' )
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ 123, 0 ],
				]) ).map( node => ({ ... node }) ),
				[
					{
						guid: '/111',
						leader: '',
						peer: 123,
						version: 1,
						data: 'foo',
						sign: null,
					},
					{
						guid: '/111/222',
						leader: '',
						peer: 123,
						version: 2,
						data: 'bar',
						sign: null,
					},
					{
						guid: '/111/333',
						leader: '',
						peer: 123,
						version: 3,
						data: 'lol',
						sign: null,
					},
				],
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
		
	})
}
