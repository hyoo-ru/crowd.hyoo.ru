namespace $ {
	
	/** Maximum clock desynchronization in ms. Chunks from far future are ignored. */
	const desync = 60 * 60 * 1000
	
	/** Conflict-free Reinterpretable Ordered Washed Data Tree */
	export class $hyoo_crowd_doc {
		
		constructor(
			readonly peer = 0
		) {
			if( !peer ) this.peer = this.id_new()
		}
		
		destructor() {}
		
		readonly _clock = new $hyoo_crowd_clock
		
		get clock() {
			this.pub.promote()
			return this._clock
		}
		
		readonly pub = new $mol_wire_pub
		
		protected _chunk_all = new Map<
			`${ number }/${ number }`,
			$hyoo_crowd_chunk
		>()
		
		protected _chunk_lists = new Map<
			$hyoo_crowd_chunk['self'],
			$hyoo_crowd_chunk[] & { dirty: boolean }
		>()
		
		protected _chunk_alive = new Map<
			$hyoo_crowd_chunk['self'],
			undefined | $hyoo_crowd_chunk[]
		>()
		
		size() {
			return this._chunk_all.size
		}
		
		/** Returns existen data chunk for unique head+self. */
		chunk(
			head: $hyoo_crowd_chunk['head'],
			self: $hyoo_crowd_chunk['self'],
		) {
			return this._chunk_all.get( `${ head }/${ self }` ) ?? null
		}
		
		/** Returns list of all Chunks for Node. */ 
		protected chunk_list(
			head: $hyoo_crowd_chunk['head']
		) {
			
			let chunks = this._chunk_lists.get( head )
			if( !chunks ) this._chunk_lists.set( head, chunks = Object.assign( [], { dirty: false } ) )
			
			return chunks
		}
		
		/** Returns list of alive Chunks for Node. */ 
		chunk_alive(
			head: $hyoo_crowd_chunk['head']
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
		root = new $hyoo_crowd_struct( this, 0 )
		
		/** Generates new 6B identifier. */
		id_new() {
			return 1 + Math.floor( Math.random() * ( 2 ** ( 6 * 8 ) - 2 ) )
		}
		
		/** Makes independent clone with defined peer. */
		fork( peer: number ) {
			return new $hyoo_crowd_doc( peer ).apply( this.delta() )
		}
		
		/** Makes Delta betwteen Clock and now. */
		delta(
			clock = new $hyoo_crowd_clock,
		) {
			
			this.pub.promote()
			
			const delta = [] as $hyoo_crowd_chunk[]
			
			for( const chunk of this._chunk_all.values() ) {
				
				const time = clock.get( chunk!.peer )
				if( time && chunk!.time <= time ) continue
				
				delta.push( chunk! )
			}
			
			delta.sort( $hyoo_crowd_chunk_compare )
			
			return delta as readonly $hyoo_crowd_chunk[]
		}
		
		toJSON() {
			return this.delta()
		}
		
		resort(
			head: $hyoo_crowd_chunk['head'],
		) {
			
			const chunks = this._chunk_lists.get( head )!
			
			const queue = chunks.splice(0).sort( ( left, right )=> {
				return - $hyoo_crowd_chunk_compare( left, right )
			} )
			
			for( let cursor = queue.length - 1; cursor >= 0; --cursor ) {
				
				const kid = queue[cursor]
				let index = 0

				if( kid.prev ) {

					index = chunks.findIndex( sib => sib.self === kid.prev ) + 1
					
					if( !index ) {

						index = chunks.length
						
						if( kid.next ) {
							
							index = chunks.findIndex( sib => sib.self === kid.next )
							
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
			
			const deadline = Date.now() + desync
			
			for( const next of delta ) {
				
				if( next.time > deadline ) {
					console.warn( 'Ignored chunk from far future', next )
					continue
				}
				
				this._clock.see( next.peer, next.time )
				const chunks = this.chunk_list( next.head )
				const guid = `${ next.head }/${ next.self }` as const
				
				let prev = this._chunk_all.get( guid )
				if( prev ) {
					if( $hyoo_crowd_chunk_compare( prev, next ) > 0 ) continue
					chunks.splice( chunks.indexOf( prev ), 1, next )
				} else {
					chunks.push( next )
				}
				
				this._chunk_all.set( guid, next )
				chunks.dirty = true
				this._chunk_alive.set( next.head, undefined )
				
			}
			
			this.pub.emit()
			
			return this
		}
		
		/** Places data to tree. */
		put(
			head: $hyoo_crowd_chunk['head'],
			self: $hyoo_crowd_chunk['self'],
			prev: $hyoo_crowd_chunk['prev'],
			data: $hyoo_crowd_chunk['data'],
		) {
			
			let chunk_old = this.chunk( head, self )
			let chunk_prev = prev ? this.chunk( head, prev )! : null
			
			const chunk_list = this.chunk_list( head ) as $hyoo_crowd_chunk[]
			
			if( chunk_old ) {
				chunk_list.splice( chunk_list.indexOf( chunk_old ), 1 )
			}
			
			const seat = chunk_prev ? chunk_list.indexOf( chunk_prev ) + 1 : 0
			const next = chunk_list[ seat ]?.self ?? 0
			
			const chunk_new: $hyoo_crowd_chunk = {
				head,
				self,
				prev: prev,
				next,
				peer: this.peer,
				time: this._clock.tick( this.peer ),
				data,
			}
			this._chunk_all.set( `${ chunk_new.head }/${ chunk_new.self }`, chunk_new )
			
			chunk_list.splice( seat, 0, chunk_new )
			this._chunk_alive.set( head, undefined )
			
			// this.apply([ chunk ])
			
			this.pub.emit()
			
			return chunk_new
		}
		
		/** Recursively marks chunk with its subtree as deleted and wipes data. */
		wipe( chunk: $hyoo_crowd_chunk ) {
			
			if( chunk.data === null ) return chunk
			
			for( const kid of this.chunk_list( chunk.self ) ) {
				this.wipe( kid )
			}
			
			return this.put(
				chunk.head,
				chunk.self,
				chunk.prev,
				null,
			)
			
		}
		
		/** Moves chunk after another Prev inside some Head. */
		move(
			chunk: $hyoo_crowd_chunk,
			head: $hyoo_crowd_chunk['head'],
			prev: $hyoo_crowd_chunk['prev'],
		) {
			
			this.wipe( chunk )
			
			return this.put(
				head,
				chunk.self,
				prev,
				chunk.data
			)
			
		}
		
		/** Moves Chunk at given Seat inside given Head. */
		insert(
			chunk: $hyoo_crowd_chunk,
			head: $hyoo_crowd_chunk['head'],
			seat: number,
		) {
			const prev = seat ? this.chunk_list( head )[ seat - 1 ].self : 0
			return this.move( chunk, head, prev )
		}
		
	}
	
}
