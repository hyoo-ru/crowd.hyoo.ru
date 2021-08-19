namespace $ {
	
	/** Stateless non-unique adapter to CROWD Tree for given Head. */
	export class $hyoo_crowd_branch {
		
		constructor(
			readonly tree: $hyoo_crowd_doc,
			readonly head: $hyoo_crowd_chunk['head'],
		) {}
		
		/** Returns inner branch for key. */
		sub( key: string ) {
			return this.tree.branch( $mol_hash_string( key, this.head ) )
		}
		
		/** Ordered inner alive chunks. */
		chunks() {
			return this.tree.chunk_alive( this.head )
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
			
			if( next === undefined ) {
				return this.chunks().map( chunk => chunk.data )
			} else {
				this.insert( next, 0, this.count() )
				return next
			}
			
		}
		
		insert(
			next: readonly unknown[],
			from = this.count(),
			to = from,
		) {
			
			let prev = this.chunks()
			
			let p = from
			let n = 0
			let lead = p ? prev[ p - 1 ].self : 0
			
			while( p < to || n < next.length ) {
				
				if( p < to && n < next.length && prev[p].data === next[n] ) {
					
					lead = prev[p].self
					
					++ p
					++ n
					
				} else if( next.length - n > to - p ) {
					
					lead = this.tree.put(
						this.head,
						this.tree.id_new(),
						lead,
						next[n],
					).self
					
					++ n
					
				} else if( next.length - n < to - p ) {
					
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
			
		}
		
		/** Text representation. Based on list of strings. */
		text( next?: string ) {
			
			if( next === undefined ) {
				
				return this.list().join( '' )
			
			} else {
				
				this.write( next, 0, -1 )
				
				return next
			}
			
		}
		
		write(
			next: string,
			str_from = -1,
			str_to = str_from,
		) {
			
			const list = this.chunks()
			
			let from = str_from < 0 ? list.length : 0
			let word = ''
			
			while( from < list.length ) {
				
				word = String( list[ from ].data )
				
				if( str_from <= word.length ) {
					next = word.slice( 0, str_from ) + next
					break
				}
				
				str_from -= word.length
				if( str_to > 0 ) str_to -= word.length
				
				from ++
				
			}
			
			let to = str_to < 0 ? list.length : from
			
			while( to < list.length ) {
				
				word = String( list[ to ].data )
				to ++
				
				if( str_to < word.length ) {
					next = next + word.slice( str_to )
					break
				}
				
				str_to -= word.length
				
			}
			
			if( from && from === list.length ) {
				-- from
				next = String( list[ from ].data ) + next
			}
			
			const words = [ ... next.matchAll( $hyoo_crowd_tokenizer ) ].map( token => token[0] )
			this.insert( words, from, to )
			
			return this
		}


		point_by_offset( offset: number ) {
			
			let off = offset
			for( const chunk of this.chunks() ) {
				
				const len = String( chunk.data ).length
				
				if( off < len ) return { chunk: chunk.self, offset: off }
				else off -= len
				
			}
			
			return { chunk: this.head, offset: offset }
		}
		
		offset_by_point( point: { chunk: number, offset: number } ) {
			
			let offset = 0
			
			for( const chunk of this.chunks() ) {
				
				if( chunk.self === point.chunk ) return offset + point.offset
				
				offset += String( chunk.data ).length
			}
			
			return offset
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
