namespace $ {
	
	const max_peer = 2 ** ( 6 * 8 ) - 1
	
	/** Conflict-free Tree */
	export class $hyoo_crowd_tree {
		
		constructor(
			readonly peer = Math.ceil( Math.random() * max_peer )
		) { }
		
		clock = new $hyoo_crowd_clock
		
		protected nodes = new Map<
			$hyoo_crowd_node['guid'],
			$hyoo_crowd_node | undefined
		>()
		
		protected _kids = new Map<
			$hyoo_crowd_node['guid'],
			$hyoo_crowd_node[]
		>()
		
		node( guid: $hyoo_crowd_node['guid'] ) {
			return this.nodes.get( guid )!
		}
		
		/** Returns list of all alive children of node. */ 
		kids(
			guid: $hyoo_crowd_node['guid']
		): readonly $hyoo_crowd_node[] {
			return this._kids.get( guid )?.filter( node => node.data !== null ) ?? []
		}
		
		follower( node: $hyoo_crowd_node ) {
			const siblings = this._kids.get( node.parent )!
			return siblings[ siblings.indexOf( node ) + 1 ]
		} 
		
		list< Item extends unknown >(
			guid: $hyoo_crowd_node['guid'],
			next?: readonly Item[],
		): readonly Item[] {
			
			let kids = this.kids( guid )
			
			if( next === undefined ) {
				
				return kids.map( node => node.data as Item )
				
			} else {
				
				let k = 0
				let n = 0
				let leader = ""
				
				while( k < kids.length || n < next.length ) {
					
					if( kids[k]?.data === next[n] ) {
						
						leader = kids[k].luid
						
						++ k
						++ n
						
					} else if( next.length - n > kids.length - k ) {
						
						leader = this.put(
							this.populate( guid ),
							leader,
							next[n],
						).luid
						
						++ n
						
					} else if( next.length - n < kids.length - k ) {
						
						leader = this.wipe( kids[k] ).luid
						++ k
						
					} else {
						
						leader = this.put(
							kids[k].guid,
							leader,
							next[n],
						).luid
						
						++ k
						++ n
						
					}
					
				}
				
				return next
			}
			
		}
		
		text( guid: $hyoo_crowd_node['guid'], next?: string ) {
			if( next === undefined ) {
				return this.list( guid ).join( '' )
			} else {
				const words = [ ... next.matchAll( $hyoo_crowd_text_tokenizer ) ].map( token => token[0] )
				this.list( guid, words )
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
		
		resort( guid: $hyoo_crowd_node['guid'] ) {
			const kids = this._kids.get( guid )!
			kids.sort( ( left, right )=> {
				if( left.offset > right.offset ) return +1
				if( left.offset < right.offset ) return -1
				if( left.prefer( right ) ) return +1
				else return -1
			} )
			const ordered = [] as typeof kids
			for( const kid of kids ) {
				
				let leader = kid.leader ? this.nodes.get( `${ guid }/${ kid.leader }` )! : null
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
			this._kids.set( guid, ordered )
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
				this.resort( patch.parent )
				
			}
			
			return this
		}
		
		populate( guid: $hyoo_crowd_node['guid'] ) {
			return `${ guid }/${ $mol_guid() }` as $hyoo_crowd_node['guid']
		}
		
		/** Makes back links to node inside Parent/Leader */
		protected back_link( node: $hyoo_crowd_node ) {
			
			let leader = node.leader ? this.nodes.get( `${ node.parent }/${ node.leader }` )! : null
			
			let siblings = this._kids.get( node.parent )
			if( siblings ) {
				
				let index = leader ? siblings.indexOf( leader ) + 1 : 0
				
				// while( index < siblings.length ) {
					
				// 	const follower = siblings[ index ]
				// 	if( node.prefer( follower ) ) break
					
				// 	++ index
				// }
				
				if( node.offset < 0 ) node.offset = index
				siblings.splice( index, 0, node )
				
			} else {
				
				if( node.offset < 0 ) node.offset = 0
				this._kids.set( node.parent, [ node ] )
				
			}

			return this
		}
		
		/** Romoves back links to node inside Parent/Leader */
		protected back_unlink( node: $hyoo_crowd_node ) {
			
			let siblings = this._kids.get( node.parent )!
			
			const index = siblings.indexOf( node )
			siblings.splice( index, 1 )
			
			return this
		}
		
		/** Places data to tree. */
		put(
			guid: $hyoo_crowd_node['guid'],
			leader: $hyoo_crowd_node['leader'],
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
				guid,
				leader,
				-1,
				this.peer,
				this.clock.tick( this.peer ),
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
			
			for( const kid of this.kids( node.guid ) ) {
				this.wipe( kid )
			}
			
			return this.put(
				node.guid,
				node.leader,
				null,
			)
			
		}
		
		/** Moves node after another leader. */
		move(
			node: $hyoo_crowd_node,
			leader: $hyoo_crowd_node['leader'],
		) {
			
			return this.put(
				node.guid,
				leader,
				node.data
			)
			
		}
		
	}
	
}
