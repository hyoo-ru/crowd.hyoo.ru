namespace $ {
	
	export class $hyoo_crowd_struct extends $hyoo_crowd_node {
		
		/** Returns inner node for key. */
		sub< Node extends typeof $hyoo_crowd_node >( key: string, Node: Node ) {
			return new Node( this.land, $mol_int62_hash_string( key + '\n' + this.head ) ) as InstanceType< Node >
		}
		
		yoke< Node extends typeof $hyoo_crowd_node >(
			key: string,
			Node: Node,
			king_level: $hyoo_crowd_peer_level,
			base_level: $hyoo_crowd_peer_level,
		) {
			const land = this.sub( key, $hyoo_crowd_reg ).yoke( king_level, base_level )
			return land?.chief.sub( key, Node ) ?? null
		}
		
	}
}
