namespace $ {
	
	/** Conflict-free Reinterpretable Ordered Washed Data Tree */
	export class $hyoo_crowd_doc extends Object {
		
		constructor(
			
			readonly nest_hi: number,
			readonly nest_lo: number,
			
			readonly peer: $hyoo_crowd_peer,
			
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
		
		protected _chunk_all = new Map<
			`${string}_${string}/${string}_${string}`,
			$hyoo_crowd_chunk
		>()
		
		protected _chunk_lists = new Map<
			`${string}_${string}`,
			undefined | $hyoo_crowd_chunk[] & { dirty: boolean }
		>()
		
		protected _chunk_alive = new Map<
			`${string}_${string}`,
			undefined | $hyoo_crowd_chunk[]
		>()
		
		size() {
			return this._chunk_all.size
		}
		
		/** Returns existen data chunk for unique head+self. */
		chunk(
			head_hi: number,
			head_lo: number,
			self_hi: number,
			self_lo: number,
		) {
			const head = $mol_int62_dump( head_hi, head_lo )
			const self = $mol_int62_dump( self_hi, self_lo )
			return this._chunk_all.get( `${head}/${self}` ) ?? null
		}
		
		/** Returns list of all Chunks for Node. */ 
		protected chunk_list(
			head_hi: number,
			head_lo: number,
		) {
			
			const head = $mol_int62_dump( head_hi, head_lo )
			
			let chunks = this._chunk_lists.get( head )
			if( !chunks ) this._chunk_lists.set( head, chunks = Object.assign( [], { dirty: false } ) )
			
			return chunks
		}
		
		/** Returns list of alive Chunks for Node. */ 
		chunk_alive(
			head_hi: number,
			head_lo: number,
		): readonly $hyoo_crowd_chunk[] {
			
			this.pub.promote()
			
			const head = $mol_int62_dump( head_hi, head_lo )
	
			let chunks = this._chunk_alive.get( head )
			if( !chunks ) {
				
				const all = this.chunk_list( head_hi, head_lo )
				if( all.dirty ) this.resort( head_hi, head_lo )
				
				chunks = all.filter( chunk => chunk.data !== null )
				this._chunk_alive.set( head, chunks )
				
			}
			
			return chunks
		}
		
		/** Root Node. */
		root = new $hyoo_crowd_struct( this, 0, 0 )
		
		/** Generates new identifier. */
		id_new() {
			return $mol_int62_random()
		}
		
		/** Makes independent clone with defined peer. */
		fork( peer: $hyoo_crowd_peer ) {
			const fork = new $hyoo_crowd_doc( this.nest_hi, this.nest_lo, peer )
			return fork.apply( this.delta() )
		}
		
		/** Makes Delta betwteen Clock and now. */
		delta(
			clock = new $hyoo_crowd_clock,
		) {
			
			this.pub.promote()
			
			const delta = [] as $hyoo_crowd_chunk[]
			
			for( const chunk of this._chunk_all.values() ) {
				
				const [ time_hi, time_lo ] = clock.time( $mol_int62_dump( chunk!.peer_hi, chunk!.peer_lo ) )
				if( $mol_int62_compare( time_hi, time_lo, chunk.time_hi, chunk.time_lo ) <= 0 ) continue
				
				delta.push( chunk! )
			}
			
			delta.sort( $hyoo_crowd_chunk_compare )
			
			return delta as readonly $hyoo_crowd_chunk[]
		}
		
		toJSON() {
			return this.delta()
		}
		
		resort(
			head_hi: number,
			head_lo: number,
		) {
			
			const head = $mol_int62_dump( head_hi, head_lo )
			const chunks = this._chunk_lists.get( head )!
			
			const queue = chunks.splice(0).sort( ( left, right )=> {
				return - $hyoo_crowd_chunk_compare( left, right )
			} )
			
			for( let cursor = queue.length - 1; cursor >= 0; --cursor ) {
				
				const kid = queue[cursor]
				let index = 0

				if( kid.prev_hi || kid.prev_lo ) {

					let prev = this.chunk( head_hi, head_lo, kid.prev_hi, kid.prev_lo )!
					index = chunks.indexOf( prev ) + 1
					
					if( !index ) {

						index = chunks.length
						
						if( kid.next_hi || kid.next_lo ) {
							
							const next = this.chunk( head_hi, head_lo, kid.next_hi, kid.next_lo )!
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
				
				const peer = $mol_int62_dump( next.peer_hi, next.peer_lo )
				const head = $mol_int62_dump( next.head_hi, next.head_lo )
				const self = $mol_int62_dump( next.self_hi, next.self_lo )
				
				this._clock.see_peer( peer, next.time_hi, next.time_lo )
				const chunks = this.chunk_list( next.head_hi, next.head_lo )
				const guid = `${head}/${self}` as const
				
				let prev = this._chunk_all.get( guid )
				if( prev ) {
					if( $hyoo_crowd_chunk_compare( prev, next ) > 0 ) continue
					chunks.splice( chunks.indexOf( prev ), 1, next )
				} else {
					chunks.push( next )
				}
				
				this._chunk_all.set( guid, next )
				chunks.dirty = true
				this._chunk_alive.set( head, undefined )
				
			}
			
			this.pub.emit()
			
			return this
		}
		
		/** Register public key of current peer **/
		auth() {
			
			const { hi, lo, public_serial } = this.peer
			if( !public_serial ) return
			
			const peer = $mol_int62_dump( hi, lo )
			const guid = `${peer}/${peer}` as const
			
			const auth = this._chunk_all.get( guid )
			if( auth ) return
			
			const [ time_hi, time_lo ] = this._clock.tick( peer )
			
			const chunk = { 
					
				nest_hi: this.nest_hi,
				nest_lo: this.nest_lo,
	
				head_hi: hi,
				head_lo: lo,
	
				self_hi: hi,
				self_lo: lo,
	
				prev_hi: 0,
				prev_lo: 0,
	
				next_hi: 0,
				next_lo: 0,
	
				peer_hi: hi,
				peer_lo: lo,
	
				time_hi,
				time_lo,
				
				data: public_serial,
				
			} as $hyoo_crowd_chunk
			
			this._chunk_all.set( guid, chunk )
			
		}
		
		/** Places data to tree. */
		put(
			head_hi: number,
			head_lo: number,
			self_hi: number,
			self_lo: number,
			prev_hi: number,
			prev_lo: number,
			data: unknown,
		) {
			
			this.auth()
			
			let chunk_old = this.chunk( head_hi, head_lo, self_hi, self_lo )
			let chunk_prev = ( prev_hi || prev_lo ) ? this.chunk( head_hi, head_lo, prev_hi, prev_lo )! : null
			
			const chunk_list = this.chunk_list( head_hi, head_lo ) as $hyoo_crowd_chunk[]
			
			if( chunk_old ) {
				chunk_list.splice( chunk_list.indexOf( chunk_old ), 1 )
			}
			
			const seat = chunk_prev ? chunk_list.indexOf( chunk_prev ) + 1 : 0
			const lead = chunk_list[ seat ]
			
			const next_hi = lead?.self_hi ?? 0
			const next_lo = lead?.self_lo ?? 0
			
			const peer = $mol_int62_dump( this.peer.hi, this.peer.lo )
			const head = $mol_int62_dump( head_hi, head_lo )
			const self = $mol_int62_dump( self_hi, self_lo )
			
			const [ time_hi, time_lo ] = this._clock.tick( peer )
			
			const chunk_new: $hyoo_crowd_chunk = {
				nest_hi: this.nest_hi,
				nest_lo: this.nest_lo,
				head_hi,
				head_lo,
				self_hi,
				self_lo,
				prev_hi,
				prev_lo,
				next_hi,
				next_lo,
				peer_hi: this.peer.hi,
				peer_lo: this.peer.lo,
				time_hi,
				time_lo,
				data,
			}
			this._chunk_all.set( `${head}/${self}`, chunk_new )
			
			chunk_list.splice( seat, 0, chunk_new )
			this._chunk_alive.set( head, undefined )
			
			// this.apply([ chunk ])
			
			this.pub.emit()
			
			return chunk_new
		}
		
		/** Recursively marks chunk with its subtree as deleted and wipes data. */
		wipe( chunk: $hyoo_crowd_chunk ) {
			
			if( chunk.data === null ) return chunk
			
			for( const kid of this.chunk_list( chunk.self_hi, chunk.self_lo ) ) {
				this.wipe( kid )
			}
			
			const chunk_list = this.chunk_list( chunk.head_hi, chunk.head_lo )
			const seat = chunk_list.indexOf( chunk )
			
			const prev_hi = seat > 0 ? chunk_list[ seat - 1 ].self_hi : seat < 0 ? chunk.prev_hi : 0
			const prev_lo = seat > 0 ? chunk_list[ seat - 1 ].self_lo : seat < 0 ? chunk.prev_lo : 0
			
			return this.put(
				chunk.head_hi,
				chunk.head_lo,
				chunk.self_hi,
				chunk.self_lo,
				prev_hi,
				prev_lo,
				null,
			)
			
		}
		
		/** Moves chunk after another Prev inside some Head. */
		move(
			chunk: $hyoo_crowd_chunk,
			head_hi: number,
			head_lo: number,
			prev_hi: number,
			prev_lo: number,
		) {
			
			this.wipe( chunk )
			
			return this.put(
				head_hi,
				head_lo,
				chunk.self_hi,
				chunk.self_lo,
				prev_hi,
				prev_lo,
				chunk.data
			)
			
		}
		
		/** Moves Chunk at given Seat inside given Head. */
		insert(
			chunk: $hyoo_crowd_chunk,
			head_hi: number,
			head_lo: number,
			seat: number,
		) {
			const list = this.chunk_list( head_hi, head_lo )
			const prev = list[ seat - 1 ]
			const [ prev_hi, prev_lo ] = seat ? [ prev.self_hi, prev.self_lo ] : [ 0, 0 ]
			return this.move( chunk, head_hi, head_lo, prev_hi, prev_lo )
		}
		
	}
	
}
