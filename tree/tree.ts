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
		
		chunk(
			head: $hyoo_crowd_chunk['head'],
			self: $hyoo_crowd_chunk['self'],
		) {
			return this._chunks.get( `${ head }/${ self }` ) ?? null
		}
		
		/** Returns list of all alive children of node. */ 
		kids( head: $hyoo_crowd_chunk['head'] ): readonly $hyoo_crowd_chunk[] {
			return this._kids.get( head )?.filter( node => node.data !== null ) ?? []
		}
		
		lead( node: $hyoo_crowd_chunk ): $hyoo_crowd_chunk | null {
			const siblings = this._kids.get( node.head )!
			return siblings[ siblings.indexOf( node ) - 1 ] ?? null
		}
		
		next( node: $hyoo_crowd_chunk ): $hyoo_crowd_chunk | null {
			const siblings = this._kids.get( node.head )!
			return siblings[ siblings.indexOf( node ) + 1 ] ?? null
		}
		
		get root() {
			return this.node( 0 )
		}
		
		node( head: $hyoo_crowd_chunk['head'] ) {
			return new $hyoo_crowd_node( this, head )
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
			
			for( const node of this._chunks.values() ) {
				
				if( !node?.guid ) continue
				
				const version = clock.get( node!.peer )
				if( version && node!.version <= version ) continue
				
				delta.push( node! )
			}
			
			delta.sort( ( left, right )=> left.prefer( right ) ? 1 : -1 )
			
			return delta as readonly $hyoo_crowd_chunk[]
		}
		
		resort(
			head: $hyoo_crowd_chunk['head'],
		) {
			
			const kids = this._kids.get( head )!
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
				
				// while( index < siblings.length ) {
					
				// 	const follower = siblings[ index ]
				// 	if( node.prefer( follower ) ) break
					
				// 	++ index
				// }
				
				// if( node.offset < 0 ) node.offset = index
				ordered.splice( index, 0, kid )
				
			}
			this._kids.set( head, ordered )
		}
		
		/** Applies Delta to current state. */
		apply( delta: readonly $hyoo_crowd_chunk[] ) {
			
			for( const patch of delta ) {
				
				this.clock.see( patch.peer, patch.version )
				
				let node = this._chunks.get( patch.guid )
				if( node ) {
					
					if( node.prefer( patch ) ) continue
				
					this.back_unlink( node )
					
				}
				
				this._chunks.set( patch.guid, patch )
				this.back_link( patch )
				this.resort( patch.head )
				
			}
			
			return this
		}
		
		/** Makes back links to node inside Parent/Leader */
		protected back_link( node: $hyoo_crowd_chunk ) {
			
			let lead = node.lead ? this.chunk( node.head, node.lead )! : null
			
			let siblings = this._kids.get( node.head )
			if( siblings ) {
				
				let index = lead ? siblings.indexOf( lead ) + 1 : 0
				
				// while( index < siblings.length ) {
					
				// 	const follower = siblings[ index ]
				// 	if( node.prefer( follower ) ) break
					
				// 	++ index
				// }
				
				if( node.offset < 0 ) node.offset = index
				siblings.splice( index, 0, node )
				
			} else {
				
				if( node.offset < 0 ) node.offset = 0
				this._kids.set( node.head, [ node ] )
				
			}

			return this
		}
		
		/** Romoves back links to node inside Parent/Leader */
		protected back_unlink( node: $hyoo_crowd_chunk ) {
			
			let siblings = this._kids.get( node.head )!
			
			const index = siblings.indexOf( node )
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
			
			// const existen = this.node( guid )
			// if( existen && existen.leader !== leader ) {
				
			// 	const follower = this.follower( existen )
			// 	if( follower ) {
					
			// 		this.apply([
			// 			new $hyoo_crowd_node(
			// 				follower.guid,
			// 				existen.leader,
			// 				follower.offset,
			// 				this.peer,
			// 				this.clock.tick( this.peer ),
			// 				follower.data,
			// 			)
			// 		])
					
			// 	}
				
			// }
			
			const node = new $hyoo_crowd_chunk(
				head,
				self,
				lead,
				-1,
				this.peer,
				this.clock.tick( this.peer ),
				name,
				data,
			)
			
			this.apply([ node ])
			
			// if( !existen || existen.leader !== leader ) {
				
			// 	const follower = this.follower( node )
			// 	if( follower ) {
					
			// 		this.apply([
			// 			new $hyoo_crowd_node(
			// 				follower.guid,
			// 				node.luid,
			// 				this.peer,
			// 				this.clock.tick( this.peer ),
			// 				follower.data,
			// 			)
			// 		])
				
			// 	}
				
			// }
			
			return node
		}
		
		/** Recursively marks node with its subtree as deleted and wipes data. */
		wipe( node: $hyoo_crowd_chunk ) {
			
			if( node.data === null ) return node
			
			for( const kid of this.kids( node.self ) ) {
				this.wipe( kid )
			}
			
			return this.put(
				node.head,
				node.self,
				node.lead,
				"",
				null,
			)
			
		}
		
		/** Moves node after another lead inside some head. */
		move(
			node: $hyoo_crowd_chunk,
			head: $hyoo_crowd_chunk['head'],
			lead: $hyoo_crowd_chunk['lead'],
		) {
			
			this.wipe( node )
			
			return this.put(
				head,
				node.self,
				lead,
				node.name,
				node.data
			)
			
		}
		
		/** Moves node at some offset inside some head. */
		insert(
			node: $hyoo_crowd_chunk,
			head: $hyoo_crowd_chunk['head'],
			offset: $hyoo_crowd_chunk['offset'],
		) {
			
			const siblings = this.kids( head )
			const lead = offset ? siblings[ offset - 1 ].self : 0
			
			return this.move( node, head, lead )
		}
		
	}
	
}
