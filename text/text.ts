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
			
			const list = this.units()
			
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
			for( const unit of this.units() ) {
				
				const len = String( unit.data ).length
				
				if( off < len ) return { self: unit.self(), offset: off }
				else off -= len
				
			}
			
			return { self: this.head, offset: offset }
		}
		
		offset_by_point( point: { self: $mol_int62_pair, offset: number } ) {
			
			let offset = 0
			
			for( const unit of this.units() ) {
				
				if( unit.self_lo === point.self.lo && unit.self_hi === point.self.hi ) {
					return offset + point.offset
				} else {
					offset += String( unit.data ).length
				}
				
			}
			
			return offset
		}
		
		selection( peer: $mol_int62_pair, next?: number[] ) {
			
			const reg = this.land.world().land_sync( peer ).chief.sub( '$hyoo_crowd_text..selection', $hyoo_crowd_reg )
			
			if( next ) {
				reg.value( next.map( offset => this.point_by_offset( offset ) ) )
				return next
			} else {
				return ( reg.value() as { self: $mol_int62_pair, offset: number }[] )
					?.map( point => this.offset_by_point( point ) ) ?? [ 0, 0 ]
			}
			
		}
		
	}
}
