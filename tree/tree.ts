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
			
			return delta as readonly $hyoo_crowd_node[]
		}
		
		/** Applies Delta to current state. */
		apply( delta: readonly $hyoo_crowd_node[] ) {
			
			for( const patch of delta ) {
				
				this.clock.see( patch.peer, patch.version )
				
				let node = this.nodes.get( patch.guid )
				if( node ) {
					
					if( patch.version < node.version ) continue
					if( patch.version === node.version && patch.peer < node.peer ) continue
				
					this.back_unlink( node )
					
				}
				
				this.nodes.set( patch.guid, patch )
				this.back_link( patch )
				
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
				const index = leader ? siblings.indexOf( leader ) + 1 : 0
				siblings.splice( index, 0, node )
			} else {
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
		
		/** Marks node with its subtree as deleted and wipes data. */
		wipe( node: $hyoo_crowd_node ) {
			
			if( node.data === null ) return node
			
			for( const kid of this.kids( node.guid ) ) {
				this.wipe( kid )
			}
			
			node = node.wiped( this.peer, this.clock.tick( this.peer ) )
			this.apply([ node ])
			
			return node
		}
		
		/** Places data to tree. */
		put(
			guid: $hyoo_crowd_node['guid'],
			leader: $hyoo_crowd_node['leader'],
			data: $hyoo_crowd_node['data'],
		) {
			
			const node = new $hyoo_crowd_node(
				guid,
				leader,
				this.peer,
				this.clock.tick( this.peer ),
				data,
				null,
			)
			
			this.apply([ node ])
			
			return node
		}
		
	}
	
}
