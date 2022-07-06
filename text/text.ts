namespace $ {
	export class $hyoo_crowd_text extends $hyoo_crowd_node {
		
		/** Text representation. Based on list of strings. */
		text( next?: string ) {
			
			if( next === undefined ) {
				
				return this.as( $hyoo_crowd_list ).list().filter( item => typeof item === 'string' ).join( '' )
			
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
			this.as( $hyoo_crowd_list ).insert( words, from, to )
			
			return this
		}

		point_by_offset( offset: number ) {
			
			let off = offset
			for( const chunk of this.chunks() ) {
				
				const len = String( chunk.data ).length
				
				if( off < len ) return { self_hi: chunk.self_hi, self_lo: chunk.self_lo, offset: off }
				else off -= len
				
			}
			
			return { self_hi: this.head_hi, self_lo: this.head_lo, offset: offset }
		}
		
		offset_by_point( point: { self_hi: number, self_lo: number, offset: number } ) {
			
			let offset = 0
			
			for( const chunk of this.chunks() ) {
				
				if( chunk.self_hi === point.self_hi && chunk.self_lo === point.self_lo ) return offset + point.offset
				
				offset += String( chunk.data ).length
			}
			
			return offset
		}
		
	}
}
