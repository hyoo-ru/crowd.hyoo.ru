namespace $ {
	
	export class $hyoo_crowd_set extends $hyoo_crowd_node {
		
		items( next?: string[] ) {
			return this.as( $hyoo_crowd_list ).list( next ).map( String )
		}
		
		sub< Node extends typeof $hyoo_crowd_node >( key: string, Node: Node ) {
			return new Node( this.land, $mol_hash_string( key, this.head ) ) as InstanceType< Node >
		}
		
	}
}
