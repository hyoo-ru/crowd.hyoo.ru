namespace $ {
	
	/** Conflict-free Reinterpretable Ordered Washed Data Tree */
	export class $hyoo_crowd_doc extends Object {
		
		constructor(
			readonly id: $mol_int62_pair,
			readonly auth: $hyoo_crowd_peer,
		) {
			super()
		}
		
		destructor() {}
		
		readonly _clock = new $hyoo_crowd_clock
		
		get clock() {
			this.pub.promote()
			return this._clock
		}
		
		readonly pub = new $mol_wire_pub
		
		/** chunk by head + self */
		protected _chunk_all = new $mol_dict<
			$hyoo_crowd_chunk_id,
			$hyoo_crowd_chunk
		>()
		
		chunk(
			head: $mol_int62_pair,
			self: $mol_int62_pair,
		) {
			return this._chunk_all.get({ head, self })
		}
		
		/** chunks by head */
		protected _chunk_lists = new $mol_dict<
			$mol_int62_pair,
			undefined | $hyoo_crowd_chunk[] & { dirty: boolean }
		>()
		
		/** chunks by head without tombstones */
		protected _chunk_alive = new $mol_dict<
			$mol_int62_pair,
			undefined | $hyoo_crowd_chunk[]
		>()
		
		size() {
			return this._chunk_all.size
		}
		
		/** Returns list of all Chunks for Node. */ 
		protected chunk_list(
			head: $mol_int62_pair,
		) {
			
			let chunks = this._chunk_lists.get( head )
			if( !chunks ) this._chunk_lists.set( head, chunks = Object.assign( [], { dirty: false } ) )
			
			return chunks
		}
		
		/** Returns list of alive Chunks for Node. */ 
		chunk_alive(
			head: $mol_int62_pair,
		): readonly $hyoo_crowd_chunk[] {
			
			this.pub.promote()
			
			let chunks = this._chunk_alive.get( head )
			if( !chunks ) {
				
				const all = this.chunk_list( head )
				if( all.dirty ) this.resort( head )
				
				chunks = all.filter( chunk => chunk.data !== null )
				this._chunk_alive.set( head, chunks )
				
			}
			
			return chunks
		}
		
		/** Root Node. */
		root = new $hyoo_crowd_struct( this, { lo: 0, hi: 0 } )
		
		/** Generates new identifier. */
		id_new(): $mol_int62_pair {
			
			for( let i = 0; i < 1000; ++i ) {
				
				const id = $mol_int62_random()
				
				if( id.lo === 0 && id.hi === 0 ) continue // zero reserved for empty
				if( id.lo === this.id.lo && id.hi === this.id.hi ) continue // reserved for rights
				if( this._chunk_lists.has( id ) ) continue // skip already exists
				
				return id
			}
			
			throw new Error( `Can't generate ID after 1000 times` )
			
		}
		
		/** Makes independent clone with defined peer. */
		fork( auth: $hyoo_crowd_peer ) {
			const fork = new $hyoo_crowd_doc( this.id, auth )
			return fork.apply( this.delta() )
		}
		
		/** Makes Delta bettween Clock and now. */
		delta(
			clock = new $hyoo_crowd_clock,
		) {
			
			this.pub.promote()
			
			const delta = [] as $hyoo_crowd_chunk[]
			
			for( const chunk of this._chunk_all.values() ) {
				
				const [ spin, time ] = clock.time( chunk.auth() )
				
				if( chunk.time < time ) continue
				if( chunk.time === time && chunk.spin <= spin ) continue
				
				delta.push( chunk! )
			}
			
			delta.sort( $hyoo_crowd_chunk_compare )
			
			return delta as readonly $hyoo_crowd_chunk[]
		}
		
		toJSON() {
			return this.delta()
		}
		
		resort(
			head: $mol_int62_pair,
		) {
			
			const chunks = this._chunk_lists.get( head )!
			
			const queue = chunks.splice(0).sort(
				( left, right )=> - $hyoo_crowd_chunk_compare( left, right )
			)
			
			for( let cursor = queue.length - 1; cursor >= 0; --cursor ) {
				
				const kid = queue[cursor]
				let index = 0

				if( kid.prev_lo || kid.prev_hi ) {

					let prev = this._chunk_all.get({ head, self: kid.prev() })!
					index = chunks.indexOf( prev ) + 1
					
					if( !index ) {

						index = chunks.length
						
						if( kid.next_lo || kid.next_hi ) {
							
							const next = this._chunk_all.get({ head, self: kid.next() })!
							index = chunks.indexOf( next )
							
							if( index === -1 ) continue

						}

					}

				}
				
				chunks.splice( index, 0, kid )
				queue.splice( cursor, 1 )
				cursor = queue.length

			}
			
			this._chunk_lists.set( head, chunks )
			chunks.dirty = false
			
			return chunks
		}
		
		/** Applies Delta to current state. */
		apply( delta: readonly $hyoo_crowd_chunk[] ) {
			
			for( const next of delta ) {
				
				this._clock.see_peer( next.auth(), next.spin, next.time )
				const chunks = this.chunk_list( next.head() )
				
				let prev = this._chunk_all.get( next.id() )
				if( prev ) {
					if( $hyoo_crowd_chunk_compare( prev, next ) > 0 ) continue
					chunks.splice( chunks.indexOf( prev ), 1, next )
				} else {
					chunks.push( next )
				}
				
				this._chunk_all.set( next.id(), next )
				chunks.dirty = true
				this._chunk_alive.set( next.head(), undefined )
				
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
			
			const auth = this._chunk_all.get({ head: peer, self: peer })
			if( auth ) return
			
			const [ spin, time ] = this._clock.tick( peer )
			
			const chunk = new $hyoo_crowd_chunk(
				
				spin,
				time,
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
				
			)
			
			this._chunk_all.set( { head: peer, self: peer }, chunk )
			
			this._joined = true
			
		}
		
		level( peer: $mol_int62_pair, next?: $hyoo_crowd_peer_level ) {
			
			const exists = this._chunk_all.get({ head: this.id, self: peer })
			const prev = exists?.level() ?? $hyoo_crowd_peer_level.get
			
			if( next === undefined ) return prev
			if( next === prev ) return prev
			
			if( prev > next ) {
				$mol_fail( new Error( 'Revoke unsupported' ) )
			}
			
			this.put(
				this.id,
				peer,
				{ lo: 0, hi: 0 },
				next,
			)
			
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
			
			let chunk_old = this._chunk_all.get({ head, self })
			let chunk_prev = prev ? this._chunk_all.get({ head, self: prev })! : null
			
			const chunk_list = this.chunk_list( head ) as $hyoo_crowd_chunk[]
			if( chunk_old ) chunk_list.splice( chunk_list.indexOf( chunk_old ), 1 )
			
			const seat = chunk_prev ? chunk_list.indexOf( chunk_prev ) + 1 : 0
			const lead = chunk_list[ seat ]
			
			const next = lead?.self() ?? { lo: 0, hi: 0 }
			
			const [ spin, time ] = this._clock.tick( this.auth.id )
			
			const chunk_new = new $hyoo_crowd_chunk(
				
				spin,
				time,
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
				
			)
			
			this._chunk_all.set( { head, self }, chunk_new )
			
			chunk_list.splice( seat, 0, chunk_new )
			this._chunk_alive.set( head, undefined )
			
			// this.apply([ chunk ])
			
			this.pub.emit()
			
			return chunk_new
		}
		
		/** Recursively marks chunk with its subtree as deleted and wipes data. */
		wipe( chunk: $hyoo_crowd_chunk ) {
			
			if( chunk.data === null ) return chunk
			
			for( const kid of this.chunk_list( chunk.self() ) ) {
				this.wipe( kid )
			}
			
			const chunk_list = this.chunk_list( chunk.head() )
			const seat = chunk_list.indexOf( chunk )
			
			const prev = seat > 0 ? chunk_list[ seat - 1 ].self() : seat < 0 ? chunk.prev() : { lo: 0, hi: 0 }
			
			return this.put(
				chunk.head(),
				chunk.self(),
				prev,
				null,
			)
			
		}
		
		/** Moves chunk after another Prev inside some Head. */
		move(
			chunk: $hyoo_crowd_chunk,
			head: $mol_int62_pair,
			prev: $mol_int62_pair,
		) {
			
			this.wipe( chunk )
			
			return this.put(
				head,
				chunk.self(),
				prev,
				chunk.data
			)
			
		}
		
		/** Moves Chunk at given Seat inside given Head. */
		insert(
			chunk: $hyoo_crowd_chunk,
			head: $mol_int62_pair,
			seat: number,
		) {
			const list = this.chunk_list( head )
			const prev = seat ? list[ seat - 1 ].self() : { lo: 0, hi: 0 }
			return this.move( chunk, head, prev )
		}
		
	}
	
}
