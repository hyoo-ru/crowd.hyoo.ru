namespace $ {
	
	/** Conflict-free Reinterpretable Ordered Washed Data Tree */
	export class $hyoo_crowd_land extends $mol_object {
		
		@ $mol_memo.method
		id() {
			return $mol_int62_to_string( $mol_int62_random() )
		}
		
		peer(): $hyoo_crowd_peer {
			return this.world().peer!
		}
		
		world(): $hyoo_crowd_world {
			$mol_fail( new Error( `World isn't defined` ) )
		}
		
		get clock_auth() {
			this.pub.promote()
			return this._clocks[ $hyoo_crowd_unit_group.auth ]
		}
		
		get clock_data() {
			this.pub.promote()
			return this._clocks[ $hyoo_crowd_unit_group.data ]
		}
		
		get clocks() {
			this.pub.promote()
			return this._clocks
		}
		
		readonly pub = new $mol_wire_pub
		readonly _clocks = [ new $hyoo_crowd_clock, new $hyoo_crowd_clock ] as const
		
		/** unit by head + self */
		_unit_all = new Map<
			$hyoo_crowd_unit_id,
			$hyoo_crowd_unit
		>()
		
		unit(
			head: $mol_int62_string,
			self: $mol_int62_string,
		) {
			return this._unit_all.get(`${ head }/${ self }`)
		}
		
		/** units by head */
		_unit_lists = new Map<
			$mol_int62_string,
			undefined | $hyoo_crowd_unit[] & { dirty: boolean }
		>()
		
		/** Units by Head without tombstones */
		_unit_alives = new Map<
			$mol_int62_string,
			undefined | $hyoo_crowd_unit[]
		>()
		
		size() {
			return this._unit_all.size
		}
		
		/** Returns list of all Units for Node. */ 
		unit_list(
			head: $mol_int62_string,
		) {
			
			let kids = this._unit_lists.get( head )
			if( !kids ) this._unit_lists.set( head, kids = Object.assign( [], { dirty: false } ) )
			
			return kids
		}
		
		/** Returns list of alive Units for Node. */ 
		unit_alives(
			head: $mol_int62_string,
		): readonly $hyoo_crowd_unit[] {
			
			this.pub.promote()
			
			let kids = this._unit_alives.get( head )
			if( !kids ) {
				
				const all = this.unit_list( head )
				if( all.dirty ) this.resort( head )
				
				kids = all.filter( kid => kid.data !== null )
				this._unit_alives.set( head, kids )
				
			}
			
			return kids
		}
		
		/** Root Node. */
		chief = new $hyoo_crowd_struct( this, '0_0' )
		
		/** Generates new identifier. */
		id_new(): $mol_int62_string {
			
			for( let i = 0; i < 1000; ++i ) {
				
				const id = $mol_int62_to_string( $mol_int62_random() )
				
				if( id === '0_0' ) continue // zero reserved for empty
				if( id === this.id() ) continue // reserved for rights
				if( this._unit_lists.has( id ) ) continue // skip already exists
				
				return id
			}
			
			throw new Error( `Can't generate ID after 1000 times` )
			
		}
		
		/** Makes independent clone with defined peer. */
		fork( auth: $hyoo_crowd_peer ) {
			
			const fork = $hyoo_crowd_land.make({
				id: $mol_const( this.id() ),
				peer: $mol_const( auth ),
			})
			
			return fork.apply( this.delta() )
		}
		
		/** Makes Delta bettween Clock and now. */
		delta(
			clocks = [ new $hyoo_crowd_clock, new $hyoo_crowd_clock ] as const
		) {
			
			this.pub.promote()
			
			const delta = [] as $hyoo_crowd_unit[]
			
			for( const unit of this._unit_all.values() ) {
				
				const time = clocks[ unit.group() ].time( unit.auth )
				if( unit.time <= time ) continue
				
				delta.push( unit! )
			}
			
			delta.sort( $hyoo_crowd_unit_compare )
			
			return delta as readonly $hyoo_crowd_unit[]
		}
		
		resort(
			head: $mol_int62_string,
		) {
			
			const kids = this._unit_lists.get( head )!
			
			const queue = kids.splice(0).sort(
				( left, right )=> - $hyoo_crowd_unit_compare( left, right )
			)
			
			const locate = ( self: $mol_int62_string )=> {
				
				for( let i = kids.length - 1; i >= 0; --i ) {
					if( kids[i].self === self ) return i
				}
				
				return -1
			}
			
			for( let cursor = queue.length - 1; cursor >= 0; --cursor ) {
				
				const kid = queue[cursor]
				let index = 0

				if( kid.prev !== '0_0' ) {

					index = locate( kid.prev ) + 1
					
					if( !index ) {

						index = kids.length
						
						if( kid.next !== '0_0' ) {
							
							index = locate( kid.next )
							
							if( index === -1 ) continue

						}

					}

				}
				
				kids.splice( index, 0, kid )
				queue.splice( cursor, 1 )
				cursor = queue.length

			}
			
			this._unit_lists.set( head, kids )
			kids.dirty = false
			
			return kids
		}
		
		/** Applies Delta to current state. */
		apply( delta: readonly $hyoo_crowd_unit[] ) {
			
			for( const next of delta ) {
				
				this._clocks[ next.group() ].see_peer( next.auth, next.time )
				const kids = this.unit_list( next.head )
				const next_id = next.id
				
				let prev = this._unit_all.get( next_id )
				if( prev ) {
					if( $hyoo_crowd_unit_compare( prev, next ) > 0 ) continue
					kids.splice( kids.indexOf( prev ), 1, next )
				} else {
					kids.push( next )
				}
				
				this._unit_all.set( next_id, next )
				kids.dirty = true
				this._unit_alives.set( next.head, undefined )
				
			}
			
			this.pub.emit()
			
			return this
		}
		
		_joined = false
		
		/** Register public key of current peer **/
		join() {
			
			if( this._joined ) return
			
			const { id: peer, key_public_serial } = this.peer()
			if( !key_public_serial ) return
			
			const auth_id = `${ peer }/${ peer }` as const
			
			const auth_unit = this._unit_all.get( auth_id )
			if( auth_unit ) return
			
			const time = this._clocks[ $hyoo_crowd_unit_group.auth ].tick( peer )
			
			const join_unit = new $hyoo_crowd_unit(
				this.id(), peer,
				peer, peer,
				'0_0', '0_0',
				time, key_public_serial,
				null,
				
			)
			
			this._unit_all.set( auth_id, join_unit )
			
			this._joined = true
			
		}
		
		level_base( next?: $hyoo_crowd_peer_level ) {
			this.level( '0_0', next )
		}
		
		level( peer: $mol_int62_string, next?: $hyoo_crowd_peer_level ) {
			
			if( next ) this.join()
			
			const level_id = `${ this.id() }/${ peer }` as const
			
			const prev = this._unit_all.get( level_id )?.level()
				?? this._unit_all.get( `${ this.id() }/0_0` )?.level()
				?? ( this.id() === peer ? $hyoo_crowd_peer_level.law : $hyoo_crowd_peer_level.get )
			
			if( next === undefined ) return prev
			if( next <= prev ) return prev
			
			const time = this._clocks[ $hyoo_crowd_unit_group.auth ].tick( peer )
			const auth = this.peer()
			
			const level_unit = new $hyoo_crowd_unit(
				this.id(), auth.id,
				this.id(), peer,
				'0_0', '0_0',
				time, next,
				null,
				
			)
			
			this._unit_all.set( level_id, level_unit )
			this.pub.emit()
			
			return next
		}
		
		/** Places data to tree. */
		put(
			head: $mol_int62_string,
			self: $mol_int62_string,
			prev: $mol_int62_string,
			data: unknown,
		) {
			
			this.join()
			
			const old_id = `${ head }/${ self }` as const
			let unit_old = this._unit_all.get( old_id )
			let unit_prev = prev !== '0_0'
				? this._unit_all.get( `${ head }/${ prev }` )!
				: null
			
			const unit_list = this.unit_list( head ) as $hyoo_crowd_unit[]
			if( unit_old ) unit_list.splice( unit_list.indexOf( unit_old ), 1 )
			
			const seat = unit_prev ? unit_list.indexOf( unit_prev ) + 1 : 0
			const next = unit_list[ seat ]?.self ?? '0_0'
			
			const auth = this.peer()
			const time = this._clocks[ $hyoo_crowd_unit_group.data ].tick( auth.id )
			
			const unit_new = new $hyoo_crowd_unit(
				this.id(), auth.id,
				head, self,
				next, prev,
				time, data,
				null,
				
			)
			
			this._unit_all.set( old_id, unit_new )
			
			unit_list.splice( seat, 0, unit_new )
			this._unit_alives.set( head, undefined )
			
			// this.apply([ unit ])
			
			this.pub.emit()
			
			return unit_new
		}
		
		/** Recursively marks unit with its subtree as deleted and wipes data. */
		wipe( unit: $hyoo_crowd_unit ) {
			
			if( unit.data === null ) return unit
			
			for( const kid of this.unit_list( unit.self ) ) {
				this.wipe( kid )
			}
			
			const unit_list = this.unit_list( unit.head )
			const seat = unit_list.indexOf( unit )
			
			const prev = seat > 0 ? unit_list[ seat - 1 ].self : seat < 0 ? unit.prev : '0_0'
			
			return this.put(
				unit.head,
				unit.self,
				prev,
				null,
			)
			
		}
		
		/** Moves Unit after another Prev inside some Head. */
		move(
			unit: $hyoo_crowd_unit,
			head: $mol_int62_string,
			prev: $mol_int62_string,
		) {
			
			this.wipe( unit )
			
			return this.put(
				head,
				unit.self,
				prev,
				unit.data
			)
			
		}
		
		/** Moves Unit at given Seat inside given Head. */
		insert(
			unit: $hyoo_crowd_unit,
			head: $mol_int62_string,
			seat: number,
		) {
			const list = this.unit_list( head )
			const prev = seat ? list[ seat - 1 ].self : '0_0'
			return this.move( unit, head, prev )
		}
		
	}
	
}
