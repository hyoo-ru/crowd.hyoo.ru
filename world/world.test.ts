namespace $ {
	
	$mol_test({
		
		async 'world delta & apply'() {
			
			const world1 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			const world2 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			
			const land1 = await world1.grab()
			const land2 = await world1.grab()
			
			// do changes
			land1.chief.as( $hyoo_crowd_list ).list([ 123, 456 ])
			land2.chief.as( $hyoo_crowd_list ).list([ 456, 789 ])
			
			// apply changes
			for await( const batch of world1.delta() ) {
				$mol_assert_like(
					( await world2.apply( batch ) ).forbid,
					new Map,
				)
			}
			
			$mol_assert_like(
				world2.land( land1.id() ).chief.as( $hyoo_crowd_list ).list(),
				[ 123, 456 ],
			)
			
			$mol_assert_like(
				world2.land( land2.id() ).chief.as( $hyoo_crowd_list ).list(),
				[ 456, 789 ],
			)
			
		},
		
		async 'land delta & apply'() {
			
			const world1 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			const world2 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			
			const land = world1.land( world1.peer!.id )
			
			// do changes
			land.chief.as( $hyoo_crowd_list ).list([ 123, 456 ])
			
			// apply changes
			const batch = await world1.delta_batch( land )
			$mol_assert_like(
				( await world2.apply( batch ) ).forbid,
				new Map,
			)
			
			$mol_assert_like(
				world2.land( land.id() ).chief.as( $hyoo_crowd_list ).list(),
				[ 123, 456 ],
			)
			
		},
		
		async 'ignore changes from far future'() {
			
			const world1 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			const world2 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			const land = await world1.grab()
			
			// go to future
			const clock = land.clock_data
			clock.see_time( clock.now() + 60 * 60 * 24 * 10 )
			
			// do changes
			land.chief.as( $hyoo_crowd_reg ).numb( 123 )
			
			// 1 ignored units
			const batch = await world1.delta_batch( land )
			$mol_assert_like(
				[ ... ( await world2.apply( batch ) ).forbid.values() ],
				[ 'Far future' ],
			)
			
			// only 3 grab units
			$mol_assert_like( world2.land( land.id() ).delta().length, 3 )
			
		},
		
		async 'ignore auth as another peer'() {
			
			const world1 = new $hyoo_crowd_world( { ... await $hyoo_crowd_peer.generate(), id: '1_1' } )
			const world2 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			const land = await world1.grab()
			
			// do changes
			land.chief.as( $hyoo_crowd_reg ).numb( 123 )
			
			// 2 ignored units
			const batch = await world1.delta_batch( land )
			$mol_assert_like(
				[ ... ( await world2.apply( batch ) ).forbid.values() ],
				[ 'Alien join key', 'No auth key' ],
			)
			
			// only 2 grab units
			$mol_assert_like( world2.land( land.id() ).delta().length, 2 )
			
		},
		
		async 'ignore auth without key'() {
			
			const world1 = new $hyoo_crowd_world( { ... await $hyoo_crowd_peer.generate(), key_public_serial: [] as any } )
			const world2 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			const land = world1.land( '1_1' )
			
			// do changes
			land.chief.as( $hyoo_crowd_reg ).numb( 123 )
			
			// 2 ignored units
			const batch = await world1.delta_batch( land )
			$mol_assert_like(
				[ ... ( await world2.apply( batch ) ).forbid.values() ],
				[ 'No join key', 'Level too low' ],
			)
			
			// only 2 grab units
			$mol_assert_like( world2.land( land.id() ).delta().length, 0 )
			
		},
		
		async 'ignore changes with wrong signs'() {
			
			const world1 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			const world2 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			const land = await world1.grab()
			
			// 2 ignored units
			const batch = await world1.delta_batch( land )
			batch[152] = ~batch[152] // break sign
			
			$mol_assert_like(
				[ ... ( await world2.apply( batch ) ).forbid.values() ],
				[ 'Wrong join sign', 'Level too low' ],
			)
			
			// no applied units 
			$mol_assert_like( world2.land( land.id() ).delta().length, 0 )
			
		},
		
		async 'ignore update auth except auth removing'() {
			
			const peer = await $hyoo_crowd_peer.generate()
			const world1 = new $hyoo_crowd_world( peer )
			const world2 = new $hyoo_crowd_world( peer )
			
			const land1 = await world1.grab()
			const land2 = world2.land( land1.id() )
			land2.clock_auth.tick( peer.id )
			land2.clock_data.tick( peer.id )
			
			// do changes
			land1.chief.as( $hyoo_crowd_reg ).numb( 123 )
			land2.chief.as( $hyoo_crowd_reg ).numb( 234 )
			
			const batch = await world1.delta_batch( land1 )
			$mol_assert_like(
				[ ... ( await world2.apply( batch ) ).forbid.values() ],
				[],
			)
			
			$mol_assert_like( land2.delta().length, 5 )
			
			land1.chief.as( $hyoo_crowd_reg ).numb( 345 )
			land1.leave()
			
			const batch2 = await world1.delta_batch( land1 )
			$mol_assert_like(
				[ ... ( await world2.apply( batch2 ) ).forbid.values() ],
				[ 'No auth key' ],
			)
			$mol_assert_like(
				land2.chief.as( $hyoo_crowd_reg ).numb(),
				234,
			)
			
		},
		
		async 'levels'() {
			
			const world1 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			const world2 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			
			const peer = await $hyoo_crowd_peer.generate()
			
			const land1 = await world1.grab() // +3 units
			const land2 = world2.land( land1.id() )
			
			// do changes
			land1.chief.sub( 'foo', $hyoo_crowd_reg ).numb( 123 ) // +1 unit
			
			for await( const batch of world1.delta() ) {
				$mol_assert_like(
					[ ... ( await world2.apply( batch ) ).forbid.values() ],
					[],
				)
			}
			
			land2.chief.sub( 'foo', $hyoo_crowd_reg ).numb( 234 ) // 1 unit update +1 unit
			land2.chief.sub( 'bar', $hyoo_crowd_reg ).numb( 234 ) // +1 unit
			land2.level( peer.id, $hyoo_crowd_peer_level.law ) // +1 unit
			
			$mol_assert_like( land1.delta().length, 4 )
			
			level_get: {
				
				const batch = await world2.delta_batch( land2 )
				$mol_assert_like(
					[ ... ( await world1.apply( batch ) ).forbid.values() ],
					[ 'Level too low', 'Level too low', 'Level too low' ],
				)
				
				$mol_assert_like( land1.delta().length, 5 )
				$mol_assert_like( land1.chief.sub( 'foo', $hyoo_crowd_reg ).numb(), 123 )
				$mol_assert_like( land1.chief.sub( 'bar', $hyoo_crowd_reg ).numb(), 0 )
				$mol_assert_like( land1.level( peer.id ), $hyoo_crowd_peer_level.get )
				
			}
			
			level_add: {
				
				land1.level( land2.peer().id, $hyoo_crowd_peer_level.add ) // +1 unit
				
				const batch = await world2.delta_batch( land2 )
				$mol_assert_like(
					[ ... ( await world1.apply( batch ) ).forbid.values() ],
					[ 'Level too low', 'Level too low' ],
				)
				
				$mol_assert_like( land1.delta().length, 7 )
				$mol_assert_like( land1.chief.sub( 'foo', $hyoo_crowd_reg ).numb(), 123 )
				$mol_assert_like( land1.chief.sub( 'bar', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.level( peer.id ), $hyoo_crowd_peer_level.get )
				
			}
			
			level_mod: {
				
				land1.level( land2.peer().id, $hyoo_crowd_peer_level.mod )
				
				const batch = await world2.delta_batch( land2 )
				$mol_assert_like(
					[ ... ( await world1.apply( batch ) ).forbid.values() ],
					[ 'Level too low' ],
				)
				
				$mol_assert_like( land1.delta().length, 7 )
				$mol_assert_like( land1.chief.sub( 'foo', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.chief.sub( 'bar', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.level( peer.id ), $hyoo_crowd_peer_level.get )
				
			}
			
			level_law: {
				
				land1.level( land2.peer().id, $hyoo_crowd_peer_level.law )
				
				const batch = await world2.delta_batch( land2 )
				$mol_assert_like(
					[ ... ( await world1.apply( batch ) ).forbid.values() ],
					[],
				)
				
				$mol_assert_like( land1.delta().length, 8 )
				$mol_assert_like( land1.chief.sub( 'foo', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.chief.sub( 'bar', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.level( peer.id ), $hyoo_crowd_peer_level.law )
				
			}
			
		},
		
		async 'default level'() {
			
			const world1 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			const world2 = new $hyoo_crowd_world( await $hyoo_crowd_peer.generate() )
			
			const peer = await $hyoo_crowd_peer.generate()
			
			const land1 = await world1.grab()
			const land2 = world2.land( land1.id() )
			
			// do changes
			land1.chief.sub( 'foo', $hyoo_crowd_reg ).numb( 123 )
			
			const batch = await world1.delta_batch( land1 )
			$mol_assert_like(
				[ ... ( await world2.apply( batch ) ).forbid.values() ],
				[],
			)
			
			land2.chief.sub( 'foo', $hyoo_crowd_reg ).numb( 234 )
			land2.chief.sub( 'bar', $hyoo_crowd_reg ).numb( 234 )
			land2.level( peer.id, $hyoo_crowd_peer_level.law ) 
			
			$mol_assert_like( land1.delta().length, 4 )
			
			level_add: {
				
				land1.level_base( $hyoo_crowd_peer_level.add )
				
				const batch = await world2.delta_batch( land2 )
				$mol_assert_like(
					[ ... ( await world1.apply( batch ) ).forbid.values() ],
					[ 'Level too low', 'Level too low' ],
				)
				
				$mol_assert_like( land1.delta().length, 7 )
				$mol_assert_like( land1.chief.sub( 'foo', $hyoo_crowd_reg ).numb(), 123 )
				$mol_assert_like( land1.chief.sub( 'bar', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.level( peer.id ), $hyoo_crowd_peer_level.add )
				
			}
			
			level_mod: {
				
				land1.level_base( $hyoo_crowd_peer_level.mod )
				
				const batch = await world2.delta_batch( land2 )
				$mol_assert_like(
					[ ... ( await world1.apply( batch ) ).forbid.values() ],
					[ 'Level too low' ],
				)
				
				$mol_assert_like( land1.delta().length, 7 )
				$mol_assert_like( land1.chief.sub( 'foo', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.chief.sub( 'bar', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.level( peer.id ), $hyoo_crowd_peer_level.mod )
				
			}
			
			level_law: {
				
				land1.level_base( $hyoo_crowd_peer_level.law )
				
				const batch = await world2.delta_batch( land2 )
				$mol_assert_like(
					[ ... ( await world1.apply( batch ) ).forbid.values() ],
					[],
				)
				
				$mol_assert_like( land1.delta().length, 8 )
				$mol_assert_like( land1.chief.sub( 'foo', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.chief.sub( 'bar', $hyoo_crowd_reg ).numb(), 234 )
				$mol_assert_like( land1.level( peer.id ), $hyoo_crowd_peer_level.law )
				
			}
			
		},
		
	})
}
