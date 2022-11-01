namespace $ {
	export class $hyoo_crowd_text extends $hyoo_crowd_node {
		
		/** Text representation. Based on list of strings. */
		text( next?: string ): string {
			
			if( next === undefined ) {
				
				return this.str()
			
			} else {
				
				const prev = this.units()
				const lines = next.match(/.*\n|.+$/g) ?? []
				
				$mol_reconcile({
					prev,
					from: 0,
					to: prev.length,
					next: lines,
					equal: ( next, prev )=> {
						if( typeof prev.data === 'string' ) return false
						return this.land.node( prev.self, $hyoo_crowd_text ).str() === next
					},
					drop: ( prev, lead )=> this.land.wipe( prev ),
					insert: ( next, lead )=> {
						const unit = this.land.put(
							this.head,
							this.land.id_new(),
							lead?.self ?? '0_0',
							[],
						)
						this.land.node( unit.self, $hyoo_crowd_text ).str( next )
						return unit
					},
					update: ( next, prev, lead )=> {
						this.land.node( prev.self, $hyoo_crowd_text ).str( next )
						return prev
					},
				})
				
				return next
			}
			
		}
		
		/** Text representation. Based on list of strings. */
		str( next?: string ) {
			
			if( next === undefined ) {
				
				let str = ''
				
				for( const unit of this.units() ) {
					if( typeof unit.data === 'string' ) str += unit.data
					else str += this.land.node( unit.self, $hyoo_crowd_text ).str()
				}
				
				return str
			
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
			
			const words = next.match( $hyoo_crowd_tokenizer ) ?? []
			this.as( $hyoo_crowd_list ).insert( words, from, to )
			
			return this
		}

		point_by_offset( offset: number ): readonly[ $mol_int62_string, number ] {
			
			let off = offset
			for( const unit of this.units() ) {
				
				if( typeof unit.data === 'string' ) {
					
					const len = String( unit.data ).length
					
					if( off <= len ) return [ unit.self, off ]
					else off -= len
					
				} else {
					
					const found = this.land.node( unit.self, $hyoo_crowd_text ).point_by_offset( off )
					if( found[0] !== '0_0' ) return found
					
					off = found[1]
					
				}
				
			}
			
			return [ '0_0', off ]
		}
		
		offset_by_point( [ self, offset ]: [ $mol_int62_string, number ] ): readonly[ $mol_int62_string, number ]  {
			
			for( const unit of this.units() ) {
				
				if( unit.self === self ) return [ self, offset ]
				
				if( typeof unit.data === 'string' ) {
					
					offset += unit.data.length
					
				} else {
					
					const found = this.land.node( unit.self, $hyoo_crowd_text ).offset_by_point([ self, offset ])
					if( found[0] !== '0_0' ) return [ self, found[1] ]
					
					offset = found[1]
					
				}
				
			}
			
			return [ '0_0', offset ]
		}
		
		selection( peer: $mol_int62_string, next?: number[] ) {
			
			const reg = this.land.selection( peer )
			
			if( next ) {
				reg.value( next.map( offset => this.point_by_offset( offset ) ) )
				return next
			} else {
				this.units() // track text to recalc selection on its change
				return ( reg.value() as readonly[ $mol_int62_string, number ][] )
					?.map( point => this.offset_by_point( point )[1] ) ?? [ 0, 0 ]
			}
			
		}
		
	}
	
}
