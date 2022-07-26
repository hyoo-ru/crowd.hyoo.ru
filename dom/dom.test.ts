namespace $ {
	$mol_test({
		
		async 'import exported html'() {
			
			const left = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			left.root.as( $hyoo_crowd_list ).list([ 'foo', { tag: 'i' }, 'bar' ])
			left.root.nodes( $hyoo_crowd_text )[1].text( 'ton' )
			const html = left.root.as( $hyoo_crowd_html ).html()
			
			const right = new $hyoo_crowd_doc( { lo: -2, hi: -22 }, await $hyoo_crowd_peer.generate() )
			right.root.as( $hyoo_crowd_html ).html( html )
			
			$mol_assert_equal( html, left.root.as( $hyoo_crowd_html ).html() )
			$mol_assert_equal(
				left.root.as( $hyoo_crowd_text ).text(),
				right.root.as( $hyoo_crowd_text ).text(),
				'foobar',
			)
			
		},
		
		async 'import wild spans'() {
			
			const land = new $hyoo_crowd_doc( { lo: -1, hi: -11 }, await $hyoo_crowd_peer.generate() )
			land.root.as( $hyoo_crowd_html ).html( '<body><span>foo bar<a href="ton"/></span></body>' )
			
			const dom = land.root.as( $hyoo_crowd_dom ).dom()
			$mol_assert_equal( dom.children[0].nodeName, 'SPAN' )
			$mol_assert_equal( dom.children[0].textContent, 'foo' )
			$mol_assert_equal( dom.children[1].nodeName, 'SPAN' )
			$mol_assert_equal( dom.children[1].textContent, ' bar' )
			$mol_assert_equal( dom.children[2].nodeName, 'A' )
			$mol_assert_equal( dom.children[2].getAttribute( 'href' ), 'ton' )
			
		},
		
	})
}
