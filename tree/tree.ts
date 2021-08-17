namespace $ {
	
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
		
		protected _chunk_lists = new Map<
			$hyoo_crowd_chunk['self'],
			$hyoo_crowd_chunk[]
		>()
		
		protected _chunk_alive = new Map<
			$hyoo_crowd_chunk['self'],
			undefined | $hyoo_crowd_chunk[]
		>()
		
		/** Returns existen data chunk for unique head+self. */
		chunk(
			head: $hyoo_crowd_chunk['head'],
			self: $hyoo_crowd_chunk['self'],
		) {
			return this._chunk_all.get( `${ head }/${ self }` ) ?? null
		}
		
		/** Returns list of chunks for Branch. */ 
		chunk_list(
			head: $hyoo_crowd_chunk['head']
		): $hyoo_crowd_chunk[] {
			
			let chunks = this._chunk_lists.get( head )
			if( !chunks ) this._chunk_lists.set( head, chunks = [] )
			
			return chunks
		}
		
		/** Returns list of chunks for Branch. */ 
		chunk_alive(
			head: $hyoo_crowd_chunk['head']
		): readonly $hyoo_crowd_chunk[] {
			
			let chunks = this._chunk_alive.get( head )
			if( !chunks ) {
				chunks = this.chunk_list( head ).filter( chunk => chunk.data !== null )
				this._chunk_alive.set( head, chunks )
			}
			
			return chunks
		}
		
		/** Root Branch. */
		root = this.branch( 0 )
		
		/** Returns branch for Branch. */
		branch( head: $hyoo_crowd_chunk['head'] ) {
			return new $hyoo_crowd_branch( this, [ head ] )
		}
		
		/** Generates new 6B identifier. */
		id_new() {
			return 1 + Math.floor( Math.random() * ( 2 ** ( 6 * 8 ) - 2 ) )
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
			
			const chunks = this._chunk_lists.get( head )!
			
			const queue = chunks.splice(0).sort( ( left, right )=> {
				if( left.seat > right.seat ) return +1
				if( left.seat < right.seat ) return -1
				if( left.prefer( right ) ) return +1
				else return -1
			} )
			
			for( const kid of queue ) {
				
				let leader = kid.lead ? this.chunk( head, kid.lead )! : null
				let index = leader ? chunks.indexOf( leader ) + 1 : 0
				if( index === 0 && leader ) index = chunks.length
				if( index < kid.seat ) {
					index = chunks.length
				}
				
				chunks.splice( index, 0, kid )
				
			}
			
			this._chunk_lists.set( head, chunks )
			
			return chunks
		}
		
		/** Applies Delta to current state. */
		apply( delta: readonly $hyoo_crowd_chunk[] ) {
			
			const unordered = new Set< number >()
			
			for( const next of delta ) {
				
				this.clock.see( next.peer, next.time )
				const chunks = this.chunk_list( next.head )
				
				let prev = this._chunk_all.get( next.guid )
				if( prev ) {
					if( prev.prefer( next ) ) continue
					chunks.splice( chunks.indexOf( prev ), 1, next )
				} else {
					chunks.push( next )
				}
				
				this._chunk_all.set( next.guid, next )
				unordered.add( next.head )
				
				// const list = this._chunk_lists.get( next.head )
				// if( list ) {
					
				// 	if( prev ) {
				// 		list.splice( list.indexOf( prev ), 1 )
				// 	}
					
				// 	let seat = next.lead ? list.indexOf( this.chunk( next.head, next.lead )! ) + 1 : 0
					
				// 	while( seat < list.length ) {
						
				// 		if( list[ seat ].lead === next.lead && list[ seat ].prefer( next ) )  {
				// 			++ seat
				// 			continue
				// 		}
						
				// 		break
				// 	}
					
				// 	list.splice( seat, 0, next )
					
				// } else {
				// 	this._chunk_lists.set( next.head, [ next ] )
				// }
				
			}
			
			for( const head of unordered ) {
				this.resort( head )
				this._chunk_alive.set( head, undefined )
			}
			
			return this
		}
		
		/** Places data to tree. */
		put(
			head: $hyoo_crowd_chunk['head'],
			self: $hyoo_crowd_chunk['self'],
			lead: $hyoo_crowd_chunk['lead'],
			data: $hyoo_crowd_chunk['data'],
		) {
			
			let chunk_old = this.chunk( head, self )
			let chunk_lead = lead ? this.chunk( head, lead )! : null
			
			const chunk_list = this.chunk_list( head ) as $hyoo_crowd_chunk[]
			
			if( chunk_old ) {
				chunk_list.splice( chunk_list.indexOf( chunk_old ), 1 )
			}
			
			let seat = chunk_lead ? chunk_list.indexOf( chunk_lead ) + 1 : 0
			
			const chunk_new = new $hyoo_crowd_chunk(
				head,
				self,
				lead,
				seat,
				this.peer,
				this.clock.tick( this.peer ),
				data,
			)
			this._chunk_all.set( chunk_new.guid, chunk_new )
			
			chunk_list.splice( seat, 0, chunk_new )
			this._chunk_alive.set( head, undefined )
			
			// this.apply([ chunk ])
			
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
				chunk.lead,
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
