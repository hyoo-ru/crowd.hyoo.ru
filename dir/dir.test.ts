namespace $ {
	
	$mol_test({
		
		async 'delta & apply'() {
			
			const dir1 = new $hyoo_crowd_dir( await $hyoo_crowd_peer.generate() )
			const dir2 = new $hyoo_crowd_dir( await $hyoo_crowd_peer.generate() )
			
			const land1 = await dir1.grab()
			const land2 = await dir1.grab()
			
			// do changes
			land1.root.as( $hyoo_crowd_list ).list([ 123, 456 ])
			land2.root.as( $hyoo_crowd_list ).list([ 456, 789 ])
			
			// apply changes
			for await( const delta of dir1.delta() ) {
				$mol_assert_like( await dir2.apply( delta ), [] )
			}
			
			$mol_assert_like(
				dir2.land( land1.id ).root.as( $hyoo_crowd_list ).list(),
				[ 123, 456 ],
			)
			
			$mol_assert_like(
				dir2.land( land2.id ).root.as( $hyoo_crowd_list ).list(),
				[ 456, 789 ],
			)
			
		},
		
		async 'ignore changes from far future'() {
			
			const dir1 = new $hyoo_crowd_dir( await $hyoo_crowd_peer.generate() )
			const dir2 = new $hyoo_crowd_dir( await $hyoo_crowd_peer.generate() )
			const land = await dir1.grab()
			
			// go to future
			const clock = land.clock
			clock.see_time( 0, clock.now() + 60 * 60 * 24 )
			
			// do changes
			land.root.as( $hyoo_crowd_reg ).numb( 123 )
			
			// 2 ignored units
			const broken = [] as [ $hyoo_crowd_chunk, string ][]
			for await( const delta of dir1.delta() ) {
				broken.push( ... await dir2.apply( delta ) )
			}
			$mol_assert_like(
				broken.map( ([_, error ])=> error ),
				[ 'Far future', 'Far future' ],
			)
			
			// only 2 grab units
			$mol_assert_like( dir2.land( land.id ).delta().length, 2 )
			
		},
		
		async 'ignore auth as another peer'() {
			
			const dir1 = new $hyoo_crowd_dir( { ... await $hyoo_crowd_peer.generate(), id: { lo: 1, hi: 11 } } )
			const dir2 = new $hyoo_crowd_dir( await $hyoo_crowd_peer.generate() )
			const land = await dir1.grab()
			
			// do changes
			land.root.as( $hyoo_crowd_reg ).numb( 123 )
			
			// 2 ignored units
			const broken = [] as [ $hyoo_crowd_chunk, string ][]
			for await( const delta of dir1.delta() ) {
				broken.push( ... await dir2.apply( delta ) )
			}
			$mol_assert_like(
				broken.map( ([_, error ])=> error ),
				[ 'Alien join key', 'No auth key' ],
			)
			
			// only 2 grab units
			$mol_assert_like( dir2.land( land.id ).delta().length, 2 )
			
		},
		
		async 'ignore auth without key'() {
			
			const dir1 = new $hyoo_crowd_dir( { ... await $hyoo_crowd_peer.generate(), key_public_serial: [] as any } )
			const dir2 = new $hyoo_crowd_dir( await $hyoo_crowd_peer.generate() )
			const land = await dir1.grab()
			
			// do changes
			dir1.land({ lo: 1, hi: 1 }).root.as( $hyoo_crowd_reg ).numb( 123 )
			
			// 2 ignored units
			const broken = [] as [ $hyoo_crowd_chunk, string ][]
			for await( const delta of dir1.delta() ) {
				broken.push( ... await dir2.apply( delta ) )
			}
			$mol_assert_like(
				broken.map( ([_, error ])=> error ),
				[ 'No join key', 'No king' ],
			)
			
			// only 2 grab units
			$mol_assert_like( dir2.land( land.id ).delta().length, 2 )
			
		},
		
		async 'ignore changes with wrong signs'() {
			
			const dir1 = new $hyoo_crowd_dir( await $hyoo_crowd_peer.generate() )
			const dir2 = new $hyoo_crowd_dir( await $hyoo_crowd_peer.generate() )
			const land = await dir1.grab()
			
			// 2 ignored units
			const broken = [] as [ $hyoo_crowd_chunk, string ][]
			for await( const delta of dir1.delta() ) {
				delta[ 16 ] = ~ delta[ 16 ] // break sign
				broken.push( ... await dir2.apply( delta ) )
			}
			$mol_assert_like(
				broken.map( ([_, error ])=> error ),
				[ 'Wrong join sign', 'No king' ],
			)
			
			// no applied units 
			$mol_assert_like( dir2.land( land.id ).delta().length, 0 )
			
		},
		
		async 'ignore update auth'() {
			
			const peer = await $hyoo_crowd_peer.generate()
			const dir1 = new $hyoo_crowd_dir( peer )
			const dir2 = new $hyoo_crowd_dir( peer )
			const land = await dir1.grab()
			
			// do changes
			land.root.as( $hyoo_crowd_reg ).numb( 123 )
			dir2.land( land.id ).root.as( $hyoo_crowd_reg ).numb( 234 )
			
			// 1 ignored unit
			const broken = [] as [ $hyoo_crowd_chunk, string ][]
			for await( const delta of dir1.delta() ) {
				broken.push( ... await dir2.apply( delta ) )
			}
			$mol_assert_like(
				broken.map( ([_, error ])=> error ),
				[ 'Already join' ],
			)
			
			// 5 units applied
			$mol_assert_like( dir2.land( land.id ).delta().length, 5 )
			
		},
		
		async 'levels'() {
			
			const dir1 = new $hyoo_crowd_dir( await $hyoo_crowd_peer.generate() )
			const dir2 = new $hyoo_crowd_dir( await $hyoo_crowd_peer.generate() )
			
			const peer = await $hyoo_crowd_peer.generate()
			
			const land1 = await dir1.grab()
			const land2 = dir2.land( land1.id )
			
			// do changes
			land1.root.sub( 'foo', $hyoo_crowd_reg ).numb( 123 )
			
			for await( const delta of dir1.delta() ) {
				await dir2.apply( delta )
			}
			land2.root.sub( 'foo', $hyoo_crowd_reg ).numb( 234 )
			land2.root.sub( 'bar', $hyoo_crowd_reg ).numb( 234 )
			land2.level( peer.id, $hyoo_crowd_peer_level.law ) 
			
			$mol_assert_like( land1.delta().length, 4 )
			
			level_get: {
				
				const broken = [] as [ $hyoo_crowd_chunk, string ][]
				
				for await( const delta of dir2.delta() ) {
					broken.push( ... await dir1.apply( delta ) )
				}
				
				$mol_assert_like(
					broken.map( ([_, error ])=> error ),
					[ 'Already join', 'Already join', 'No rights', 'No rights', 'Need law level' ],
				)
				
				$mol_assert_like( land1.delta().length, 5 )
				$mol_assert_like( land1.root.sub( 'foo', $hyoo_crowd_reg ).numb(), 123 )
				$mol_assert_like( land1.root.sub( 'bar', $hyoo_crowd_reg ).numb(), 0 )
				$mol_assert_like( land1.level( peer.id ), $hyoo_crowd_peer_level.get )
				
			}
			
			level_add: {
				
				land1.level( land2.auth.id, $hyoo_crowd_peer_level.add )
				
				const broken = [] as [ $hyoo_crowd_chunk, string ][]
				
				for await( const delta of dir2.delta() ) {
					broken.push( ... await dir1.apply( delta ) )
				}
				
				$mol_assert_like(
					broken.map( ([_, error ])=> error ),
					[ 'Already join', 'Already join', 'Already join', 'No rights', 'Need law level' ],
				)
				
				$mol_assert_like( land1.delta().length, 7 )
				$mol_assert_like( land1.root.sub( 'foo', $hyoo_crowd_reg ).numb(), 123 )
				$mol_assert_like( land1.root.sub( 'bar', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.level( peer.id ), $hyoo_crowd_peer_level.get )
				
			}
			
			level_mod: {
				
				land1.level( land2.auth.id, $hyoo_crowd_peer_level.mod )
				
				const broken = [] as [ $hyoo_crowd_chunk, string ][]
				
				for await( const delta of dir2.delta() ) {
					broken.push( ... await dir1.apply( delta ) )
				}
				
				$mol_assert_like(
					broken.map( ([_, error ])=> error ),
					[ 'Already join', 'Already join', 'Already join', 'Need law level' ],
				)
				
				$mol_assert_like( land1.delta().length, 7 )
				$mol_assert_like( land1.root.sub( 'foo', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.root.sub( 'bar', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.level( peer.id ), $hyoo_crowd_peer_level.get )
				
			}
			
			level_law: {
				
				land1.level( land2.auth.id, $hyoo_crowd_peer_level.law )
				
				const broken = [] as [ $hyoo_crowd_chunk, string ][]
				
				for await( const delta of dir2.delta() ) {
					broken.push( ... await dir1.apply( delta ) )
				}
				
				$mol_assert_like(
					broken.map( ([_, error ])=> error ),
					[ 'Already join', 'Already join', 'Already join' ],
				)
				
				$mol_assert_like( land1.delta().length, 8 )
				$mol_assert_like( land1.root.sub( 'foo', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.root.sub( 'bar', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.level( peer.id ), $hyoo_crowd_peer_level.law )
				
			}
			
		},
		
	})
}
