namespace $ {
	
	export class $hyoo_crowd_text extends $hyoo_crowd_dict.of({
		flow: $hyoo_crowd_dict.of({ val: $hyoo_crowd_list }),
		token: $hyoo_crowd_dict.of({ val: $hyoo_crowd_reg }),
	}) {
		
		get root() {
			return this.for( 'flow' ).for( null )
		}
		
		get tokens() {
			return this.root.items() as number[]
		}
		
		value_of( token: number ) {
			return this.for( 'token' ).for( token )!.str()
		}
		
		text( next?: string ) {
			if( next === undefined ) {
				const tokens = this.for( 'token' )
				return this.tokens.map( id => tokens.for( id )!.str() ).join( '' )
			} else {
				this.splice_line( null, 0, this.root.count, next )
				return next
			}
		}
		
		point_by_offset( offset: number ) {
			
			for( const token of this.tokens ) {
				
				const len = this.value_of( token ).length
				
				if( offset < len ) return [ token, offset ]
				else offset -= len
				
			}
			
			return [ 0, 0 ]
		}
		
		offset_by_point( point: number[] ) {
			
			let offset = 0
			
			for( const token of this.tokens ) {
				
				if( token === point[0] ) return offset + point[1]
				
				offset += this.value_of( token ).length
			}
			
			return offset
		}
		
		splice_line( id: string | null, from: number, to: number, text: string ) {
			
			const flow = this.for( 'flow' ).for( id )
			const token_ids = flow.items_internal
			const tokens = this.for( 'token' )
			const words = [ ... $hyoo_crowd_text_tokenizer.parse( text ) ]
			
			while( from < to || words.length > 0 ) {
				
				const prev = from < token_ids.length ? tokens.for( token_ids[ from ] ).str() : null
				const next = words.length ? words[0].token ?? words[0][0] : ''
				const min_len = Math.max( 1, Math.min( prev?.length ?? 0, next.length ) -1 )
				
				if( prev === next ) {
					
					++ from
					words.shift()
					
				} else if( prev && next && ( prev.slice( 0, min_len ) === next.slice( 0, min_len ) ) ) {
					
					tokens.for( token_ids[ from ] ).str( next )
					++ from
					words.shift()
					
				} else if( words.length > to - from ) {
					
					let key
					do {
						key = Math.floor( Math.random() * 1_000_000 )
					} while( tokens.has( key ) )
					
					tokens.for( key ).str( next )
					
					flow.insert( key, from )
					
					words.shift()
					++ from
					++ to
					
				} else if( words.length < to - from ) {
					
					flow.cut( token_ids[ from ] )
					-- to
					
				} else {
					
					tokens.for( token_ids[ from ] ).str( next )
					++ from
					words.shift()
					
				}
				
			}
			
			return this
		}
		
		write( text: string, offset = -1, count = 0  ) {
			
			if( offset < 0 ) return this.splice_line( null, this.root.items_internal.length, 0, text )
			
			const flow = this.for( 'flow' ).for( null )
			const token_ids = flow.items_internal
			const tokens = this.for( 'token' )
			
			let from = 0
			let word = ''
			
			while( true ) {
				if( from >= token_ids.length ) break
				word = tokens.for( token_ids[ from ] ).str()!
				if( offset <= word.length ) {
					text = word.slice( 0, offset ) + text
					count += offset
					break
				}
				offset -= word.length
				from ++
			}
			
			let to = from
			
			while( true ) {
				if( to >= token_ids.length ) break
				word = tokens.for( token_ids[ to ] ).str()!
				to ++
				if( count < word.length ) {
					text = text + word.slice( count )
					break
				}
				count -= word.length
			}
			
			this.splice_line( null, from, to, text )
			
			return this			
		}
		
	}
	
}
