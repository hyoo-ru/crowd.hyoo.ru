namespace $ {
	export class $hyoo_crowd_reg extends $hyoo_crowd_node {
		
		/** Atomic value. */
		value( next?: unknown ) {
			
			const chunks = this.chunks()
			let last
			
			for( const chunk of chunks ) {
				if( !last || $hyoo_crowd_chunk_compare( chunk, last ) > 0 ) last = chunk
			}
			
			if( next === undefined ) {
				
				return last?.data ?? null
				
			} else {
				
				if( last?.data === next ) return next
				
				for( const chunk of chunks ) {
					if( chunk === last ) continue
					this.doc.wipe( chunk )
				}
				
				const self = last?.self() ?? this.doc.id_new()
				
				this.doc.put(
					this.head,
					self,
					{ lo: 0, hi: 0 },
					next,
				)
			
				return next
			}
			
		}
		
		/** Atomic string. */
		str( next?: string ) {
			return String( this.value( next ) ?? '' )
		}
		
		/** Atomic number. */
		numb( next?: number ) {
			return Number( this.value( next ) ?? 0 )
		}
		
		/** Atomic boolean. */
		bool( next?: boolean ) {
			return Boolean( this.value( next ) ?? false )
		}
		
	}
}
