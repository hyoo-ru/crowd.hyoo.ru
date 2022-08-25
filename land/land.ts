namespace $ {
	
	/** Conflict-free Reinterpretable Ordered Washed Data Tree */
	export class $hyoo_crowd_land extends $mol_object {
		
		@ $mol_memo.method
		id(): $mol_int62_pair {
			return $mol_int62_random()
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
		protected _unit_all = new Map<
			$hyoo_crowd_unit_id,
			$hyoo_crowd_unit
		>()
		
		unit(
			head: $mol_int62_pair,
			self: $mol_int62_pair,
		) {
			return this._unit_all.get(`${ $mol_int62_to_string( head )}/${ $mol_int62_to_string( self ) }`)
		}
		
		/** units by head */
		protected _unit_lists = new Map<
			$mol_int62_string,
			undefined | $hyoo_crowd_unit[] & { dirty: boolean }
		>()
		
		/** Units by Head without tombstones */
		protected _unit_alives = new Map<
			$mol_int62_string,
			undefined | $hyoo_crowd_unit[]
		>()
		
		size() {
			return this._unit_all.size
		}
		
		/** Returns list of all Units for Node. */ 
		protected unit_list(
			head: $mol_int62_string,
		) {
			
			let kids = this._unit_lists.get( head )
			if( !kids ) this._unit_lists.set( head, kids = Object.assign( [], { dirty: false } ) )
			
			return kids
		}
		
		/** Returns list of alive Units for Node. */ 
		unit_alives(
			head: $mol_int62_pair,
		): readonly $hyoo_crowd_unit[] {
			
			this.pub.promote()
			
			const head_id = $mol_int62_to_string( head )
			
			let kids = this._unit_alives.get( head_id )
			if( !kids ) {
				
				const all = this.unit_list( head_id )
				if( all.dirty ) this.resort( head )
				
				kids = all.filter( kid => kid.data !== null )
				this._unit_alives.set( head_id, kids )
				
			}
			
			return kids
		}
		
		/** Root Node. */
		chief = new $hyoo_crowd_struct( this, { lo: 0, hi: 0 } )
		
		/** Generates new identifier. */
		id_new(): $mol_int62_pair {
			
			for( let i = 0; i < 1000; ++i ) {
				
				const id = $mol_int62_random()
				
				if( id.lo === 0 && id.hi === 0 ) continue // zero reserved for empty
				if( id.lo === this.id().lo && id.hi === this.id().hi ) continue // reserved for rights
				if( this._unit_lists.has( $mol_int62_to_string( id ) ) ) continue // skip already exists
				
				return id
			}
			
			throw new Error( `Can't generate ID after 1000 times` )
			
		}
		
		/** Makes independent clone with defined peer. */
		fork( auth: $hyoo_crowd_peer ) {
			
			const fork = $hyoo_crowd_land.make({
				id: ()=> this.id(),
				peer: ()=> this.peer(),
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
				
				const time = clocks[ unit.group() ].time( $mol_int62_to_string( unit.auth() ) )
				if( unit.time <= time ) continue
				
				delta.push( unit! )
			}
			
			delta.sort( $hyoo_crowd_unit_compare )
			
			return delta as readonly $hyoo_crowd_unit[]
		}
		
		resort(
			head: $mol_int62_pair,
		) {
			
			const head_id = $mol_int62_to_string( head )
			const kids = this._unit_lists.get( head_id )!
			
			const queue = kids.splice(0).sort(
				( left, right )=> - $hyoo_crowd_unit_compare( left, right )
			)
			
			const locate = ( lo: number, hi: number )=> {
				
				for( let i = kids.length - 1; i >= 0; --i ) {
					
					const kid = kids[i]
					
					if( kid.self_lo !== lo ) continue
					if( kid.self_hi !== hi ) continue
					
					return i
				}
				
				return -1
			}
			
			for( let cursor = queue.length - 1; cursor >= 0; --cursor ) {
				
				const kid = queue[cursor]
				let index = 0

				if( kid.prev_lo || kid.prev_hi ) {

					index = locate( kid.prev_lo, kid.prev_hi ) + 1
					
					if( !index ) {

						index = kids.length
						
						if( kid.next_lo || kid.next_hi ) {
							
							index = locate( kid.next_lo, kid.next_hi )
							
							if( index === -1 ) continue

						}

					}

				}
				
				kids.splice( index, 0, kid )
				queue.splice( cursor, 1 )
				cursor = queue.length

			}
			
			this._unit_lists.set( head_id, kids )
			kids.dirty = false
			
			return kids
		}
		
		/** Applies Delta to current state. */
		apply( delta: readonly $hyoo_crowd_unit[] ) {
			
			for( const next of delta ) {
				
				const head_id = $mol_int62_to_string( next.head() )
				
				this._clocks[ next.group() ].see_peer( $mol_int62_to_string( next.auth() ), next.time )
				const kids = this.unit_list( head_id )
				const next_id = next.id()
				
				let prev = this._unit_all.get( next_id )
				if( prev ) {
					if( $hyoo_crowd_unit_compare( prev, next ) > 0 ) continue
					kids.splice( kids.indexOf( prev ), 1, next )
				} else {
					kids.push( next )
				}
				
				this._unit_all.set( next_id, next )
				kids.dirty = true
				this._unit_alives.set( head_id, undefined )
				
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
			
			const peer_id = $mol_int62_to_string( peer )
			const auth_id = `${ peer_id }/${ peer_id }` as const
			
			const auth = this._unit_all.get( auth_id )
			if( auth ) return
			
			const time = this._clocks[ $hyoo_crowd_unit_group.auth ].tick( peer_id )
			
			const join_unit = new $hyoo_crowd_unit(
				
				this.id().lo,
				this.id().hi,
				peer.lo,
				peer.hi,
				
				peer.lo,
				peer.hi,
				peer.lo,
				peer.hi,
				
				0,
				0,
				0,
				0,
				
				time,
				key_public_serial,
				null,
				
			)
			
			this._unit_all.set( auth_id, join_unit )
			
			this._joined = true
			
		}
		
		level_base( next?: $hyoo_crowd_peer_level ) {
			this.level( { lo: 0, hi: 0 }, next )
		}
		
		level( peer: $mol_int62_pair, next?: $hyoo_crowd_peer_level ) {
			
			this.join()
			
			const peer_id = $mol_int62_to_string( peer )
			const level_id = `${ $mol_int62_to_string( this.id() ) }/${ peer_id }` as const
			
			const exists = this._unit_all.get( level_id )
			const prev = exists?.level() ?? $hyoo_crowd_peer_level.get
			
			if( next === undefined ) return prev
			if( next <= prev ) return prev
			
			const time = this._clocks[ $hyoo_crowd_unit_group.auth ].tick( peer_id )
			const auth = this.peer()
			
			const level_unit = new $hyoo_crowd_unit(
				
				this.id().lo,
				this.id().hi,
				auth.id.lo,
				auth.id.hi,
				
				this.id().lo,
				this.id().hi,
				peer.lo,
				peer.hi,
				
				0,
				0,
				0,
				0,
				
				time,
				next,
				null,
				
			)
			
			this._unit_all.set( level_id, level_unit )
			this.pub.emit()
			
			return next
		}
		
		/** Places data to tree. */
		put(
			head: $mol_int62_pair,
			self: $mol_int62_pair,
			prev: $mol_int62_pair,
			data: unknown,
		) {
			
			this.join()
			
			const head_id = $mol_int62_to_string( head )
			const old_id = `${ head_id }/${ $mol_int62_to_string( self ) }` as const
			const prev_id = `${ head_id }/${ $mol_int62_to_string( prev ) }` as const
			
			let unit_old = this._unit_all.get( old_id )
			let unit_prev = prev ? this._unit_all.get( prev_id )! : null
			
			const unit_list = this.unit_list( head_id ) as $hyoo_crowd_unit[]
			if( unit_old ) unit_list.splice( unit_list.indexOf( unit_old ), 1 )
			
			const seat = unit_prev ? unit_list.indexOf( unit_prev ) + 1 : 0
			const lead = unit_list[ seat ]
			
			const next = lead?.self() ?? { lo: 0, hi: 0 }
			
			const auth = this.peer()
			const time = this._clocks[ $hyoo_crowd_unit_group.data ].tick( $mol_int62_to_string( auth.id ) )
			
			const unit_new = new $hyoo_crowd_unit(
				
				this.id().lo,
				this.id().hi,
				auth.id.lo,
				auth.id.hi,
				
				head.lo,
				head.hi,
				self.lo,
				self.hi,
				
				next.lo,
				next.hi,
				prev.lo,
				prev.hi,
				
				time,
				data,
				null,
				
			)
			
			this._unit_all.set( old_id, unit_new )
			
			unit_list.splice( seat, 0, unit_new )
			this._unit_alives.set( head_id, undefined )
			
			// this.apply([ unit ])
			
			this.pub.emit()
			
			return unit_new
		}
		
		/** Recursively marks unit with its subtree as deleted and wipes data. */
		wipe( unit: $hyoo_crowd_unit ) {
			
			if( unit.data === null ) return unit
			
			for( const kid of this.unit_list( $mol_int62_to_string( unit.self() ) ) ) {
				this.wipe( kid )
			}
			
			const unit_list = this.unit_list( $mol_int62_to_string( unit.head() ) )
			const seat = unit_list.indexOf( unit )
			
			const prev = seat > 0 ? unit_list[ seat - 1 ].self() : seat < 0 ? unit.prev() : { lo: 0, hi: 0 }
			
			return this.put(
				unit.head(),
				unit.self(),
				prev,
				null,
			)
			
		}
		
		/** Moves Unit after another Prev inside some Head. */
		move(
			unit: $hyoo_crowd_unit,
			head: $mol_int62_pair,
			prev: $mol_int62_pair,
		) {
			
			this.wipe( unit )
			
			return this.put(
				head,
				unit.self(),
				prev,
				unit.data
			)
			
		}
		
		/** Moves Unit at given Seat inside given Head. */
		insert(
			unit: $hyoo_crowd_unit,
			head: $mol_int62_pair,
			seat: number,
		) {
			const list = this.unit_list( $mol_int62_to_string( head ) )
			const prev = seat ? list[ seat - 1 ].self() : { lo: 0, hi: 0 }
			return this.move( unit, head, prev )
		}
		
	}
	
}
