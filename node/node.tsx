/** @jsx $mol_jsx */
/** @jsxFrag $mol_jsx_frag */
namespace $ {
	
	/** Stateless non-unique adapter to CROWD Tree for given Head. */
	export class $hyoo_crowd_node {
		
		constructor(
			readonly tree: $hyoo_crowd_doc,
			readonly head: $hyoo_crowd_chunk['head'],
		) {}
		
		/** Returns inner ode for key. */
		sub( key: string ) {
			return this.tree.node( $mol_hash_string( key, this.head ) )
		}
		
		/** Ordered inner alive Chunks. */
		chunks() {
			return this.tree.chunk_alive( this.head )
		}
		
		/** Ordered inner alive Node. */
		nodes() {
			return this.chunks().map( chunk => this.tree.node( chunk.self ) )
		}
		
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
					this.tree.wipe( chunk )
				}
				
				this.tree.put(
					this.head,
					last?.self ?? this.tree.id_new(),
					0,
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
		
		count() {
			return this.chunks().length
		}
		
		/** Data list representation. */
		list( next?: readonly unknown[] ) {
			
			if( next === undefined ) {
				return this.chunks().map( chunk => chunk.data )
			} else {
				this.insert( next, 0, this.count() )
				return next
			}
			
		}
		
		insert(
			next: readonly unknown[],
			from = this.count(),
			to = from,
		) {
			
			$mol_reconcile({
				prev: this.chunks(),
				from,
				to,
				next,
				equal: ( next, prev )=> prev.data === next,
				drop: ( prev, lead )=> this.tree.wipe( prev ),
				insert: ( next, lead )=> this.tree.put(
					this.head,
					this.tree.id_new(),
					lead?.self ?? 0,
					next,
				),
				update: ( next, prev, lead )=> this.tree.put(
					prev.head,
					prev.self,
					lead?.self ?? 0,
					next,
				),
			})
			
		}
		
		/** Text representation. Based on list of strings. */
		text( next?: string ) {
			
			if( next === undefined ) {
				
				return this.list().filter( item => typeof item === 'string' ).join( '' )
			
			} else {
				
				this.write( next, 0, -1 )
				
				return next
			}
			
		}
		
		write(
			next: string,
			str_from = -1,
			str_to = str_from,
		) {
			
			const list = this.chunks()
			
			let from = str_from < 0 ? list.length : 0
			let word = ''
			
			while( from < list.length ) {
				
				word = String( list[ from ].data )
				
				if( str_from <= word.length ) {
					next = word.slice( 0, str_from ) + next
					break
				}
				
				str_from -= word.length
				if( str_to > 0 ) str_to -= word.length
				
				from ++
				
			}
			
			let to = str_to < 0 ? list.length : from
			
			while( to < list.length ) {
				
				word = String( list[ to ].data )
				to ++
				
				if( str_to < word.length ) {
					next = next + word.slice( str_to )
					break
				}
				
				str_to -= word.length
				
			}
			
			if( from && from === list.length ) {
				-- from
				next = String( list[ from ].data ) + next
			}
			
			const words = [ ... next.matchAll( $hyoo_crowd_tokenizer ) ].map( token => token[0] )
			this.insert( words, from, to )
			
			return this
		}

		dom( next?: Element | DocumentFragment ) {
			
			if( next ) {
				
				const sample = [] as ( string | Element )[]
				function collect( next: Element | DocumentFragment ) {
					for( const node of next.childNodes ) {
						
						if( node.nodeType === node.TEXT_NODE ) {
							for( const token of node.nodeValue!.matchAll( $hyoo_crowd_tokenizer ) ) {
								sample.push( token[0] )
							}
						} else {
							if( node.nodeName === 'span' && !Number( ( node as Element ).id ) ) {
								collect( node as Element )
							} else {
								sample.push( node as Element )
							}
						}
						
					}
				}
				collect( next )
				
				function attr( el: Element ) {
					let res = {} as object
					for( const a of el.attributes ) {
						if( a.name === 'id' ) continue
						res[ a.name ] = a.value
					}
					return res
				}
				
				function val( el: Element | string ) {
					return typeof el === 'string'
						? el
						: el.nodeName === 'span'
							? el.textContent
							: {
								tag: el.nodeName,
								attr: attr( el ),
							}
				}
				
				$mol_reconcile({
					prev: this.chunks(),
					from: 0,
					to: this.count(),
					next: sample,
					equal: ( next, prev )=> typeof next === 'string'
						? prev.data === next
						: String( prev.self ) === next['id'],
					drop: ( prev, lead )=> this.tree.wipe( prev ),
					insert: ( next, lead )=> {
						return this.tree.put(
							this.head,
							typeof next === 'string'
								? this.tree.id_new()
								: Number( ( next as Element ).id ) || this.tree.id_new(),
							lead?.self ?? 0,
							val( next ),
						)
					},
					update: ( next, prev, lead )=> this.tree.put(
						prev.head,
						prev.self,
						lead?.self ?? 0,
						val( next ),
					),
				})
				
				const chunks = this.chunks()
				for( let i = 0; i < chunks.length; ++i ) {
					const sam = sample[i]
					if( typeof sam !== 'string' ) {
						this.tree.node( chunks[i].self ).dom( sam )
					}
				}
				
				return next
				
			} else {
				
				return <>{
					this.chunks().map( chunk => {
						
						const Tag = typeof chunk.data === 'string'
							? 'span'
							: ( chunk.data as { tag: string } ).tag ?? 'span'
							
						const attr = typeof chunk.data === 'string'
							? {}
							: ( chunk.data as { attr: {} } ).attr ?? {}
							
						const content = typeof chunk.data === 'string'
							? chunk.data
							: this.tree.node( chunk.self ).dom()
							
						return <Tag { ... attr } id={ String( chunk.self ) } >{ content }</Tag>
						
					} )
				}</>
				
			}
			
		}
		
		html( next?: string ) {
			if( next === undefined ) {
				return $mol_dom_serialize( <body>{ this.dom() }</body> )
			} else {
				this.dom( $mol_dom_parse( next ).documentElement )
				return next
			}
		}

		point_by_offset( offset: number ) {
			
			let off = offset
			for( const chunk of this.chunks() ) {
				
				const len = String( chunk.data ).length
				
				if( off < len ) return { chunk: chunk.self, offset: off }
				else off -= len
				
			}
			
			return { chunk: this.head, offset: offset }
		}
		
		offset_by_point( point: { chunk: number, offset: number } ) {
			
			let offset = 0
			
			for( const chunk of this.chunks() ) {
				
				if( chunk.self === point.chunk ) return offset + point.offset
				
				offset += String( chunk.data ).length
			}
			
			return offset
		}
		
		move(
			from: number,
			to: number,
		) {
			
			const chunks = this.chunks()
			const lead = to ? chunks[ to - 1 ].self : 0
			
			return this.tree.move( chunks[ from ], this.head, lead )
			
		}
		
		cut( seat: number ) {
			return this.tree.wipe( this.chunks()[ seat ] )
		}
		
		[ $mol_dev_format_head ]() {
			return $mol_dev_format_span( {} ,
				$mol_dev_format_native( this ) ,
				$mol_dev_format_shade( '/' ) ,
				$mol_dev_format_auto( this.list() ) ,
				$mol_dev_format_shade( '/' ) ,
				$mol_dev_format_auto( this.nodes() ) ,
			)
		}
		
	}
	
}
