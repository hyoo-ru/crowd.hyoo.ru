namespace $ {
	
	export class $hyoo_crowd_struct extends $hyoo_crowd_node {
		
		/** Returns inner node for key. */
		sub< Node extends typeof $hyoo_crowd_node >( key: string, Node: Node ) {
			return new Node( this.land, $mol_int62_hash_string( key, this.head.lo, this.head.hi ) ) as InstanceType< Node >
		}
		
	}
}
