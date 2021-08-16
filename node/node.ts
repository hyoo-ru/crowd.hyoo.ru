namespace $ {
	
	export class $hyoo_crowd_node {
		
		constructor(
			readonly tree: $hyoo_crowd_tree,
			readonly head: $hyoo_crowd_chunk['head'],
		) {}
		
		node( self: $hyoo_crowd_chunk['self'] ) {
			return new $hyoo_crowd_node( this.tree, self )
		}
		
		chunks() {
			return this.tree.kids( this.head )
		}
		
		nodes() {
			return this.chunks().map( chunk => this.node( chunk.self ) )
		}
		
		list< Item extends unknown >(
			next?: readonly Item[],
		): readonly Item[] {
			
			let prev = this.chunks()
			
			if( next === undefined ) {
				
				return prev.map( node => node.data as Item )
				
			} else {
				
				let k = 0
				let n = 0
				let lead = 0
				
				while( k < prev.length || n < next.length ) {
					
					if( prev[k]?.data === next[n] ) {
						
						lead = prev[k].self
						
						++ k
						++ n
						
					} else if( next.length - n > prev.length - k ) {
						
						lead = this.tree.put(
							this.head,
							this.tree.id_new(),
							lead,
							"",
							next[n],
						).self
						
						++ n
						
					} else if( next.length - n < prev.length - k ) {
						
						lead = this.tree.wipe( prev[k] ).self
						++ k
						
					} else {
						
						lead = this.tree.put(
							prev[k].head,
							prev[k].self,
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
