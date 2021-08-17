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
		
		/** Ordered inner alive chunks from name space. */
		chunks( name: string ) {
			return this.tree.chunk_list( this.head ).filter( chunk => chunk.data !== null && chunk.name === name )
		}
		
		/** Ordered inner alive branches from name space. */
		branches( name: string ) {
			return this.chunks( name ).map( chunk => this.branch( chunk.self ) )
		}
		
		/** Atomic value for name space. */
		value( name: string, next?: unknown ) {
			
			const chunks = this.chunks( name )
			let last
			
			for( const chunk of chunks ) {
				if( !last || chunk.prefer( last ) ) last = chunk
			}
			
			if( next === undefined ) {
				
				return last?.data ?? null
				
			} else {
				
				if( last?.data === next ) return next
				
				for( const chunk of chunks ) {
					if( chunk === last ) continue
					this.tree.wipe( chunk )
				}
				
				this.tree.put(
					this.head,
					last?.self ?? this.tree.id_new(),
					0,
					name,
					next,
				)
			
				return next
			}
			
		}
		
		/** Atomic string for name space. */
		str( name: string, next?: string ) {
			return String( this.value( name, next ) ?? '' )
		}
		
		/** Atomic number for name space. */
		numb( name: string, next?: number ) {
			return Number( this.value( name, next ) ?? 0 )
		}
		
		/** Atomic boolean for name space. */
		bool( name: string, next?: boolean ) {
			return Boolean( this.value( name, next ) ?? false )
		}
		
		count( name: string ) {
			return this.chunks( name ).length
		}
		
		/** Data list representation of name space. */
		list(
			name: string, 
			next?: readonly unknown[],
		) {
			
			let prev = this.chunks( name )
			
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
		
		/** Text representation of name space. Based on list of strings. */
		text( name: string, next?: string ) {
			
			if( next === undefined ) {
				
				return this.list( name ).join( '' )
			
			} else {
				
				const words = [ ... next.matchAll( $hyoo_crowd_text_tokenizer ) ].map( token => token[0] )
				this.list( name, words )
				
				return next
			}
			
		}
		
		insert(
			name: string,
			data: unknown,
			seat = this.count(''),
		) {
			
			const lead = seat ? this.chunks( name )[ seat - 1 ].self : 0
			
			return this.tree.put(
				this.head,
				this.tree.id_new(),
				lead,
				name,
				data
			)
			
		}
		
		move(
			name: string,
			from: number,
			to: number,
		) {
			
			const chunks = this.chunks( name )
			const lead = to ? chunks[ to - 1 ].self : 0
			
			return this.tree.move( chunks[ from ], this.head, lead )
			
		}
		
		cut(
			name: string,
			seat: number,
		) {
			return this.tree.wipe( this.chunks( name )[ seat ] )
		}
		
	}
	
}
