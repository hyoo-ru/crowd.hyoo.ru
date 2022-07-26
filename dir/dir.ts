namespace $ {
	export class $hyoo_crowd_dir extends Object {
		
		constructor(
			readonly peer: $hyoo_crowd_peer
		) {
			super()
			this._knights.set( peer.id , peer )
		}
		
		_lands = new $mol_dict<
			$mol_int62_pair,
			$hyoo_crowd_doc
		>()
		
		land(
			id: $mol_int62_pair,
		) {
			
			const exists = this._lands.get( id )
			if( exists ) return exists
			
			const land = new $hyoo_crowd_doc( id, this.peer )
			this._lands.set( id, land )
			
			return land
		}
		
		file( lord: $mol_int62_pair, path: string ) {
			return this.land( $mol_int62_hash_string( path ) )		
		}
		
		_knights = new $mol_dict<
			$mol_int62_pair,
			$hyoo_crowd_peer
		>()
		
		_signs = new WeakMap< $hyoo_crowd_chunk, Uint8Array >()
		
		async grab() {
			
			const knight = await $hyoo_crowd_peer.generate()
			this._knights.set( knight.id, knight )
			
			const land_outer = new $hyoo_crowd_doc( knight.id, knight )
			land_outer.level( this.peer.id, $hyoo_crowd_peer_level.law )
			
			const land_inner = this.land( land_outer.id )
			land_inner.apply( land_outer.delta() )
			
			return land_inner
		}
		
		async *delta( clock = new $hyoo_crowd_clock ) {
			
			for( const doc of this._lands.values() ) {
				
				const chunks = doc.delta( clock )
				if( !chunks.length ) continue
				
				let size = 0
				// const bins = [] as $hyoo_crowd_chunk_bin[]
				
				for( const chunk of chunks ) {
					
					const bin = $hyoo_crowd_chunk_bin.from( chunk )
					
					let sign = this._signs.get( chunk )
					if( !sign ) {
						const knight = this._knights.get( chunk.auth() )!
						sign = new Uint8Array( await knight.key_private.sign( bin.sens() ) )
					}
					
					bin.sign( sign )
					this._signs.set( chunk, sign )
					
					// bins.push( bin )
					yield new Uint8Array( bin.buffer )
					size += bin.byteLength
					if( size > 2 ** 15 ) break
					
				}
				
				// const delta = new Uint8Array( size )
				
				// let offset = 0
				// for( const bin of bins ) {
				// 	delta.set( new Uint8Array( bin.buffer ), offset )
				// 	offset += bin.byteLength
				// }
				
				// yield delta				
			}
			
		}
		
		async apply(
			delta: Uint8Array,
		) {
			
			const broken = [] as [ $hyoo_crowd_chunk, string ][]
			
			let bin_offset = 0
			while( bin_offset < delta.byteLength ) {
				
				const bin = new $hyoo_crowd_chunk_bin( delta.buffer, bin_offset )
				const chunk = bin.chunk()
				const land = this.land( chunk.land() )
				
				apply: {
					
					try {
						await this.audit( land, chunk, bin )
					} catch( error: any ) {
						broken.push([ chunk, error.message ])
						break apply
					}
				
					land.apply([ chunk ])
					
				}
				
				bin_offset += bin.size()
				
			}
			
			
			return broken
		}
		
		async audit(
			land: $hyoo_crowd_doc,
			chunk: $hyoo_crowd_chunk,
			bin: $hyoo_crowd_chunk_bin,
		) {
				
			const desync = 60 * 60 // 1 hour
			const deadline = land.clock.now() + desync
			
			if( chunk.time > deadline ) {
				$mol_fail( new Error( 'Far future' ) )
			}
			
			const auth_chunk = land.chunk( chunk.auth(), chunk.auth() )
			const kind = chunk.kind()
			
			switch( kind ) {
				
				case 'join': {
				
					if( auth_chunk ) {
						$mol_fail( new Error( 'Already join' ) )
					}
					
					if(!( chunk.data instanceof Uint8Array )) {
						$mol_fail( new Error( 'No join key' ) )
					}
					
					const key_buf = chunk.data
					const self = $mol_int62_hash_buffer( key_buf )
					
					if( chunk.self_lo !== self.lo || chunk.self_hi !== self.hi ) {
						$mol_fail( new Error( 'Alien join key' ) )
					}
					
					const key = await $mol_crypto_auditor_public.from( key_buf )
					const sign = bin.sign()
					const valid = await key.verify( bin.sens(), sign )
					
					if( !valid ) {
						$mol_fail( new Error( 'Wrong join sign' ) )
					}
					
					this._signs.set( chunk, sign )

					return
				}
				
				case 'give': {
					
					const king_chunk = land.chunk( land.id, land.id )
					
					if( !king_chunk ) {
						$mol_fail( new Error( 'No king' ) )
					}
					
					const give_chunk = land.chunk( land.id, chunk.self() )
					
					if( give_chunk?.level() as number > chunk.level() ) {
						$mol_fail( new Error( `Revoke unsupported` ) )
					}
					
					if( chunk.auth_lo === king_chunk.auth_lo && chunk.auth_hi === king_chunk.auth_hi ) break
					
					const lord_chunk = land.chunk( land.id, chunk.auth() )
					
					if( lord_chunk?.level() !== $hyoo_crowd_peer_level.law ) {
						$mol_fail( new Error( `Need law level` ) )
					}
					
					break
				}
				
				case 'data': {
				
					const king_chunk = land.chunk( land.id, land.id )
					
					if( !king_chunk ) {
						$mol_fail( new Error( 'No king' ) )
					}
					
					if( chunk.auth_lo === king_chunk.auth_lo && chunk.auth_hi === king_chunk.auth_hi ) break
					
					const give_chunk = land.chunk( land.id, chunk.auth() )
					const level = give_chunk?.level() ?? $hyoo_crowd_peer_level.get
					
					if( level >= $hyoo_crowd_peer_level.mod ) break
					
					if( level === $hyoo_crowd_peer_level.add ) {
						
						const exists = land.chunk( chunk.head(), chunk.self() )
						if( !exists ) break
						
						if( exists.auth_lo === chunk.auth_lo && exists.auth_hi === chunk.auth_hi ) break
						
					}
					
					$mol_fail( new Error( `No rights` ) )
				}
				
			}
			
			if( !auth_chunk ) {
				$mol_fail( new Error( 'No auth key' ) )
			}
			
			const key_buf = auth_chunk.data as Uint8Array
			const key = await $mol_crypto_auditor_public.from( key_buf )
			const sign = bin.sign()
			const valid = await key.verify( bin.sens(), sign )
			
			if( !valid ) {
				$mol_fail( new Error( 'Wrong auth sign' ) )
			}
			
			this._signs.set( chunk, sign )
			
		}
		
	}
}
