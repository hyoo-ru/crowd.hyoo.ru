namespace $ {
	export class $hyoo_crowd_struct extends $hyoo_crowd_node {
		
		/** Returns inner node for key. */
		sub< Node extends typeof $hyoo_crowd_node >( key: string, Node: Node ) {
			return new Node( this.doc, $mol_hash_string( key, this.head ) ) as InstanceType< Node >
		}
		
	}
}
