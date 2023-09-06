namespace $ {

	export class $hyoo_crowd_ref extends $hyoo_crowd_reg {
		
		Item<Node extends typeof $hyoo_crowd_node>(sup: Node, next?: InstanceType<Node>) {
			const str = this.str( next && next.head )
			const id = $mol_int62_string_ensure( str )
			return id ? this.world()?.Fund( sup ).Item( id ) : null
		}
		
	}


}
