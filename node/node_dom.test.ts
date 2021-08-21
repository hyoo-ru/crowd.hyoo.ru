namespace $ {
	$mol_test({
		
		'import exported html'() {
			
			const left = new $hyoo_crowd_doc( 123 )
			left.root.list([ 'foo', { tag: 'i' }, 'bar' ])
			left.root.nodes()[1].text( 'ton' )
			const html = left.root.html()
			
			const right = new $hyoo_crowd_doc( 234 )
			right.root.html( html )
			
			$mol_assert_equal( html, right.root.html() )
			$mol_assert_equal(
				left.root.text(),
				right.root.text(),
				'foobar',
			)
			
		},
		
		'import wild spans'() {
			
			const doc = new $hyoo_crowd_doc( 234 )
			doc.root.html( '<body><span>foo bar<a href="ton"/></span></body>' )
			
			const dom = doc.root.dom()
			$mol_assert_equal( dom.children[0].nodeName, 'SPAN' )
			$mol_assert_equal( dom.children[0].textContent, 'foo ' )
			$mol_assert_equal( dom.children[1].nodeName, 'SPAN' )
			$mol_assert_equal( dom.children[1].textContent, 'bar' )
			$mol_assert_equal( dom.children[2].nodeName, 'A' )
			$mol_assert_equal( dom.children[2].getAttribute( 'href' ), 'ton' )
			
		},
		
	})
}
