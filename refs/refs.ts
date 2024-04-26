namespace $ {

	export class $hyoo_crowd_refs<Item extends typeof $hyoo_crowd_node> extends $hyoo_crowd_list {
		
		static Make<Item extends typeof $hyoo_crowd_node>(Item: Item) {
			return class $hyoo_crowd_refs_maked extends $hyoo_crowd_refs<Item> {
				Item = Item
			}
		}

		Item: Item = $hyoo_crowd_node as Item

		@ $mol_mem
		fund() {
			return this.world()!.Fund( this.Item)
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

		@ $mol_mem
		items() {
			return this.ids().map( id => this.item( id ) )
		}

		@ $mol_action
		push(item: InstanceType<Item>) {
			this.add(item.id())
		}

		@ $mol_action
		make(
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
