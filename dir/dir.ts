namespace $ {
	export class $hyoo_crowd_dir extends Object {
		
		constructor(
			readonly peer: $hyoo_crowd_peer
		) {
			super()
		}
		
		nests = new Map< string, $hyoo_crowd_doc >()
		
		nest( hi: number, lo: number  ) {
			
			const key = $mol_int62_dump( hi, lo )
			
			const exists = this.nests.get( key )
			if( exists ) return exists
			
			const nest = new $hyoo_crowd_doc( hi, lo, this.peer )
			this.nests.set( key, nest )
			
			return nest
		}
		
		file( path: string ) {
			const [ hi, lo ] = $mol_int62_hash_string( path )
			return this.nest( hi, lo )
		}
		
		signs = new WeakMap< $hyoo_crowd_chunk, Uint8Array >()
		
		async *delta( clock = new $hyoo_crowd_clock ) {
			
			for( const doc of this.nests.values() ) {
				
				const chunks = doc.delta( clock )
				if( !chunks.length ) continue
				
				let size = 0
				
				for( const chunk of chunks ) {
					
					const bin = $hyoo_crowd_chunk_bin.from( chunk )
					
					const sign = this.signs.get( chunk )
						?? new Uint8Array( await this.peer.private!.sign( bin.sens() ) )
					
					bin.sign( sign )
					this.signs.set( chunk, sign )
					
					yield new Uint8Array( bin.buffer )
					
					size += bin.byteLength
					if( size > 2 ** 15 ) break
					
				}
				
			}
			
		}
		
		async apply(
			delta: Uint8Array,
		) {
			
			const broken = [] as [ $hyoo_crowd_chunk, Error ][]
			
			const buf_view = new DataView( delta.buffer, delta.byteOffset, delta.byteLength )
			
			let bin_offset = 0
			while( bin_offset < delta.byteLength ) {
				
				const data_size = Math.abs( buf_view.getInt16( $hyoo_crowd_chunk_bin_size_offset ) )
				const bin_size = $hyoo_crowd_chunk_bin_meta_size + data_size
				const bin = new $hyoo_crowd_chunk_bin( delta.buffer, bin_offset, bin_size )
				
				const chunk = bin.chunk()
				
				apply: {
					
					const nest = this.nest( chunk.nest_hi, chunk.nest_lo )
					
					try {
						await this.audit( nest, chunk, bin )
					} catch( error: any ) {
						broken.push([ chunk, error ])
						break apply
					}
				
					nest.apply([ chunk ])
					
				}
				
				bin_offset += Math.ceil( bin_size / 8 ) * 8
			}
			
			
			return broken
		}
		
		async audit(
			nest: $hyoo_crowd_doc,
			chunk: $hyoo_crowd_chunk,
			bin: $hyoo_crowd_chunk_bin,
		) {
				
			const desync = 60 * 60
			const now_hi = nest.clock.now()[0]
			
			if( chunk.time_hi > now_hi + desync ) {
				$mol_fail( new Error( 'Far future' ) )
			}
			
			let key_buf: Uint8Array
			const key_chunk = nest.chunk( chunk.peer_hi, chunk.peer_lo, chunk.peer_hi, chunk.peer_lo )
				
			if( $hyoo_crowd_chunk_auth( chunk ) ) {
				
				if( key_chunk ) {
					$mol_fail( new Error( 'Already auth' ) )
				}
				
				if(!( chunk.data instanceof Uint8Array )) {
					$mol_fail( new Error( 'No auth key' ) )
				}
				
				key_buf = chunk.data
				
				const [ self_hi, self_lo ] = $mol_int62_hash_buffer( key_buf )
				
				if( chunk.self_hi !== self_hi || chunk.self_lo !== self_lo ) {
					$mol_fail( new Error( 'Alien auth key' ) )
				}

			} else {
				
				if( !key_chunk ) {
					$mol_fail( new Error( 'Unknown peer' ) )
				}
				
				key_buf = key_chunk.data as Uint8Array
				
			}
			
			const key = await $mol_crypto_auditor_public.from( key_buf )
			const valid = await key.verify( bin.sens(), bin.sign() )
			
			if( !valid ) {
				$mol_fail( new Error( 'Wrong sign' ) )
			}
			
		}
		
	}
}
