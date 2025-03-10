namespace $ {
	export class $hyoo_crowd_list extends $hyoo_crowd_node {
		
		/** Data list representation. */
		list( next?: readonly unknown[] ) {
			
			const units = this.units()
			
			if( next === undefined ) {
				return units.map( unit => unit.data )
			} else {
				this.insert( next, 0, units.length )
				return next
			}
			
		}
		
		@ $mol_mem
		set( next?: ReadonlySet< string | number | boolean | null > ) {
			return new Set( this.list( next && [ ... next ] ) )
		}
		
		insert(
			next: readonly unknown[],
			from = this.units().length,
			to = from,
		) {
			
			$mol_reconcile({
				prev: this.units(),
				from,
				to,
				next,
				equal: ( next, prev )=> $mol_compare_deep( prev.data, next ),
				drop: ( prev, lead )=> this.land.wipe( prev ),
				insert: ( next, lead )=> this.land.put(
					this.head,
					this.land.id_new(),
					lead?.self ?? '0_0',
					next,
				),
				replace: ( next, prev, lead )=> this.land.put(
					prev.head,
					prev.self,
					lead?.self ?? '0_0',
					next,
				),
			})
			
		}
		
		move(
			from: number,
			to: number,
		) {
			
			const units = this.units()
			const lead = to ? units[ to - 1 ] : null
			
			this.land.move( units[ from ], this.head, lead?.self ?? '0_0' )
			
		}
		
		cut( seat: number ) {
			return this.land.wipe( this.units()[ seat ] )
		}
		
		has( val: string | number | boolean | null, next?: boolean ) {
			
			if( next === undefined ) {
				
				for( const unit of this.units() ) {
					if( unit.data === val ) return true 
				}
				
				return false
			}
			
			if( next ) this.add( val )
			else this.drop( val )

			return next
		}
		
		add( val: string | number | boolean | null ) {
			if( this.has( val ) ) return
			this.insert([ val ])
		}
		
		drop( val: string | number | boolean | null ) {
			
			for( const unit of this.units() ) {
				if( unit.data !== val ) continue
				this.land.wipe( unit )
			}
			
		}
		
		node_make< Node extends typeof $hyoo_crowd_node >( val: unknown, Node: Node ) {
			this.insert([ val ])
			const unit = this.units().at(-1)!
			return this.land.node( unit.self, Node )
		}
		
	}
}
