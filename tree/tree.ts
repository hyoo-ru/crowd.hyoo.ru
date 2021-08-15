namespace $ {
	
	const id_max = 2 ** ( 6 * 8 ) - 2
	
	function id_new() {
		return 1 + Math.floor( Math.random() * id_max )
	}
	
	/** Conflict-free Reinterpretable Ordered Washed Data Tree */
	export class $hyoo_crowd_tree {
		
		constructor(
			readonly peer = id_new()
		) { }
		
		clock = new $hyoo_crowd_clock
		
		protected nodes = new Map<
			$hyoo_crowd_node['guid'],
			$hyoo_crowd_node
		>()
		
		protected _kids = new Map<
			$hyoo_crowd_node['self'],
			$hyoo_crowd_node[]
		>()
		
		node(
			head: $hyoo_crowd_node['head'],
			self: $hyoo_crowd_node['self'],
		) {
			return this.nodes.get( `${ head }/${ self }` ) ?? null
		}
		
		/** Returns list of all alive children of node. */ 
		kids(
			head: $hyoo_crowd_node['head'],
		): readonly $hyoo_crowd_node[] {
			return this._kids.get( head )?.filter( node => node.data !== null ) ?? []
		}
		
		lead( node: $hyoo_crowd_node ): $hyoo_crowd_node | null {
			const siblings = this._kids.get( node.head )!
			return siblings[ siblings.indexOf( node ) - 1 ] ?? null
		}
		
		next( node: $hyoo_crowd_node ): $hyoo_crowd_node | null {
			const siblings = this._kids.get( node.head )!
			return siblings[ siblings.indexOf( node ) + 1 ] ?? null
		} 
		
		list< Item extends unknown >(
			head: $hyoo_crowd_node['head'],
			next?: readonly Item[],
		): readonly Item[] {
			
			let kids = this.kids( head )
			
			if( next === undefined ) {
				
				return kids.map( node => node.data as Item )
				
			} else {
				
				let k = 0
				let n = 0
				let lead = 0
				
				while( k < kids.length || n < next.length ) {
					
					if( kids[k]?.data === next[n] ) {
						
						lead = kids[k].self
						
						++ k
						++ n
						
					} else if( next.length - n > kids.length - k ) {
						
						lead = this.put(
							head,
							id_new(),
							lead,
							"",
							next[n],
						).self
						
						++ n
						
					} else if( next.length - n < kids.length - k ) {
						
						lead = this.wipe( kids[k] ).self
						++ k
						
					} else {
						
						lead = this.put(
							kids[k].head,
							kids[k].self,
							lead,
							"",
							next[n],
						).self
						
						++ k
						++ n
						
					}
					
				}
				
				return next
			}
			
		}
		
		text(
			head: $hyoo_crowd_node['self'],
			next?: string,
		) {
			if( next === undefined ) {
				return this.list( head ).join( '' )
			} else {
				const words = [ ... next.matchAll( $hyoo_crowd_text_tokenizer ) ].map( token => token[0] )
				this.list( head, words )
				return next
			}
		}
		
		/** Makes independent clone with defined peer. */
		fork( peer: number ) {
			return new $hyoo_crowd_tree( peer ).apply( this.delta() )
		}
		
		/** Makes Delta betwteen Clock and now. */
		delta(
			clock = new $hyoo_crowd_clock,
		) {
			
			const delta = [] as $hyoo_crowd_node[]
			
			for( const node of this.nodes.values() ) {
				
				if( !node?.guid ) continue
				
				const version = clock.get( node!.peer )
				if( version && node!.version <= version ) continue
				
				delta.push( node! )
			}
			
			delta.sort( ( left, right )=> left.prefer( right ) ? 1 : -1 )
			
			return delta as readonly $hyoo_crowd_node[]
		}
		
		resort(
			head: $hyoo_crowd_node['head'],
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
				
				let leader = kid.lead ? this.node( head, kid.lead )! : null
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
		apply( delta: readonly $hyoo_crowd_node[] ) {
			
			for( const patch of delta ) {
				
				this.clock.see( patch.peer, patch.version )
				
				let node = this.nodes.get( patch.guid )
				if( node ) {
					
					if( node.prefer( patch ) ) continue
				
					this.back_unlink( node )
					
				}
				
				this.nodes.set( patch.guid, patch )
				this.back_link( patch )
				this.resort( patch.head )
				
			}
			
			return this
		}
		
		/** Makes back links to node inside Parent/Leader */
		protected back_link( node: $hyoo_crowd_node ) {
			
			let lead = node.lead ? this.node( node.head, node.lead )! : null
			
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
		protected back_unlink( node: $hyoo_crowd_node ) {
			
			let siblings = this._kids.get( node.head )!
			
			const index = siblings.indexOf( node )
			siblings.splice( index, 1 )
			
			return this
		}
		
		/** Places data to tree. */
		put(
			head: $hyoo_crowd_node['head'],
			self: $hyoo_crowd_node['self'],
			lead: $hyoo_crowd_node['lead'],
			name: $hyoo_crowd_node['name'],
			data: $hyoo_crowd_node['data'],
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
			
			const node = new $hyoo_crowd_node(
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
		wipe( node: $hyoo_crowd_node ) {
			
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
		
		/** Moves node after another leader. */
		move(
			node: $hyoo_crowd_node,
			lead: $hyoo_crowd_node['lead'],
		) {
			
			return this.put(
				node.head,
				node.self,
				lead,
				node.name,
				node.data
			)
			
		}
		
	}
	
}
