namespace $ {
	
	export class $hyoo_crowd_dict extends $hyoo_crowd_node {
		
		keys( next?: string[] ) {
			
			const prev = this.units()
			if( !next ) return prev.map( unit => String( unit.data ) )

			$mol_reconcile({
				prev,
				from: 0,
				to: prev.length,
				next,
				equal: ( next, prev )=> prev.data === next,
				drop: ( prev, lead )=> this.land.wipe( prev ),
				insert: ( next, lead )=> this.land.put(
					this.head,
					$mol_int62_hash_string( next, this.head.hi, this.head.lo ),
					lead?.self() ?? { lo: 0, hi: 0 },
					next,
				),
			})
			
			return next
		}
		
		sub< Node extends typeof $hyoo_crowd_node >( key: string, Node: Node ) {
			this.add( key )
			return new Node( this.land, $mol_int62_hash_string( key, this.head.hi, this.head.lo ) ) as InstanceType< Node >
		}
		
		has( key: string ) {
			
			for( const unit of this.units() ) {
				if( unit.data === key ) return true 
			}
			
			return false
		}
		
		add( key: string ) {
			if( this.has( key ) ) return
			this.keys([ ... this.keys(), key ])
		}
		
		drop( key: string ) {
			
			for( const unit of this.units() ) {
				if( unit.data !== key ) continue
				this.land.wipe( unit )
			}
			
		}
		
	}
}
