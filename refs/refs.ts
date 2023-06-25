namespace $ {

	export class $hyoo_crowd_refs<Node extends typeof $hyoo_crowd_node> extends $hyoo_crowd_list {
		
		Node: Node = $hyoo_crowd_node as Node

		@ $mol_mem
		fund() {
			return this.world()!.Fund( this.Node)
		}

		@ $mol_mem_key
		item( id: $mol_int62_string ) {
			return this.fund().Item( id! )
		}

		@ $mol_mem
		ids() {
			const ids = this.list()
			return ids
				.map( id => $mol_int62_string_ensure( id ) )
				.filter( $mol_guard_defined )
		}

		size() {
			return this.ids().length
		}

		@ $mol_mem
		all() {
			return this.ids().map( id => this.item( id ) )
		}

		@ $mol_action
		new(
			law = [''] as readonly ( $mol_int62_string | '' )[],
			mod = [] as readonly ( $mol_int62_string | '' )[],
			add = [] as readonly ( $mol_int62_string | '' )[],
		) {
			const obj = this.fund().make(law, mod, add)
			this.add(obj.id())
			return obj
		}
		
	}


}
