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
		
		// set( next?: ReadonlySet< string | number | boolean | null > ) {
			
		// 	const dict = new Map< unknown, $hyoo_crowd_unit >()
			
		// 	for( const uint of this.uints() ) {
		// 		const p = dict.get( unit.data )
		// 		if( p && $hyoo_crowd_unit_compare( p, unit ) > 0 ) continue
		// 		dict.set( unit.data, unit )
		// 	}
			
		// 	const prev = new Set( dict.keys() ) as ReadonlySet< string | number | boolean | null >
			
		// 	if( !next ) return prev
			
		// 	$mol_reconcile({
		// 		prev: [ ... prev.keys() ],
		// 		0,
		// 		prev.size,
		// 		[ ... next ],
		// 		equal: ( next, prev )=> prev.data === next,
		// 		drop: ( prev, lead )=> this.land.wipe( prev ),
		// 		insert: ( next, lead )=> this.land.put(
		// 			this.head,
		// 			$mol_hash_string( next, this.head ),
		// 			lead?.self ?? 0,
		// 			next,
		// 		),
		// 		update: ( next, prev, lead )=> this.land.put(
		// 			prev.head,
		// 			prev.self,
		// 			lead?.self ?? 0,
		// 			next,
		// 		),
		// 	})
			
		// 	return next
		// }
		
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
				equal: ( next, prev )=> prev.data === next,
				drop: ( prev, lead )=> this.land.wipe( prev ),
				insert: ( next, lead )=> this.land.put(
					this.head,
					this.land.id_new(),
					lead?.self() ?? { lo: 0, hi: 0 },
					next,
				),
				update: ( next, prev, lead )=> this.land.put(
					prev.head(),
					prev.self(),
					lead?.self() ?? { lo: 0, hi: 0 },
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
			
			return this.land.move( units[ from ], this.head, lead?.self() ?? { lo: 0, hi: 0 } )
			
		}
		
		cut( seat: number ) {
			return this.land.wipe( this.units()[ seat ] )
		}
		
	}
}
