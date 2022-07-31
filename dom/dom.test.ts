namespace $ {
	$mol_test({
		
		'import exported html'() {
			
			const left = new $hyoo_crowd_doc( 123 )
			$hyoo_crowd_list.for( left ).list([ 'foo', { tag: 'i' }, 'bar' ])
			left.root.nodes( $hyoo_crowd_text )[1].text( 'ton' )
			const html = $hyoo_crowd_html.for( left ).html()
			
			const right = new $hyoo_crowd_doc( 234 )
			$hyoo_crowd_html.for( right ).html( html )
			
			$mol_assert_equal( html, $hyoo_crowd_html.for( right ).html() )
			$mol_assert_equal(
				$hyoo_crowd_text.for( left ).text(),
				$hyoo_crowd_text.for( right ).text(),
				'foobar',
			)
			
		},
		
		'import wild spans'() {
			
			const doc = new $hyoo_crowd_doc( 234 )
			$hyoo_crowd_html.for( doc ).html( '<body><span>foo bar<a href="ton"/></span></body>' )
			
			const dom = $hyoo_crowd_dom.for( doc ).dom()
			$mol_assert_equal( dom.children[0].nodeName, 'SPAN' )
			$mol_assert_equal( dom.children[0].textContent, 'foo' )
			$mol_assert_equal( dom.children[1].nodeName, 'SPAN' )
			$mol_assert_equal( dom.children[1].textContent, ' bar' )
			$mol_assert_equal( dom.children[2].nodeName, 'A' )
			$mol_assert_equal( dom.children[2].getAttribute( 'href' ), 'ton' )
			
		},
		
	})
}
