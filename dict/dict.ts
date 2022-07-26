namespace $ {
	
	export class $hyoo_crowd_dict extends $hyoo_crowd_node {
		
		keys( next?: string[] ) {
			return this.as( $hyoo_crowd_list ).list( next ).map( String )
		}
		
		sub< Node extends typeof $hyoo_crowd_node >( key: string, Node: Node ) {
			return new Node( this.doc, $mol_int62_hash_string( key, this.head.hi, this.head.lo ) ) as InstanceType< Node >
		}
		
	}
}
