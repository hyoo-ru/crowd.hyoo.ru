namespace $ {
	
	/** Stateless non-unique adapter to CROWD Tree for given Head. */
	export class $hyoo_crowd_branch {
		
		constructor(
			readonly tree: $hyoo_crowd_tree,
			readonly head: $hyoo_crowd_chunk['head'],
		) {}
		
		/** Returns inner branch for id. */
		branch( self: $hyoo_crowd_chunk['self'] ) {
			return new $hyoo_crowd_branch( this.tree, self )
		}
		
		/** Ordered inner chunks. Including tombstones. */
		chunks() {
			return this.tree.chunk_list( this.head )
		}
		
		/** Ordered inner branch. Including tombstones. */
		branches() {
			return this.chunks().map( chunk => this.branch( chunk.self ) )
		}
		
		/** Data list representation. */
		list(
			next?: readonly unknown[],
		) {
			
			let prev = this.chunks().filter( chunk => chunk.data !== null )
			
			if( next === undefined ) {
				
				return prev.map( chunk => chunk.data )
				
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
