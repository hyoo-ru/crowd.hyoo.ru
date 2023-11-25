namespace $ {
	
	/** Registry of nodes as domain entities. */
	export class $hyoo_crowd_fund< Node extends typeof $hyoo_crowd_node > extends $mol_object {
		
		Node: Node
		
		constructor(
			public world: $hyoo_crowd_world,
			Node: Node,
		) {
			super()
			this.Node = Node
		}
		
		@ $mol_mem_key
		Item( id: $mol_int62_string | `${$mol_int62_string}!${$mol_int62_string}` ): InstanceType<Node> {
			const [ land, head ] = id.split( '!' ) as [ $mol_int62_string, $mol_int62_string | undefined ]
			if( !head ) return this.Item( `${land}!0_0` )
			return this.world.land_sync( land ).node( head, this.Node )
		}
		
		@ $mol_action
		make(
			law = [''] as readonly ( $mol_int62_string | '' )[],
			mod = [] as readonly ( $mol_int62_string | '' )[],
			add = [] as readonly ( $mol_int62_string | '' )[],
		) {
			const land = $mol_wire_sync( this.world ).grab( law, mod, add )
			return this.Item( land.id() )
		}
		
	}
	
}
