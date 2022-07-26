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
				insert: ( next, lead )=> this.doc.put(
					this.head,
					this.doc.id_new(),
					lead?.self() ?? { lo: 0, hi: 0 },
					next,
				),
				update: ( next, prev, lead )=> this.doc.put(
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
			
			const chunks = this.chunks()
			const lead = to ? chunks[ to - 1 ] : null
			
			return this.doc.move( chunks[ from ], this.head, lead?.self() ?? { lo: 0, hi: 0 } )
			
		}
		
		cut( seat: number ) {
			return this.doc.wipe( this.chunks()[ seat ] )
		}
		
	}
}
