/** @jsx $mol_jsx */
/** @jsxFrag $mol_jsx_frag */
namespace $ {
	export class $hyoo_crowd_dom extends $hyoo_crowd_node {
		
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
				
				let chunks = this.chunks()
				
				$mol_reconcile({
					prev: chunks,
					from: 0,
					to: chunks.length,
					next: sample,
					equal: ( next, prev )=> typeof next === 'string'
						? prev.data === next
						: String( prev.self ) === next['id'],
					drop: ( prev, lead )=> this.doc.wipe( prev ),
					insert: ( next, lead )=> {
						return this.doc.put(
							this.head,
							typeof next === 'string'
								? this.doc.id_new()
								: Number( ( next as Element ).id ) || this.doc.id_new(),
							lead?.self ?? 0,
							val( next ),
						)
					},
					update: ( next, prev, lead )=> this.doc.put(
						prev.head,
						prev.self,
						lead?.self ?? 0,
						val( next ),
					),
				})
				
				chunks = this.chunks()
				for( let i = 0; i < chunks.length; ++i ) {
					const sam = sample[i]
					if( typeof sam !== 'string' ) {
						$hyoo_crowd_dom.for( this.doc, chunks[i].self ).dom( sam )
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
							: $hyoo_crowd_dom.for( this.doc, chunk.self ).dom()
							
						return <Tag { ... attr } id={ String( chunk.self ) } >{ content }</Tag>
						
					} )
				}</>
				
			}
			
		}
		
	}
}
