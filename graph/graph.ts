namespace $ {
	
	export class $hyoo_crowd_graph extends $hyoo_crowd_dict.of({
		val: $hyoo_crowd_union.of({
			atom: $hyoo_crowd_reg,
			text: $hyoo_crowd_text, // tokenized text
			edge: $hyoo_crowd_list, // list of item id
			// dict: $hyoo_crowd_set, // set of field names
		})
	}) {
		
		value( key: string, next?: $hyoo_crowd_delta_value | string[] ) {
			
			const store = this.for( key )
			
			if( next === undefined ) {
				return ( store.as('edge')?.items() as string[] )
					?? store.as('text')?.text()
					?? store.as('atom')?.value()
					?? null
			} else {
				if( Array.isArray( next ) ) store.to('edge').items( next )
				else if( typeof next === 'string' ) store.to('text').text( next )
				else store.to('atom').value( next )
				return next
			}
			
		}
		
		bool( key: string, next? : boolean ) {
			return this.for( key ).to( 'atom' ).bool( next )
		}
		
		numb( key: string, next? : number ) {
			return this.for( key ).to( 'atom' ).numb( next )
		}
		
		text( key: string, next? : string ) {
			return this.for( key ).to( 'text' ).text( next )
		}
		
		edge( key: string, next? : string[] ) {
			return this.for( key ).to( 'edge' ).items( next )
		}
		
	}

}
