namespace $ {
	
	type Json = {
		[ key in string ]: null | boolean | number | string | Json | ( null | boolean | number | string | Json )[]
	}
	
	export class $hyoo_crowd_json extends $hyoo_crowd_dict {
		
		json( next?: Json ): Json {
			
			const reg = this.as( $hyoo_crowd_reg )
			
			if( next === undefined ) {
				
				const res = {}
				for( const unit of this.units() ) {
					
					const key = unit.data as string
					const kid = this.sub( key, $hyoo_crowd_reg )
					const val = kid.value()
					
					if( Array.isArray( val ) ) {
						res[ key ] = kid.nodes( $hyoo_crowd_list )[0].list()
					} else if( val && typeof val === 'object' ) {
						res[ key ] = kid.nodes( $hyoo_crowd_json )[0].json()
					} else {
						res[ key ] = val
					}
					
				}
				return res
				
			} else {
				
				const keys = Object.keys( next )
				this.keys( keys )
				
				for( const key of keys ) {
					
					const val = next[ key ]
					const kid = this.sub( key, $hyoo_crowd_reg )
					
					if( Array.isArray( val ) ) {
						kid.value( [] )
						kid.nodes( $hyoo_crowd_list )[0].list( val as Json[] )
					} else if( val && typeof val === 'object' ) {
						kid.value( {} )
						kid.nodes( $hyoo_crowd_json )[0].json( val as Json )
					} else {
						kid.value( val )
					}
					
				}
				
				return next
			}
			
		}
		
	}
}
