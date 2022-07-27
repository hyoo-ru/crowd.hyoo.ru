/** @jsx $mol_jsx */
/** @jsxFrag $mol_jsx_frag */
namespace $ {
	
	/** Stateless non-unique adapter to CROWD Tree for given Head. */
	export class $hyoo_crowd_node {
		
		constructor(
			readonly doc: $hyoo_crowd_doc,
			readonly head: $mol_int62_pair,
		) {}
		
		static for< Node extends typeof $hyoo_crowd_node >(
			this: Node,
			doc: $hyoo_crowd_doc,
			head: $mol_int62_pair,
		) {
			return new this( doc, head ) as InstanceType< Node >
		}
		
		/** Returns another representation of this node. */
		as< Node extends typeof $hyoo_crowd_node >( Node: Node ) {
			return new Node( this.doc, this.head ) as InstanceType< Node >
		}
		
		/** Ordered inner alive Units. */
		units() {
			return this.doc.unit_alives( this.head )
		}
		
		/** Ordered inner alive Node. */
		nodes< Node extends typeof $hyoo_crowd_node >( Node: Node ) {
			return this.units().map( unit => new Node( this.doc, unit.self() ) as InstanceType< Node > )
		}
		
		[ $mol_dev_format_head ]() {
			return $mol_dev_format_span( {} ,
				$mol_dev_format_native( this ) ,
				$mol_dev_format_shade( '/' ) ,
				$mol_dev_format_auto( this.as( $hyoo_crowd_list ).list() ) ,
				$mol_dev_format_shade( '/' ) ,
				$mol_dev_format_auto( this.nodes( $hyoo_crowd_node ) ) ,
			)
		}
		
	}
	
}
