namespace $ {
	
	type Json =
	| null | boolean | number | string | Json[]
	| {
		[ key in string ]: Json
	}
	
	export class $hyoo_crowd_json extends $hyoo_crowd_node {
		
		json( next?: Json ) {
			
			if( next === undefined ) {
				
				const reg = this.as( $hyoo_crowd_reg )
				const val = reg.value()
				
				if( Array.isArray( val ) ) {
					return this.nodes( $hyoo_crowd_json ).map( node => node.json() )
				}
				
				if( val && typeof val === 'object' ) {
					const res = {}
					for( const key of this.nodes( $hyoo_crowd_reg ) ) {
						reg[ key.str() ] = key.as( $hyoo_crowd_json ).json()
					}
					return res
				}
				
				return val ?? null
				
			} else {
				
				
			}
			
		}
		
	}
}
