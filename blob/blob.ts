namespace $ {
	export class $hyoo_crowd_blob extends $hyoo_crowd_list {
		
		/**
		 * URI to Blob.
		 * @todo persistent uri instead of temporary
		 */
		uri() {
			return URL.createObjectURL( this.blob() )
		}
		
		/** Mime type */
		type( next?: string ) {
			return this.as( $hyoo_crowd_struct ).sub( 'type', $hyoo_crowd_reg ).str( next )
		}
		
		/** Blob, File etc. */
		blob( next?: Blob ) {
			
			if( next ) {
				this.buffer( new Uint8Array( $mol_wire_sync( next ).arrayBuffer() ) )
				this.type( next.type )
				return next
			}
			
			return new Blob( this.list() as Uint8Array[], {
				type: this.type(),
			} )
			
		}
		
		/** Solid byte buffer. */
		buffer( next?: Uint8Array ) {
			
			if( next ) {
				
				const chunks = [] as Uint8Array[]
				
				let offset = 0
				while( offset < next.byteLength ) {
					const cut = offset + 2**15
					chunks.push( next.slice( offset, cut ) )
					offset = cut
				}
				
				this.list( chunks )
				
				return next
				
			} else {
				
				const chunks = this.list() as Uint8Array[]
				const size = chunks.reduce( ( sum, chunk )=> sum + chunk.byteLength, 0 )
				const res = new Uint8Array( size )
				
				let offset = 0
				for( const chunk of chunks ) {
					res.set( chunk, offset )
					offset += chunk.byteLength
				}
				
				return res
				
			}
			
		}
		
	}
}
