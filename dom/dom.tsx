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
				
				let units = this.units()
				
				$mol_reconcile({
					prev: units,
					from: 0,
					to: units.length,
					next: sample,
					equal: ( next, prev )=> typeof next === 'string'
						? prev.data === next
						: String( prev.self ) === next['id'],
					drop: ( prev, lead )=> this.land.wipe( prev ),
					insert: ( next, lead )=> {
						return this.land.put(
							this.head,
							typeof next === 'string'
								? this.land.id_new()
								: $mol_int62_to_string( $mol_int62_from_string( ( next as Element ).id ) )
									|| this.land.id_new(),
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
					if( typeof sam !== 'string' ) {
						$hyoo_crowd_dom.for( this.land, units[i].self ).dom( sam )
					}
				}
				
				return next
				
			} else {
				
				return <>{
					this.units().map( unit => {
						
						const Tag = typeof unit.data === 'string'
							? 'span'
							: ( unit.data as { tag: string } ).tag ?? 'span'
							
						const attr = typeof unit.data === 'string'
							? {}
							: ( unit.data as { attr: {} } ).attr ?? {}
							
						const content = typeof unit.data === 'string'
							? unit.data
							: $hyoo_crowd_dom.for( this.land, unit.self ).dom()
							
						return <Tag { ... attr } id={ unit.self } >{ content }</Tag>
						
					} )
				}</>
				
			}
			
		}
		
	}
}