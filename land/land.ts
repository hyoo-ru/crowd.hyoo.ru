namespace $ {
	
	/** Conflict-free Reinterpretable Ordered Washed Data Tree */
	export class $hyoo_crowd_land extends Object {
		
		constructor(
			readonly id: $mol_int62_pair,
			readonly auth: $hyoo_crowd_peer,
		) {
			super()
		}
		
		destructor() {}
		
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
		protected _unit_all = new $mol_dict<
			$hyoo_crowd_unit_id,
			$hyoo_crowd_unit
		>()
		
		unit(
			head: $mol_int62_pair,
			self: $mol_int62_pair,
		) {
			return this._unit_all.get({ head, self })
		}
		
		/** units by head */
		protected _unit_lists = new $mol_dict<
			$mol_int62_pair,
			undefined | $hyoo_crowd_unit[] & { dirty: boolean }
		>()
		
		/** Units by Head without tombstones */
		protected _unit_alives = new $mol_dict<
			$mol_int62_pair,
			undefined | $hyoo_crowd_unit[]
		>()
		
		size() {
			return this._unit_all.size
		}
		
		/** Returns list of all Units for Node. */ 
		protected unit_list(
			head: $mol_int62_pair,
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
		root = new $hyoo_crowd_struct( this, { lo: 0, hi: 0 } )
		
		/** Generates new identifier. */
		id_new(): $mol_int62_pair {
			
			for( let i = 0; i < 1000; ++i ) {
				
				const id = $mol_int62_random()
				
				if( id.lo === 0 && id.hi === 0 ) continue // zero reserved for empty
				if( id.lo === this.id.lo && id.hi === this.id.hi ) continue // reserved for rights
				if( this._unit_lists.has( id ) ) continue // skip already exists
				
				return id
			}
			
			throw new Error( `Can't generate ID after 1000 times` )
			
		}
		
		/** Makes independent clone with defined peer. */
		fork( auth: $hyoo_crowd_peer ) {
			const fork = new $hyoo_crowd_land( this.id, auth )
			return fork.apply( this.delta() )
		}
		
		/** Makes Delta bettween Clock and now. */
		delta(
			clocks = [ new $hyoo_crowd_clock, new $hyoo_crowd_clock ] as const
		) {
			
			this.pub.promote()
			
			const delta = [] as $hyoo_crowd_unit[]
			
			for( const unit of this._unit_all.values() ) {
				
				const [ spin, time ] = clocks[ unit.group() ].time( unit.auth() )
				
				if( unit.time < time ) continue
				if( unit.time === time && unit.spin <= spin ) continue
				
				delta.push( unit! )
			}
			
			delta.sort( $hyoo_crowd_unit_compare )
			
			return delta as readonly $hyoo_crowd_unit[]
		}
		
		toJSON() {
			return this.delta()
		}
		
		resort(
			head: $mol_int62_pair,
		) {
			
			const kids = this._unit_lists.get( head )!
			
			const queue = kids.splice(0).sort(
				( left, right )=> - $hyoo_crowd_unit_compare( left, right )
			)
			
			for( let cursor = queue.length - 1; cursor >= 0; --cursor ) {
				
				const kid = queue[cursor]
				let index = 0

				if( kid.prev_lo || kid.prev_hi ) {

					let prev = this._unit_all.get({ head, self: kid.prev() })!
					index = kids.indexOf( prev ) + 1
					
					if( !index ) {

						index = kids.length
						
						if( kid.next_lo || kid.next_hi ) {
							
							const next = this._unit_all.get({ head, self: kid.next() })!
							index = kids.indexOf( next )
							
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
				
				this._clocks[ next.group() ].see_peer( next.auth(), next.spin, next.time )
				const kids = this.unit_list( next.head() )
				
				let prev = this._unit_all.get( next.id() )
				if( prev ) {
					if( $hyoo_crowd_unit_compare( prev, next ) > 0 ) continue
					kids.splice( kids.indexOf( prev ), 1, next )
				} else {
					kids.push( next )
				}
				
				this._unit_all.set( next.id(), next )
				kids.dirty = true
				this._unit_alives.set( next.head(), undefined )
				
			}
			
			this.pub.emit()
			
			return this
		}
		
		_joined = false
		
		/** Register public key of current peer **/
		join() {
			
			if( this._joined ) return
			
			const { id: peer, key_public_serial } = this.auth
			if( !key_public_serial ) return
			
			const auth = this._unit_all.get({ head: peer, self: peer })
			if( auth ) return
			
			const [ spin, time ] = this._clocks[ $hyoo_crowd_unit_group.auth ].tick( peer )
			
			const join_unit = new $hyoo_crowd_unit(
				
				time,
				spin,
				this.id.lo,
				this.id.hi,
				
				peer.lo,
				peer.hi,
				peer.lo,
				peer.hi,
				
				0,
				0,
				0,
				0,
				
				peer.lo,
				peer.hi,
				
				key_public_serial,
				null,
				
			)
			
			this._unit_all.set( { head: peer, self: peer }, join_unit )
			
			this._joined = true
			
		}
		
		level_base( next?: $hyoo_crowd_peer_level ) {
			this.level( { lo: 0, hi: 0 }, next )
		}
		
		level( peer: $mol_int62_pair, next?: $hyoo_crowd_peer_level ) {
			
			this.join()
			
			const exists = this._unit_all.get({ head: this.id, self: peer })
			const prev = exists?.level() ?? $hyoo_crowd_peer_level.get
			
			if( next === undefined ) return prev
			if( next <= prev ) return prev
			
			const [ spin, time ] = this._clocks[ $hyoo_crowd_unit_group.auth ].tick( peer )
			
			const join_unit = new $hyoo_crowd_unit(
				
				time,
				spin,
				this.id.lo,
				this.id.hi,
				
				this.auth.id.lo,
				this.auth.id.hi,
				this.id.lo,
				this.id.hi,
				
				0,
				0,
				0,
				0,
				
				peer.lo,
				peer.hi,
				
				next,
				null,
				
			)
			
			this._unit_all.set( { head: this.id, self: peer }, join_unit )
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
			
			let unit_old = this._unit_all.get({ head, self })
			let unit_prev = prev ? this._unit_all.get({ head, self: prev })! : null
			
			const unit_list = this.unit_list( head ) as $hyoo_crowd_unit[]
			if( unit_old ) unit_list.splice( unit_list.indexOf( unit_old ), 1 )
			
			const seat = unit_prev ? unit_list.indexOf( unit_prev ) + 1 : 0
			const lead = unit_list[ seat ]
			
			const next = lead?.self() ?? { lo: 0, hi: 0 }
			
			const [ spin, time ] = this._clocks[ $hyoo_crowd_unit_group.data ].tick( this.auth.id )
			
			const unit_new = new $hyoo_crowd_unit(
				
				time,
				spin,
				this.id.lo,
				this.id.hi,
				
				this.auth.id.lo,
				this.auth.id.hi,
				head.lo,
				head.hi,
				
				next.lo,
				next.hi,
				prev.lo,
				prev.hi,
				
				self.lo,
				self.hi,
				
				data,
				null,
				
			)
			
			this._unit_all.set( { head, self }, unit_new )
			
			unit_list.splice( seat, 0, unit_new )
			this._unit_alives.set( head, undefined )
			
			// this.apply([ unit ])
			
			this.pub.emit()
			
			return unit_new
		}
		
		/** Recursively marks unit with its subtree as deleted and wipes data. */
		wipe( unit: $hyoo_crowd_unit ) {
			
			if( unit.data === null ) return unit
			
			for( const kid of this.unit_list( unit.self() ) ) {
				this.wipe( kid )
			}
			
			const unit_list = this.unit_list( unit.head() )
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
			const list = this.unit_list( head )
			const prev = seat ? list[ seat - 1 ].self() : { lo: 0, hi: 0 }
			return this.move( unit, head, prev )
		}
		
	}
	
}
