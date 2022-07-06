namespace $ {
	export class $hyoo_crowd_list extends $hyoo_crowd_node {
		
		/** Data list representation. */
		list( next?: readonly unknown[] ) {
			
			const chunks = this.chunks()
			
			if( next === undefined ) {
				return chunks.map( chunk => chunk.data )
			} else {
				this.insert( next, 0, chunks.length )
				return next
			}
			
		}
		
		// set( next?: ReadonlySet< string | number | boolean | null > ) {
			
		// 	const dict = new Map< unknown, $hyoo_crowd_chunk >()
			
		// 	for( const chunk of this.chunks() ) {
		// 		const p = dict.get( chunk.data )
		// 		if( p && $hyoo_crowd_chunk_compare( p, chunk ) > 0 ) continue
		// 		dict.set( chunk.data, chunk )
		// 	}
			
		// 	const prev = new Set( dict.keys() ) as ReadonlySet< string | number | boolean | null >
			
		// 	if( !next ) return prev
			
		// 	$mol_reconcile({
		// 		prev: [ ... prev.keys() ],
		// 		0,
		// 		prev.size,
		// 		[ ... next ],
		// 		equal: ( next, prev )=> prev.data === next,
		// 		drop: ( prev, lead )=> this.doc.wipe( prev ),
		// 		insert: ( next, lead )=> this.doc.put(
		// 			this.head,
		// 			$mol_hash_string( next, this.head ),
		// 			lead?.self ?? 0,
		// 			next,
		// 		),
		// 		update: ( next, prev, lead )=> this.doc.put(
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
			from = this.chunks().length,
			to = from,
		) {
			
			$mol_reconcile({
				prev: this.chunks(),
				from,
				to,
				next,
				equal: ( next, prev )=> prev.data === next,
				drop: ( prev, lead )=> this.doc.wipe( prev ),
				insert: ( next, lead )=> {
					const [ self_hi, self_lo ] = this.doc.id_new()
					return this.doc.put(
						this.head_hi,
						this.head_lo,
						self_hi,
						self_lo,
						lead?.self_hi ?? 0,
						lead?.self_lo ?? 0,
						next,
					)
				},
				update: ( next, prev, lead )=> this.doc.put(
					prev.head_hi,
					prev.head_lo,
					prev.self_hi,
					prev.self_lo,
					lead?.self_hi ?? 0,
					lead?.self_lo ?? 0,
					next,
				),
			})
			
		}
		
		move(
			from: number,
			to: number,
		) {
			
			const chunks = this.chunks()
			const lead = to ? chunks[ to - 1 ] : null
			
			return this.doc.move( chunks[ from ], this.head_hi, this.head_lo, lead?.self_hi ?? 0, lead?.self_lo ?? 0 )
			
		}
		
		cut( seat: number ) {
			return this.doc.wipe( this.chunks()[ seat ] )
		}
		
	}
}
