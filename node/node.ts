namespace $ {
	
	/** Stateless non-unique adapter to CROWD Tree for given Head. */
	export class $hyoo_crowd_node extends Object {
		
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
		
		world() {
			return this.land.world()
		}
		
		/** Returns another representation of this node. */
		as< Node extends typeof $hyoo_crowd_node >( Node: Node ) {
			return new Node( this.land, this.head ) as InstanceType< Node >
		}
		
		/** Ordered inner alive Units. */
		units() {
			return this.land.unit_alives( this.head )
		}
		
		/** Ordered inner alive Node. */
		nodes< Node extends typeof $hyoo_crowd_node >( Node: Node ) {
			return this.units().map( unit => new Node( this.land, unit.self ) as InstanceType< Node > )
		}
		
		/** Returns true when node value is never changed. */
		virgin() {
			return this.land.unit_list( this.head ).length === 0
		}
		
		[ Symbol.toPrimitive ]() {
			return `${ this.constructor.name }("${ this.land.id() }","${ this.head }")`
		}
		
		[ $mol_dev_format_head ]() {
			return $mol_dev_format_span( {} ,
				$mol_dev_format_native( this ) ,
				$mol_dev_format_shade( '/' ) ,
				$mol_dev_format_auto( this.units().map( unit => unit.data ) ) ,
				$mol_dev_format_shade( '/' ) ,
				$mol_dev_format_auto( this.nodes( $hyoo_crowd_node ) ) ,
			)
		}
		
	}
	
}
