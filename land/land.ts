namespace $ {
	
	/** Conflict-free Reinterpretable Ordered Washed Data Tree */
	export class $hyoo_crowd_land extends $mol_object {
		
		@ $mol_memo.method
		id() {
			return $mol_int62_to_string( $mol_int62_random() )
		}
		
		toJSON() {
			return this.id()
		}
		
		peer() {
			return this.world()?.peer!
		}
		
		peer_id() {
			return this.peer()?.id ?? '0_0'
		}
		
		world(): $hyoo_crowd_world | null {
			return null
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
		
		get clocks_bin() {
			return new Uint8Array( $hyoo_crowd_clock_bin.from( this.id(), this._clocks, this._unit_all.size ).buffer )
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
			return this._unit_all.get(`${ head }!${ self }`)
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
		
		/** Node by id and type. */
		node< Node extends typeof $hyoo_crowd_node >( head: $mol_int62_string, Node: Node ) {
			return new Node( this, head ) as InstanceType< Node >
		}
		
		/** Root Node. */
		chief = this.node( '0_0', $hyoo_crowd_struct )
		
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
			if( !kids.dirty ) return kids
			
			if( kids.length < 2 ) {
				kids.dirty = true
				return kids
			}
			
			const queue = kids.splice(0).sort(
				( left, right )=> - $hyoo_crowd_unit_compare( left, right )
			)
			
			const locate = ( self: $mol_int62_string )=> {
				
				for( let i = kids.length - 1; i >= 0; --i ) {
					if( kids[i].self === self ) return i
				}
				
				return -1
			}
			
			while( queue.length ) {
				
				kids.push( queue.pop()! )
				
				for( let cursor = queue.length - 1; cursor >= 0; --cursor ) {
					
					const kid = queue[cursor]
					let index = 0

					if( kid.prev !== '0_0' ) {
						index = locate( kid.prev ) + 1
						if( !index ) continue
					}
					
					while( kids[ index ] && ( $hyoo_crowd_unit_compare( kids[ index ], kid ) > 0 ) ) ++ index
					
					const exists = locate( kid.self )
					if( index === exists ) {
						if( cursor === queue.length - 1 ) queue.pop()
						continue
					}

					if( exists >= 0 ) {
						kids.splice( exists, 1 )
						if( exists < index ) -- index
					}
					
					kids.splice( index, 0, kid )
					
					if( cursor === queue.length - 1 ) queue.pop()
					cursor = queue.length

				}
				
			}
			
			kids.dirty = false
			
			return kids
		}
		
		/** Applies Delta to current state. */
		apply( delta: readonly $hyoo_crowd_unit[] ) {
			
			for( const next of delta ) {
				
				this._clocks[ next.group() ].see_peer( next.auth, next.time )
				const kids = this.unit_list( next.head )
				const next_id = `${ next.head }!${ next.self }` as const
				
				let prev = this._unit_all.get( next_id )
				if( prev ) {
					if( $hyoo_crowd_unit_compare( prev, next ) > 0 ) continue
					kids[ kids.indexOf( prev ) ] = next
				} else {
					kids.push( next )
				}
				
				this._unit_all.set( next_id, next )
				if( kids.length > 1 ) kids.dirty = true
				this._unit_alives.set( next.head, undefined )
				
			}
			
			this.pub.emit()
			
			return this
		}
		
		_joined = false
		
		/** Register public key of current peer **/
		join() {
			
			if( this._joined ) return
			
			const auth = this.peer()
			if( !auth ) return
			if( !auth.key_public_serial ) return
			
			const auth_id = `${ auth.id }!${ auth.id }` as const
			
			const auth_unit = this._unit_all.get( auth_id )
			if( auth_unit?.data ) return this._joined = true
			
			const time = this._clocks[ $hyoo_crowd_unit_group.auth ].tick( auth.id )
			
			const join_unit = new $hyoo_crowd_unit(
				this.id(), auth.id,
				auth.id, auth.id,
				'0_0', '0_0',
				time, auth.key_public_serial,
				null,
			)
			
			this._unit_all.set( auth_id, join_unit )
			
			this._joined = true
			this.pub.emit()
			
		}
		
		/** Unregister public key of current peer **/
		leave() {
			
			const auth = this.peer()
			if( !auth ) return
			if( !auth.key_public_serial ) return
			
			const auth_id = `${ auth.id }!${ auth.id }` as const
			
			const auth_unit = this._unit_all.get( auth_id )
			if( !auth_unit || !auth_unit.data ) return this._joined = false
			
			const time = this._clocks[ $hyoo_crowd_unit_group.auth ].tick( auth.id )
			
			const join_unit = new $hyoo_crowd_unit(
				this.id(), auth.id,
				auth.id, auth.id,
				'0_0', '0_0',
				time, null,
				null,
			)
			
			this._unit_all.set( auth_id, join_unit )
			
			this._joined = false
			this.pub.emit()
			
		}
		
		allowed_add( peer = this.peer().id ) {
			return this.level( peer ) >= $hyoo_crowd_peer_level.add
		}
		allowed_mod( peer = this.peer().id ) {
			return this.level( peer ) >= $hyoo_crowd_peer_level.mod
		}
		allowed_law( peer = this.peer().id ) {
			return this.level( peer ) >= $hyoo_crowd_peer_level.law
		}
		
		level_base( next?: $hyoo_crowd_peer_level ) {
			this.level( '0_0', next )
		}
		
		/** Access level for peer. Use empty string for current peer. **/
		level( peer: $mol_int62_string | '', next?: $hyoo_crowd_peer_level ) {
			
			if( next ) this.join()
			else this.pub.promote()
			
			if( !peer ) peer = this.peer_id()
			
			const level_id = `${ this.id() }!${ peer }` as const
			
			const prev = this._unit_all.get( level_id )?.level()
				?? this._unit_all.get( `${ this.id() }!0_0` )?.level()
				?? ( this.id() === peer ? $hyoo_crowd_peer_level.law : $hyoo_crowd_peer_level.get )
			
			if( next === undefined ) return prev
			if( next <= prev ) return prev
			if( !this.allowed_law() ) return prev
			
			const time = this._clocks[ $hyoo_crowd_unit_group.auth ].tick( peer )
			const auth = this.peer_id()
			
			const level_unit = new $hyoo_crowd_unit(
				this.id(), auth,
				this.id(), peer,
				'0_0', '0_0',
				time, next,
				null,
				
			)
			
			this._unit_all.set( level_id, level_unit )
			this.pub.emit()
			
			return next
		}
		
		grabbed() {
			if( this.id() === this.peer_id() ) return true
			this.pub.promote()
			return this._unit_all.size > 0
		}
		
		/** All peers who have special rights to write o land. */
		peers() {
			
			this.pub.promote()
			
			const lords = [] as $mol_int62_string[]
			
			for( const unit of this._unit_all.values() ) {
				
				switch( unit.kind() ) {
					case $hyoo_crowd_unit_kind.data: continue
					case $hyoo_crowd_unit_kind.join: continue
					default: lords.push( unit.self )
				}
				
			}
			
			return lords as Readonly< typeof lords >
		}
		
		/** All peers who joined to land except king. */
		residents() {
			
			this.pub.promote()
			
			const lords = [] as $mol_int62_string[]
			
			for( const unit of this._unit_all.values() ) {
				
				if( unit.data === null ) continue
				if( unit.kind() !== $hyoo_crowd_unit_kind.join ) continue
				
				lords.push( unit.self )
				
			}
			
			return lords as Readonly< typeof lords >
		}
		
		/** All peers who have alive data inside land. */
		authors() {
			
			this.pub.promote()
			
			const authors = new Set<$mol_int62_string>()
			
			for( const unit of this._unit_all.values() ) {
				if( unit.kind() !== $hyoo_crowd_unit_kind.data ) continue
				if( unit.data === null ) continue
				authors.add( unit.auth )
			}
			
			return authors
		}
		
		steal_rights( donor: $hyoo_crowd_land ) {
			if( !this.allowed_law() ) return
			for( const peer of donor.peers() ) {
				this.level( peer, donor.level( peer ) )
			}
		}
		
		first_stamp() {
			this.pub.promote()
			const grab_unit = this._unit_all.get( `${ this.id() }!${ this.id() }` )
			return ( grab_unit && $hyoo_crowd_time_stamp( grab_unit.time ) ) ?? null
		}
		
		last_stamp() {
			this.pub.promote()
			return this.clock_data.last_stamp()
		}
		
		selection( peer: $mol_int62_string ) {
			return this.world()!.land_sync( peer ).chief.sub( '$hyoo_crowd_land..selection', $hyoo_crowd_reg )
		}
		
		/** Places data to tree. */
		put(
			head: $mol_int62_string,
			self: $mol_int62_string,
			prev: $mol_int62_string,
			data: unknown,
		) {
			
			this.join()
			
			const old_id = `${ head }!${ self }` as const
			let unit_old = this._unit_all.get( old_id )
			let unit_prev = prev !== '0_0'
				? this._unit_all.get( `${ head }!${ prev }` )!
				: null
			
			const unit_list = this.unit_list( head )
			if( unit_old ) unit_list.splice( unit_list.indexOf( unit_old ), 1 )
			
			const seat = unit_prev ? unit_list.indexOf( unit_prev ) + 1 : 0
			const next = unit_list[ seat ]?.self ?? '0_0'
			
			const auth = this.peer_id()
			const time = this._clocks[ $hyoo_crowd_unit_group.data ].tick( auth )
			
			const unit_new = new $hyoo_crowd_unit(
				this.id(), auth,
				head, self,
				next, prev,
				time, data,
				null,
				
			)
			
			this._unit_all.set( old_id, unit_new )
			
			unit_list.splice( seat, 0, unit_new )
			// unit_list.dirty = true
			this._unit_alives.set( head, undefined )
			
			// this.apply([ unit_new ])
			
			this.pub.emit()
			
			return unit_new
		}
		
		/** Marks unit as deleted and wipes its data. */
		wipe( unit: $hyoo_crowd_unit ) {
			
			if( unit.data === null ) return unit
			
			// for( const kid of this.unit_list( unit.self ) ) {
			// 	this.wipe( kid )
			// }
			
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
			
			const unit_list = this.unit_list( unit.head )
			
			const seat = unit_list.indexOf( unit )
			const next = unit_list[ seat + 1 ]
			
			this.wipe( unit )
			
			if( next ) this.put(
				next.head,
				next.self,
				unit_list[ unit_list.indexOf( next ) - 2 ]?.self ?? '0_0',
				next.data,
			)
			
			this.put(
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
		
		[ $mol_dev_format_head ]() {
			return $mol_dev_format_native( this )
		}
		
	}
	
}
