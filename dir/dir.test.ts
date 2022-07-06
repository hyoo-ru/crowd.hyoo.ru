namespace $ {
	
	$mol_test({
		
		async 'delta & apply'() {
			
			const dir1 = new $hyoo_crowd_dir( await $$.$hyoo_crowd_peer_new() )
			const dir2 = new $hyoo_crowd_dir( await $$.$hyoo_crowd_peer_new() )
			
			// do changes
			dir1.file( 'foo' ).root.as( $hyoo_crowd_list ).list([ 123, 456 ])
			dir1.file( 'bar' ).root.as( $hyoo_crowd_list ).list([ 456, 789 ])
			
			// apply changes
			for await( const delta of dir1.delta() ) {
				$mol_assert_like( await dir2.apply( delta ), [] )
			}
			
			$mol_assert_like(
				dir2.file( 'foo' ).root.as( $hyoo_crowd_list ).list(),
				[ 123, 456 ],
			)
			
			$mol_assert_like(
				dir2.file( 'bar' ).root.as( $hyoo_crowd_list ).list(),
				[ 456, 789 ],
			)
			
		},
		
		async 'ignore changes from far future'() {
			
			const dir1 = new $hyoo_crowd_dir( await $$.$hyoo_crowd_peer_new() )
			const dir2 = new $hyoo_crowd_dir( await $$.$hyoo_crowd_peer_new() )
			
			// go to future
			const clock = dir1.file( 'foo' ).clock
			clock.see_time( clock.now()[0] + 60 * 60 * 24, clock.last_lo )
			
			// do changes
			dir1.file( 'foo' ).root.as( $hyoo_crowd_reg ).numb( 123 )
			
			// 2 ignored chunks
			const broken = [] as [ $hyoo_crowd_chunk, Error ][]
			for await( const delta of dir1.delta() ) {
				broken.push( ... await dir2.apply( delta ) )
			}
			$mol_assert_like(
				broken.map( ([_, error ])=> error.message ),
				[ 'Far future', 'Far future' ],
			)
			
			// no applied chunks 
			$mol_assert_like( dir2.file( 'foo' ).delta().length, 0 )
			
		},
		
		// async 'ignore changes from different file'() {
			
		// 	const dir1 = new $hyoo_crowd_dir( await $$.$hyoo_crowd_peer_new() )
		// 	const dir2 = new $hyoo_crowd_dir( await $$.$hyoo_crowd_peer_new() )
			
		// 	// do changes
		// 	dir1.file( 'foo' ).root.as( $hyoo_crowd_reg ).numb( 123 )
			
		// 	// repeat changes to another file
		// 	dir1.file( 'bar' ).apply( dir1.file( 'foo' ).delta() )
			
		// 	// 1 ignored chunk
		// 	const broken = [] as [ $hyoo_crowd_chunk, Error ][]
		// 	for await( const delta of dir1.delta() ) {
		// 		broken.push( ... await dir2.apply( delta ) )
		// 	}
		// 	$mol_assert_like(
		// 		broken.map( ([_, error ])=> error.message ),
		// 		[ 'Nest mismatch' ],
		// 	)
			
		// 	// applied only correct chunks
		// 	$mol_assert_like(
		// 		dir2.file( 'foo' ).root.as( $hyoo_crowd_reg ).numb(),
		// 		123,
		// 	)
		// 	$mol_assert_like(
		// 		dir2.file( 'bar' ).root.as( $hyoo_crowd_reg ).numb(),
		// 		0,
		// 	)
			
		// },
		
		async 'ignore auth as another peer'() {
			
			const dir1 = new $hyoo_crowd_dir( { ... await $$.$hyoo_crowd_peer_new(), hi: 1, lo: 23 } )
			const dir2 = new $hyoo_crowd_dir( await $$.$hyoo_crowd_peer_new() )
			
			// do changes
			dir1.file( 'foo' ).root.as( $hyoo_crowd_reg ).numb( 123 )
			
			// 2 ignored chunks
			const broken = [] as [ $hyoo_crowd_chunk, Error ][]
			for await( const delta of dir1.delta() ) {
				broken.push( ... await dir2.apply( delta ) )
			}
			$mol_assert_like(
				broken.map( ([_, error ])=> error.message ),
				[ 'Alien auth key', 'Unknown peer' ],
			)
			
			// no applied chunks 
			$mol_assert_like( dir2.file( 'foo' ).delta().length, 0 )
			
		},
		
		async 'ignore auth without key'() {
			
			const dir1 = new $hyoo_crowd_dir( { ... await $$.$hyoo_crowd_peer_new(), public_serial: [] as any } )
			const dir2 = new $hyoo_crowd_dir( await $$.$hyoo_crowd_peer_new() )
			
			// do changes
			dir1.file( 'foo' ).root.as( $hyoo_crowd_reg ).numb( 123 )
			
			// 2 ignored chunks
			const broken = [] as [ $hyoo_crowd_chunk, Error ][]
			for await( const delta of dir1.delta() ) {
				broken.push( ... await dir2.apply( delta ) )
			}
			$mol_assert_like(
				broken.map( ([_, error ])=> error.message ),
				[ 'No auth key', 'Unknown peer' ],
			)
			
			// no applied chunks 
			$mol_assert_like( dir2.file( 'foo' ).delta().length, 0 )
			
		},
		
		async 'ignore changes with wrong signs'() {
			
			const dir1 = new $hyoo_crowd_dir( await $$.$hyoo_crowd_peer_new() )
			const dir2 = new $hyoo_crowd_dir( await $$.$hyoo_crowd_peer_new() )
			
			// do changes
			dir1.file( 'foo' ).root.as( $hyoo_crowd_reg ).numb( 123 )
			
			// 2 ignored chunks
			const broken = [] as [ $hyoo_crowd_chunk, Error ][]
			for await( const delta of dir1.delta() ) {
				delta[ 16 ] = ~ delta[ 16 ] // break sign
				broken.push( ... await dir2.apply( delta ) )
			}
			$mol_assert_like(
				broken.map( ([_, error ])=> error.message ),
				[ 'Wrong sign', 'Unknown peer' ],
			)
			
			// no applied chunks 
			$mol_assert_like( dir2.file( 'foo' ).delta().length, 0 )
			
		},
		
		async 'ignore update auth'() {
			
			const peer = await $$.$hyoo_crowd_peer_new()
			const dir1 = new $hyoo_crowd_dir( peer )
			const dir2 = new $hyoo_crowd_dir( peer )
			
			// do changes
			dir1.file( 'foo' ).root.as( $hyoo_crowd_reg ).numb( 123 )
			dir2.file( 'foo' ).root.as( $hyoo_crowd_reg ).numb( 234 )
			
			// 1 ignored chunk
			const broken = [] as [ $hyoo_crowd_chunk, Error ][]
			for await( const delta of dir1.delta() ) {
				broken.push( ... await dir2.apply( delta ) )
			}
			$mol_assert_like(
				broken.map( ([_, error ])=> error.message ),
				[ 'Already auth' ],
			)
			
			// 3 chunks applied
			$mol_assert_like( dir2.file( 'foo' ).delta().length, 3 )
			
		},
		
		// check
		//   no rights
		
	})
}
