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
		
		protected _chunks = new Map<
			$hyoo_crowd_chunk['guid'],
			$hyoo_crowd_chunk
		>()
		
		protected _kids = new Map<
			$hyoo_crowd_chunk['self'],
			$hyoo_crowd_chunk[]
		>()
		
		/** Returns existen data chunk for unique head+self. */
		chunk(
			head: $hyoo_crowd_chunk['head'],
			self: $hyoo_crowd_chunk['self'],
		) {
			return this._chunks.get( `${ head }/${ self }` ) ?? null
		}
		
		/** Returns ordered list of chunks for Branch. */ 
		kids( head: $hyoo_crowd_chunk['head'] ): readonly $hyoo_crowd_chunk[] {
			
			let chunks = this._kids.get( head )
			if( !chunks ) {
				this._kids.set( head, chunks = [] )
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
			
			for( const chunk of this._chunks.values() ) {
				
				if( !chunk?.guid ) continue
				
				const version = clock.get( chunk!.peer )
				if( version && chunk!.version <= version ) continue
				
				delta.push( chunk! )
			}
			
			delta.sort( ( left, right )=> left.prefer( right ) ? 1 : -1 )
			
			return delta as readonly $hyoo_crowd_chunk[]
		}
		
		resort(
			head: $hyoo_crowd_chunk['head'],
		) {
			
			const kids = this.kids( head ) as $hyoo_crowd_chunk[]
			kids.sort( ( left, right )=> {
				if( left.offset > right.offset ) return +1
				if( left.offset < right.offset ) return -1
				if( left.prefer( right ) ) return +1
				else return -1
			} )
			
			const ordered = [] as typeof kids
			for( const kid of kids ) {
				
				let leader = kid.lead ? this.chunk( head, kid.lead )! : null
				let index = leader ? ordered.indexOf( leader ) + 1 : 0
				if( index === 0 && leader ) index = ordered.length
				if( index < kid.offset ) {
					index = ordered.length
				}
				
				ordered.splice( index, 0, kid )
				
			}
			this._kids.set( head, ordered )
			
		}
		
		/** Applies Delta to current state. */
		apply( delta: readonly $hyoo_crowd_chunk[] ) {
			
			for( const patch of delta ) {
				
				this.clock.see( patch.peer, patch.version )
				
				let chunk = this._chunks.get( patch.guid )
				if( chunk ) {
					
					if( chunk.prefer( patch ) ) continue
				
					this.back_unlink( chunk )
					
				}
				
				this._chunks.set( patch.guid, patch )
				this.back_link( patch )
				this.resort( patch.head )
				
			}
			
			return this
		}
		
		/** Makes back links to chunk inside Head. */
		protected back_link( chunk: $hyoo_crowd_chunk ) {
			
			let lead = chunk.lead ? this.chunk( chunk.head, chunk.lead )! : null
			
			let siblings = this.kids( chunk.head ) as $hyoo_crowd_chunk[]
			let index = lead ? siblings.indexOf( lead ) + 1 : 0
			
			if( chunk.offset < 0 ) chunk.offset = index
			siblings.splice( index, 0, chunk )
				
			return this
		}
		
		/** Romoves back links to chunk inside Head. */
		protected back_unlink( chunk: $hyoo_crowd_chunk ) {
			
			let siblings = this.kids( chunk.head ) as $hyoo_crowd_chunk[]
			
			const index = siblings.indexOf( chunk )
			siblings.splice( index, 1 )
			
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
			
			const chunk = new $hyoo_crowd_chunk(
				head,
				self,
				lead,
				-1,
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
			
			for( const kid of this.kids( chunk.self ) ) {
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
		
		/** Moves chunk at given offset inside some Head. */
		insert(
			chunk: $hyoo_crowd_chunk,
			head: $hyoo_crowd_chunk['head'],
			offset: $hyoo_crowd_chunk['offset'],
		) {
			
			const siblings = this.kids( head )
			const lead = offset ? siblings[ offset - 1 ].self : 0
			
			return this.move( chunk, head, lead )
		}
		
	}
	
}
