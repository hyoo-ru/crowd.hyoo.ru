namespace $ {
	
	/** Stateless non-unique adapter to CROWD Tree for given Head. */
	export class $hyoo_crowd_node {
		
		constructor(
			readonly tree: $hyoo_crowd_tree,
			readonly head: $hyoo_crowd_chunk['head'],
		) {}
		
		/** Returns inner node for id. */
		node( self: $hyoo_crowd_chunk['self'] ) {
			return new $hyoo_crowd_node( this.tree, self )
		}
		
		/** Ordered inner chunks. Including tombstones. */
		chunks() {
			return this.tree.kids( this.head )
		}
		
		/** Ordered inner nodes. Including tombstones. */
		nodes() {
			return this.chunks().map( chunk => this.node( chunk.self ) )
		}
		
		/** Data list representation. */
		list< Item extends unknown >(
			next?: readonly Item[],
		): readonly Item[] {
			
			let prev = this.chunks().filter( chunk => chunk.data !== null )
			
			if( next === undefined ) {
				
				return prev.map( chunk => chunk.data as Item )
				
			} else {
				
				let p = 0
				let n = 0
				let lead = 0
				
				while( p < prev.length || n < next.length ) {
					
					if( prev[p] && prev[p]?.data === null ) {
						++p
						continue
					}
					
					if( prev[p]?.data === next[n] ) {
						
						lead = prev[p].self
						
						++ p
						++ n
						
					} else if( next.length - n > prev.length - p ) {
						
						lead = this.tree.put(
							this.head,
							this.tree.id_new(),
							lead,
							"",
							next[n],
						).self
						
						++ n
						
					} else if( next.length - n < prev.length - p ) {
						
						lead = this.tree.wipe( prev[p] ).self
						++ p
						
					} else {
						
						lead = this.tree.put(
							prev[p].head,
							prev[p].self,
							lead,
							"",
							next[n],
						).self
						
						++ p
						++ n
						
					}
					
				}
				
				return next
			}
			
		}
		
		/** Text representation. Based on list of strings. */
		text( next?: string ) {
			
			if( next === undefined ) {
				
				return this.list().join( '' )
			
			} else {
				
				const words = [ ... next.matchAll( $hyoo_crowd_text_tokenizer ) ].map( token => token[0] )
				this.list( words )
				
				return next
			}
			
		}
		
	}
	
}
