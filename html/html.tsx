/** @jsx $mol_jsx */
/** @jsxFrag $mol_jsx_frag */
namespace $ {
	export class $hyoo_crowd_html extends $hyoo_crowd_node {
		
		html( next?: string ) {
			
			const dom = this.as( $hyoo_crowd_dom )
			
			if( next === undefined ) {
				return $mol_dom_serialize( <body>{ dom.dom() }</body> )
			} else {
				dom.dom( $mol_dom_parse( next ).documentElement )
				return next
			}
			
		}
		
	}
}
