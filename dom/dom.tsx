/** @jsx $mol_jsx */
/** @jsxFrag $mol_jsx_frag */
namespace $ {
	export class $hyoo_crowd_dom extends $hyoo_crowd_node {
		
		dom( next?: Element | DocumentFragment ) {
			
			if( next ) {
				
				const ids = new Set< string >()
				for( const node of next.childNodes ) {
					if(!( node instanceof this.$.$mol_dom_context.Element )) continue
					if( ids.has( node.id ) ) node.id = ''
					ids.add( node.id )
				}
				
				const sample = [] as ( string | Element )[]
				function collect( next: Element | DocumentFragment ) {
					for( const node of next.childNodes ) {
						
						if( node.nodeType === node.TEXT_NODE ) {
							for( const token of node.nodeValue!.matchAll( $hyoo_crowd_tokenizer ) ) {
								sample.push( token[0] )
							}
						} else {
							if( ( node as Element ).localName === 'span' && !Number( ( node as Element ).id ) ) {
								collect( node as Element )
							} else {
								sample.push( node as Element )
							}
						}
						
					}
				}
				collect( next )
				
				function attr( el: Element ) {
					let res = {} as Record< string, sring >
					for( const a of el.attributes ) {
						if( a.name === 'id' ) continue
						res[ a.name ] = a.value
					}
					return res
				}
				
				function val( el: Element | string ) {
					return typeof el === 'string'
						? el
						: el.localName === 'span'
							? el.textContent
							: [ el.localName, attr( el ) ]
				}
				
				let units = this.units()
				
				$mol_reconcile({
					prev: units,
					from: 0,
					to: units.length,
					next: sample,
					equal: ( next, prev )=> typeof next === 'string'
						? prev.data === next
						: next.localName === 'span'
							? prev.data === next.textContent
							: prev.self === next['id'],
					drop: ( prev, lead )=> this.land.wipe( prev ),
					insert: ( next, lead )=> {
						return this.land.put(
							this.head,
							typeof next === 'string'
								? this.land.id_new()
								: $mol_int62_string_ensure( ( next as Element ).id )
									?? this.land.id_new(),
							lead?.self ?? '0_0',
							val( next ),
						)
					},
					update: ( next, prev, lead )=> this.land.put(
						prev.head,
						prev.self,
						lead?.self ?? '0_0',
						val( next ),
					),
				})
				
				units = this.units()
				for( let i = 0; i < units.length; ++i ) {
					
					const sam = sample[i]
					if( typeof sam === 'string' ) continue
					
					// if( sam.localName === 'span' && $mol_int62_string_ensure( sam.id ) ) {
					// } else {
						$hyoo_crowd_dom.for( this.land, units[i].self ).dom( sam )
					// }
					
				}
				
				return next
				
			} else {
				
				return <>{
					this.units().map( unit => {
						
						const Tag = typeof unit.data === 'string'
							? 'span'
							: ( unit.data as string[] )[0] ?? 'p'
							
						const attr = typeof unit.data === 'string'
							? {}
							: ( unit.data as {}[] )[1] ?? {}
							
						const content = typeof unit.data === 'string'
							? unit.data
							: $hyoo_crowd_dom.for( this.land, unit.self ).dom()
							
						return <Tag { ... attr } id={ unit.self } >{ content }</Tag>
						
					} )
				}</>
				
			}
			
		}
		
		html( next?: string ) {
			
			const dom = this.as( $hyoo_crowd_dom )
			
			if( next === undefined ) {
				return $mol_dom_serialize( <body>{ dom.dom() }</body> )
			} else {
				dom.dom( $mol_dom_parse( next ).documentElement )
				return next
			}
			
		}
		
	}
}
