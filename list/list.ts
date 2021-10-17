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
					lead?.self ?? 0,
					next,
				),
				update: ( next, prev, lead )=> this.doc.put(
					prev.head,
					prev.self,
					lead?.self ?? 0,
					next,
				),
			})
			
		}
		
		move(
			from: number,
			to: number,
		) {
			
			const chunks = this.chunks()
			const lead = to ? chunks[ to - 1 ].self : 0
			
			return this.doc.move( chunks[ from ], this.head, lead )
			
		}
		
		cut( seat: number ) {
			return this.doc.wipe( this.chunks()[ seat ] )
		}
		
	}
}
