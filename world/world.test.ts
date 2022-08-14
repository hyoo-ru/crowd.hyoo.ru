namespace $ {
	
	$mol_test({
		
		async 'delta & apply'() {
			
			const world1 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			const world2 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			
			const land1 = await world1.grab()
			const land2 = await world1.grab()
			
			// do changes
			land1.root.as( $hyoo_crowd_list ).list([ 123, 456 ])
			land2.root.as( $hyoo_crowd_list ).list([ 456, 789 ])
			
			// apply changes
			for( const unit of await world1.delta() ) {
				$mol_assert_like( await world2.apply_unit( unit ), '' )
			}
			
			$mol_assert_like(
				world2.land( land1.id ).root.as( $hyoo_crowd_list ).list(),
				[ 123, 456 ],
			)
			
			$mol_assert_like(
				world2.land( land2.id ).root.as( $hyoo_crowd_list ).list(),
				[ 456, 789 ],
			)
			
		},
		
		async 'ignore changes from far future'() {
			
			const world1 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			const world2 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			const land = await world1.grab()
			
			// go to future
			const clock = land.clock_data
			clock.see_time( 0, clock.now() + 60 * 60 * 24 )
			
			// do changes
			land.root.as( $hyoo_crowd_reg ).numb( 123 )
			
			// 1 ignored units
			const broken = [] as string[]
			for( const bin of await world1.delta() ) {
				broken.push( await world2.apply_unit( bin ) )
			}
			$mol_assert_like( broken, [ '', '', '', 'Far future' ] )
			
			// only 3 grab units
			$mol_assert_like( world2.land( land.id ).delta().length, 3 )
			
		},
		
		async 'ignore auth as another peer'() {
			
			const world1 = new $hyoo_crowd_world( { ... await $hyoo_crowd_peer.generate(), id: { lo: 1, hi: 11 } } )
			const world2 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			const land = await world1.grab()
			
			// do changes
			land.root.as( $hyoo_crowd_reg ).numb( 123 )
			
			// 2 ignored units
			const broken = [] as string[]
			for( const bin of await world1.delta() ) {
				broken.push( await world2.apply_unit( bin ) )
			}
			$mol_assert_like( broken, [ '', '', 'Alien join key', 'No auth key' ] )
			
			// only 2 grab units
			$mol_assert_like( world2.land( land.id ).delta().length, 2 )
			
		},
		
		async 'ignore auth without key'() {
			
			const world1 = new $hyoo_crowd_world( { ... await $hyoo_crowd_peer.generate(), key_public_serial: [] as any } )
			const world2 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			const land = await world1.grab()
			
			// do changes
			world1.land({ lo: 1, hi: 1 }).root.as( $hyoo_crowd_reg ).numb( 123 )
			
			// 2 ignored units
			const broken = [] as string[]
			for( const bin of await world1.delta() ) {
				broken.push( await world2.apply_unit( bin ) )
			}
			$mol_assert_like( broken, [ '', '', 'No join key', 'No king' ] )
			
			// only 2 grab units
			$mol_assert_like( world2.land( land.id ).delta().length, 2 )
			
		},
		
		async 'ignore changes with wrong signs'() {
			
			const world1 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			const world2 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			const land = await world1.grab()
			
			// 2 ignored units
			const broken = [] as string[]
			for( const unit of await world1.delta() ) {
				unit.bin!.setInt8( 16, ~ unit.bin!.getInt8( 16 ) ) // break sign
				broken.push( await world2.apply_unit( unit ) )
			}
			$mol_assert_like( broken, [ 'Wrong join sign', 'No king' ] )
			
			// no applied units 
			$mol_assert_like( world2.land( land.id ).delta().length, 0 )
			
		},
		
		async 'ignore update auth'() {
			
			const peer = await $hyoo_crowd_peer.generate()
			const world1 = new $hyoo_crowd_world( peer )
			const world2 = new $hyoo_crowd_world( peer )
			const land = await world1.grab()
			
			// do changes
			land.root.as( $hyoo_crowd_reg ).numb( 123 )
			world2.land( land.id ).root.as( $hyoo_crowd_reg ).numb( 234 )
			
			// 1 ignored unit
			const broken = [] as string[]
			for( const bin of await world1.delta() ) {
				broken.push( await world2.apply_unit( bin ) )
			}
			$mol_assert_like( broken, [ '', '', 'Already join', '' ] )
			
			// 5 units applied
			$mol_assert_like( world2.land( land.id ).delta().length, 5 )
			
		},
		
		async 'levels'() {
			
			const world1 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			const world2 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			
			const peer = await $hyoo_crowd_peer.generate()
			
			const land1 = await world1.grab() // +3 units
			const land2 = world2.land( land1.id )
			
			// do changes
			land1.root.sub( 'foo', $hyoo_crowd_reg ).numb( 123 ) // +1 unit
			
			for( const bin of await world1.delta() ) {
				await world2.apply_unit( bin )
			}
			land2.root.sub( 'foo', $hyoo_crowd_reg ).numb( 234 ) // 1 unit update +1 unit
			land2.root.sub( 'bar', $hyoo_crowd_reg ).numb( 234 ) // +1 unit
			land2.level( peer.id, $hyoo_crowd_peer_level.law ) // +1 unit
			
			$mol_assert_like( land1.delta().length, 4 )
			
			level_get: {
				
				const broken = [] as string[]
				for( const bin of await world2.delta() ) {
					broken.push( await world1.apply_unit( bin ) )
				}
				
				$mol_assert_like( broken, [ 'Already join', '', 'Already join', '', 'Need law level', 'No rights', 'No rights' ] )
				$mol_assert_like( land1.delta().length, 5 )
				$mol_assert_like( land1.root.sub( 'foo', $hyoo_crowd_reg ).numb(), 123 )
				$mol_assert_like( land1.root.sub( 'bar', $hyoo_crowd_reg ).numb(), 0 )
				$mol_assert_like( land1.level( peer.id ), $hyoo_crowd_peer_level.get )
				
			}
			
			level_add: {
				
				land1.level( land2.auth.id, $hyoo_crowd_peer_level.add ) // +1 unit
				
				const broken = [] as string[]
				for( const bin of await world2.delta() ) {
					broken.push( await world1.apply_unit( bin ) )
				}
				
				$mol_assert_like( broken, [ 'Already join', '', 'Already join', 'Already join', 'Need law level', 'No rights', '' ] )
				$mol_assert_like( land1.delta().length, 7 )
				$mol_assert_like( land1.root.sub( 'foo', $hyoo_crowd_reg ).numb(), 123 )
				$mol_assert_like( land1.root.sub( 'bar', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.level( peer.id ), $hyoo_crowd_peer_level.get )
				
			}
			
			level_mod: {
				
				land1.level( land2.auth.id, $hyoo_crowd_peer_level.mod )
				
				const broken = [] as string[]
				for( const bin of await world2.delta() ) {
					broken.push( await world1.apply_unit( bin ) )
				}
				
				$mol_assert_like( broken, [ 'Already join', '', 'Already join', 'Already join', 'Need law level', '', '' ] )
				$mol_assert_like( land1.delta().length, 7 )
				$mol_assert_like( land1.root.sub( 'foo', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.root.sub( 'bar', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.level( peer.id ), $hyoo_crowd_peer_level.get )
				
			}
			
			level_law: {
				
				land1.level( land2.auth.id, $hyoo_crowd_peer_level.law )
				
				const broken = [] as string[]
				for( const bin of await world2.delta() ) {
					broken.push( await world1.apply_unit( bin ) )
				}
				
				$mol_assert_like( broken, [ 'Already join', '', 'Already join', 'Already join', '', '', '' ] )
				$mol_assert_like( land1.delta().length, 8 )
				$mol_assert_like( land1.root.sub( 'foo', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.root.sub( 'bar', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.level( peer.id ), $hyoo_crowd_peer_level.law )
				
			}
			
		},
		
		async 'default level'() {
			
			const world1 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			const world2 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			
			const peer = await $hyoo_crowd_peer.generate()
			
			const land1 = await world1.grab()
			const land2 = world2.land( land1.id )
			
			// do changes
			land1.root.sub( 'foo', $hyoo_crowd_reg ).numb( 123 )
			
			for( const bin of await world1.delta() ) {
				await world2.apply_unit( bin )
			}
			land2.root.sub( 'foo', $hyoo_crowd_reg ).numb( 234 )
			land2.root.sub( 'bar', $hyoo_crowd_reg ).numb( 234 )
			land2.level( peer.id, $hyoo_crowd_peer_level.law ) 
			
			$mol_assert_like( land1.delta().length, 4 )
			
			level_add: {
				
				land1.level_base( $hyoo_crowd_peer_level.add )
				
				const broken = [] as string[]
				for( const bin of await world2.delta() ) {
					broken.push( await world1.apply_unit( bin ) )
				}
				
				$mol_assert_like( broken, [ 'Already join', '', 'Already join', '', 'Need law level', 'No rights', '' ] )
				$mol_assert_like( land1.delta().length, 7 )
				$mol_assert_like( land1.root.sub( 'foo', $hyoo_crowd_reg ).numb(), 123 )
				$mol_assert_like( land1.root.sub( 'bar', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.level( peer.id ), $hyoo_crowd_peer_level.get )
				
			}
			
			level_mod: {
				
				land1.level_base( $hyoo_crowd_peer_level.mod )
				
				const broken = [] as string[]
				for( const bin of await world2.delta() ) {
					broken.push( await world1.apply_unit( bin ) )
				}
				
				$mol_assert_like( broken, [ 'Already join', '', 'Already join', 'Already join', 'Need law level', '', '' ] )
				$mol_assert_like( land1.delta().length, 7 )
				$mol_assert_like( land1.root.sub( 'foo', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.root.sub( 'bar', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.level( peer.id ), $hyoo_crowd_peer_level.get )
				
			}
			
			// forbidden now
			level_law: {
				
				land1.level_base( $hyoo_crowd_peer_level.law )
				
				const broken = [] as string[]
				for( const bin of await world2.delta() ) {
					broken.push( await world1.apply_unit( bin ) )
				}
				
				$mol_assert_like( broken, [ 'Already join', '', 'Already join', 'Already join', 'Need law level', '', '' ] )
				$mol_assert_like( land1.delta().length, 7 )
				$mol_assert_like( land1.root.sub( 'foo', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.root.sub( 'bar', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.level( peer.id ), $hyoo_crowd_peer_level.get )
				
			}
			
		},
		
	})
}
