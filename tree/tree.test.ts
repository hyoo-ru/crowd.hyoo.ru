namespace $ {
	$mol_test({
		
		'Put values cuncurrent to the root'() {
			
			const store = new $hyoo_crowd_tree( 123 )
			
			store.put({ guid: 111, data: 'foo' })
			store.put({ guid: 222, data: 'bar' })
			
			$mol_assert_like(
				store.list( 0 ).map( node => ({ ... node }) ),
				[
					{
						guid: 222,
						parent: 0,
						leader: 0,
						peer: 123,
						version: 2,
						data: 'bar',
						sign: null,
					},
					{
						guid: 111,
						parent: 0,
						leader: 0,
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
			
			store.put({ guid: 111, data: 'foo' })
			store.put({ guid: 222, parent: 0, leader: 111, data: 'bar' })
			
			$mol_assert_like(
				store.list( 0 ).map( node => ({ ... node }) ),
				[
					{
						guid: 111,
						parent: 0,
						leader: 0,
						peer: 123,
						version: 1,
						data: 'foo',
						sign: null,
					},
					{
						guid: 222,
						parent: 0,
						leader: 111,
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
			
			store.put({ guid: 111, data: 'foo' })
			store.put({ guid: 222, parent: 0, leader: 111, data: 'bar' })
			store.put({ guid: 333, parent: 0, leader: 111, data: 'lol' })
			
			$mol_assert_like(
				store.list( 0 ).map( node => ({ ... node }) ),
				[
					{
						guid: 111,
						parent: 0,
						leader: 0,
						peer: 123,
						version: 1,
						data: 'foo',
						sign: null,
					},
					{
						guid: 333,
						parent: 0,
						leader: 111,
						peer: 123,
						version: 3,
						data: 'lol',
						sign: null,
					},
					{
						guid: 222,
						parent: 0,
						leader: 111,
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
			
			store.put({ guid: 111, data: 'foo' })
			store.put({ guid: 222, parent: 111, data: 'bar' })
			
			$mol_assert_like(
				store.list( 0 ).map( node => ({ ... node }) ),
				[
					{
						guid: 111,
						parent: 0,
						leader: 0,
						peer: 123,
						version: 1,
						data: 'foo',
						sign: null,
					},
				],
			)
			
			$mol_assert_like(
				store.list( 111 ).map( node => ({ ... node }) ),
				[
					{
						guid: 222,
						parent: 111,
						leader: 0,
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
			
			store.put({ guid: 111, data: 'foo' })
			store.put({ guid: 222, parent: 0, leader: 111, data: 'bar' })
			store.put({ guid: 111, parent: 0, leader: 222, data: 'lol' })
			
			$mol_assert_like(
				store.list( 0 ).map( node => ({ ... node }) ),
				[
					{
						guid: 222,
						parent: 0,
						leader: 111,
						peer: 123,
						version: 2,
						data: 'bar',
						sign: null,
					},
					{
						guid: 111,
						parent: 0,
						leader: 222,
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
			
			store.put({ guid: 111, data: 'foo' })
			store.put({ guid: 222, parent: 111, data: 'bar' })
			store.put({ guid: 333, parent: 111, data: 'lol' })
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ 123, 0 ],
				]) ).map( node => ({ ... node }) ),
				[
					{
						guid: 111,
						parent: 0,
						leader: 0,
						peer: 123,
						version: 1,
						data: 'foo',
						sign: null,
					},
					{
						guid: 222,
						parent: 111,
						leader: 0,
						peer: 123,
						version: 2,
						data: 'bar',
						sign: null,
					},
					{
						guid: 333,
						parent: 111,
						leader: 0,
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
				[ 222, 333 ],
			)
			
			$mol_assert_like(
				store.delta( new $hyoo_crowd_clock([
					[ 123, 2 ],
				]) ).map( node => node.guid ),
				[ 333 ],
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
			
			const guid1 = store.put({ guid: 111, data: 'foo' })
			const guid2 = store.put({ guid: 222, parent: 111, data: 'bar' })
			const guid3 = store.put({ guid: 333, parent: 222, data: 'lol' })
			
			$mol_assert_like( store.list( 0 ).map( n => n.guid ), [ guid1 ] )
			$mol_assert_like( store.list( guid1 ).map( n => n.guid ), [ guid2 ] )
			$mol_assert_like( store.list( guid2 ).map( n => n.guid ), [ guid3 ] )
			
			const node3 = store.node( guid3 )
			
			store.wipe( store.node( guid1 ) )
			
			$mol_assert_like( store.list( 0 ).map( n => n.guid ), [] )
			$mol_assert_like( store.list( guid1 ).map( n => n.guid ), [] )
			$mol_assert_like( store.list( guid2 ).map( n => n.guid ), [] )
			
			store.put( node3 )
			
			$mol_assert_like( store.list( 0 ).map( n => n.guid ), [] )
			$mol_assert_like( store.list( guid1 ).map( n => n.guid ), [] )
			$mol_assert_like( store.list( guid2 ).map( n => n.guid ), [ guid3 ] )
			
		},
		
	})
}
