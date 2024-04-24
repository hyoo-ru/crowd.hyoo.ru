namespace $ {
	
	/** Stateless non-unique adapter to CROWD Tree for given Head. */
	export class $hyoo_crowd_node extends $mol_object2 {
		
		constructor(
			readonly land = new $hyoo_crowd_land,
			readonly head: $mol_int62_string = '0_0',
		) { super() }
		
		static for< Node extends typeof $hyoo_crowd_node >(
			this: Node,
			land: $hyoo_crowd_land,
			head: $mol_int62_string,
		) {
			return new this( land, head ) as InstanceType< Node >
		}
		
		static toJSON() {
			return this.name
		}
		
		id() {
			return this.head === '0_0'
				? this.land.id()
				: `${ this.land.id() }!${ this.head }` as $hyoo_crowd_unit_id
		}
		
		world() {
			return this.land.world()
		}
		
		/** Returns another representation of this node. */
		as< Node extends typeof $hyoo_crowd_node >( Node: Node ) {
			return this.world()?.Fund( Node ).Item( `${ this.land.id() }!${ this.head }` ) ?? new Node( this.land, this.head ) as InstanceType< Node >
		}
		
		/** Ordered inner alive Units. */
		@ $mol_mem
		units() {
			return this.land.unit_alives( this.head )
		}
		
		/** Ordered inner alive Node. */
		@ $mol_mem_key
		nodes< Node extends typeof $hyoo_crowd_node >( Node: Node ) {
			const fund = this.world()?.Fund( Node )
			return this.units().map( unit => fund?.Item( `${ this.land.id() }!${ unit.self }` ) ?? new Node( this.land, unit.self ) as InstanceType< Node > )
		}
		
		/** Returns true when node value is never changed. */
		virgin() {
			return this.land.unit_list( this.head ).length === 0
		}
		
		[ Symbol.toPrimitive ]() {
			return `${ this.constructor.name }("${ this.land.id() }","${ this.head }")`
		}
		
		toJSON() {
			return this.id()
		}
		
		[ $mol_dev_format_head ]() {
			return $mol_dev_format_span( {} ,
				$mol_dev_format_native( this ) ,
				$mol_dev_format_shade( ':' ) ,
				$mol_dev_format_auto( this.land.unit_list( this.head ) ) ,
			)
		}
		
	}
	
}
