namespace $ {
	
	const id_max = 2 ** ( 6 * 8 ) - 2
	
	/** Conflict-free Reinterpretable Ordered Washed Data Tree */
	export class $hyoo_crowd_tree {
		
		constructor(
			readonly peer = 0
		) {
			if( !peer ) this.peer = this.id_new()
		}
		
		readonly clock = new $hyoo_crowd_clock
		
		protected _chunk_all = new Map<
			$hyoo_crowd_chunk['guid'],
			$hyoo_crowd_chunk
		>()
		
		protected _chunk_sets = new Map<
			$hyoo_crowd_chunk['self'],
			Set< $hyoo_crowd_chunk >
		>()
		
		protected _chunk_lists = new Map<
			$hyoo_crowd_chunk['self'],
			$hyoo_crowd_chunk[]
		>()
		
		/** Returns existen data chunk for unique head+self. */
		chunk(
			head: $hyoo_crowd_chunk['head'],
			self: $hyoo_crowd_chunk['self'],
		) {
			return this._chunk_all.get( `${ head }/${ self }` ) ?? null
		}
		
		/** Returns set of chunks for Branch. */ 
		chunk_set(
			head: $hyoo_crowd_chunk['head']
		): Set< $hyoo_crowd_chunk > {
			
			let chunks = this._chunk_sets.get( head )
			if( !chunks ) {
				this._chunk_sets.set( head, chunks = new Set )
			}
			
			return chunks
		}
		
		/** Returns list of chunks for Branch. */ 
		chunk_list(
			head: $hyoo_crowd_chunk['head']
		): readonly $hyoo_crowd_chunk[] {
			
			let chunks = this._chunk_lists.get( head )
			if( !chunks ) {
				chunks = [ ... this.chunk_set( head ).values() ]
				this._chunk_lists.set( head, chunks )
				chunks = this.resort( head )
			}
			
			return chunks
		}
		
		/** Root Branch. */
		get root() {
			return this.branch( 0 )
		}
		
		/** Returns branch for Branch. */
		branch( head: $hyoo_crowd_chunk['head'] ) {
			return new $hyoo_crowd_branch( this, head )
		}
		
		/** Generates new 6B identifier. */
		id_new() {
			return 1 + Math.floor( Math.random() * id_max )
		}
		
		/** Makes independent clone with defined peer. */
		fork( peer: number ) {
			return new $hyoo_crowd_tree( peer ).apply( this.delta() )
		}
		
		/** Makes Delta betwteen Clock and now. */
		delta(
			clock = new $hyoo_crowd_clock,
		) {
			
			const delta = [] as $hyoo_crowd_chunk[]
			
			for( const chunk of this._chunk_all.values() ) {
				
				if( !chunk?.guid ) continue
				
				const time = clock.get( chunk!.peer )
				if( time && chunk!.time <= time ) continue
				
				delta.push( chunk! )
			}
			
			delta.sort( ( left, right )=> left.prefer( right ) ? 1 : -1 )
			
			return delta as readonly $hyoo_crowd_chunk[]
		}
		
		resort(
			head: $hyoo_crowd_chunk['head'],
		) {
			
			const kids = this._chunk_lists.get( head )!
			kids.sort( ( left, right )=> {
				if( left.seat > right.seat ) return +1
				if( left.seat < right.seat ) return -1
				if( left.prefer( right ) ) return +1
				else return -1
			} )
			
			const ordered = [] as typeof kids
			for( const kid of kids ) {
				
				let leader = kid.lead ? this.chunk( head, kid.lead )! : null
				let index = leader ? ordered.indexOf( leader ) + 1 : 0
				if( index === 0 && leader ) index = ordered.length
				if( index < kid.seat ) {
					index = ordered.length
				}
				
				ordered.splice( index, 0, kid )
				
			}
			this._chunk_lists.set( head, ordered )
			return ordered
		}
		
		/** Applies Delta to current state. */
		apply( delta: readonly $hyoo_crowd_chunk[] ) {
			
			for( const next of delta ) {
				
				this.clock.see( next.peer, next.time )
				const chunks = this.chunk_set( next.head )
				
				let prev = this._chunk_all.get( next.guid )
				if( prev ) {
					if( prev.prefer( next ) ) continue
					chunks.delete( prev )
				}
				
				this._chunk_all.set( next.guid, next )
				chunks.add( next )
				this._chunk_lists.delete( next.head )
				
			}
			
			return this
		}
		
		/** Places data to tree. */
		put(
			head: $hyoo_crowd_chunk['head'],
			self: $hyoo_crowd_chunk['self'],
			lead: $hyoo_crowd_chunk['lead'],
			name: $hyoo_crowd_chunk['name'],
			data: $hyoo_crowd_chunk['data'],
		) {
			
			let chunk_lead = lead ? this.chunk( head, lead )! : null
			let seat = chunk_lead ? this.chunk_list( head ).filter( chunk => chunk.self !== self ).indexOf( chunk_lead ) + 1 : 0
			
			const chunk = new $hyoo_crowd_chunk(
				head,
				self,
				lead,
				seat,
				this.peer,
				this.clock.tick( this.peer ),
				name,
				data,
			)
			
			this.apply([ chunk ])
			
			return chunk
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
				chunk.lead,
				"",
				null,
			)
			
		}
		
		/** Moves chunk after another Lead inside some Head. */
		move(
			chunk: $hyoo_crowd_chunk,
			head: $hyoo_crowd_chunk['head'],
			lead: $hyoo_crowd_chunk['lead'],
		) {
			
			this.wipe( chunk )
			
			return this.put(
				head,
				chunk.self,
				lead,
				chunk.name,
				chunk.data
			)
			
		}
		
		/** Moves Chunk at given Seat inside given Head. */
		insert(
			chunk: $hyoo_crowd_chunk,
			head: $hyoo_crowd_chunk['head'],
			seat: $hyoo_crowd_chunk['seat'],
		) {
			const lead = seat ? this.chunk_list( head )[ seat - 1 ].self : 0
			return this.move( chunk, head, lead )
		}
		
	}
	
}
