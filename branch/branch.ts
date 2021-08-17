namespace $ {
	
	/** Stateless non-unique adapter to CROWD Tree for given Head. */
	export class $hyoo_crowd_branch {
		
		constructor(
			readonly tree: $hyoo_crowd_tree,
			readonly head: $hyoo_crowd_chunk['head'],
		) {}
		
		/** Returns inner branch for key. */
		sub( data: unknown ) {
			
			let chunk = this.chunks().find( chunk => chunk.data === data )
			if( !chunk ) chunk = this.insert( data, 0 )
			
			return new $hyoo_crowd_branch( this.tree, chunk.self )
		}
		
		/** Ordered inner alive chunks. */
		chunks() {
			return this.tree.chunk_list( this.head ).filter( chunk => chunk.data !== null )
		}
		
		/** Ordered inner alive branches. */
		branches() {
			return this.chunks().map( chunk => this.tree.branch( chunk.self ) )
		}
		
		/** Atomic value. */
		value( next?: unknown ) {
			
			const chunks = this.chunks()
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
					next,
				)
			
				return next
			}
			
		}
		
		/** Atomic string. */
		str( next?: string ) {
			return String( this.value( next ) ?? '' )
		}
		
		/** Atomic number. */
		numb( next?: number ) {
			return Number( this.value( next ) ?? 0 )
		}
		
		/** Atomic boolean. */
		bool( next?: boolean ) {
			return Boolean( this.value( next ) ?? false )
		}
		
		count() {
			return this.chunks().length
		}
		
		/** Data list representation. */
		list( next?: readonly unknown[] ) {
			
			let prev = this.chunks()
			
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
		
		insert(
			data: unknown,
			seat = this.count(),
		) {
			
			const lead = seat ? this.chunks()[ seat - 1 ].self : 0
			
			return this.tree.put(
				this.head,
				this.tree.id_new(),
				lead,
				data
			)
			
		}
		
		move(
			from: number,
			to: number,
		) {
			
			const chunks = this.chunks()
			const lead = to ? chunks[ to - 1 ].self : 0
			
			return this.tree.move( chunks[ from ], this.head, lead )
			
		}
		
		cut( seat: number ) {
			return this.tree.wipe( this.chunks()[ seat ] )
		}
		
	}
	
}
