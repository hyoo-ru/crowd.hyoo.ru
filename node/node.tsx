/** @jsx $mol_jsx */
/** @jsxFrag $mol_jsx_frag */
namespace $ {
	
	/** Stateless non-unique adapter to CROWD Tree for given Head. */
	export class $hyoo_crowd_node {
		
		constructor(
			readonly doc: $hyoo_crowd_doc,
			readonly head_hi: number,
			readonly head_lo: number,
		) {}
		
		static for< Node extends typeof $hyoo_crowd_node >(
			this: Node,
			doc: $hyoo_crowd_doc,
			head_hi: number,
			head_lo: number,
		) {
			return new this( doc, head_hi, head_lo ) as InstanceType< Node >
		}
		
		/** Returns another representation of this node. */
		as< Node extends typeof $hyoo_crowd_node >( Node: Node ) {
			return new Node( this.doc, this.head_hi, this.head_lo ) as InstanceType< Node >
		}
		
		/** Ordered inner alive Chunks. */
		chunks() {
			return this.doc.chunk_alive( this.head_hi, this.head_lo )
		}
		
		/** Ordered inner alive Node. */
		nodes< Node extends typeof $hyoo_crowd_node >( Node: Node ) {
			return this.chunks().map( chunk => new Node( this.doc, chunk.self_hi, chunk.self_lo ) as InstanceType< Node > )
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
