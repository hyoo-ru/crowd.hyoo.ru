namespace $ {

	$mol_test({
		
		'import exported html'() {
			
			const left = $hyoo_crowd_land.make({ id: ()=> '1_1' })
			left.chief.as( $hyoo_crowd_dom ).html( '<body>foo<a data-xxx="yyy" href="hhh:zzz">ton</a>bar</body>' )
			const html = left.chief.as( $hyoo_crowd_dom ).html()
			
			const right = $hyoo_crowd_land.make({ id: ()=> '2_2' })
			right.chief.as( $hyoo_crowd_dom ).html( html )
			
			$mol_assert_like(
				left.chief.as( $hyoo_crowd_list ).list(),
				[ 'foo', [ 'a', { "data-xxx": "yyy", "href": "hhh:zzz" } ], 'bar' ],
			)
			$mol_assert_equal( left.chief.nodes( $hyoo_crowd_text )[1].text(), 'ton' )
			
			$mol_assert_equal( html, left.chief.as( $hyoo_crowd_dom ).html() )
			$mol_assert_equal(
				left.chief.as( $hyoo_crowd_text ).str(),
				right.chief.as( $hyoo_crowd_text ).str(),
				'footonbar',
			)
			
		},
		
		'import wild spans'() {
			
			const land = $hyoo_crowd_land.make({ id: ()=> '1_1' })
			land.chief.as( $hyoo_crowd_dom ).html( '<body><span>foo bar<a href="hhh:ton"/></span></body>' )
			
			const dom = land.chief.as( $hyoo_crowd_dom ).dom()
			$mol_assert_equal( dom.children[0].nodeName, 'SPAN' )
			$mol_assert_equal( dom.children[0].textContent, 'foo' )
			$mol_assert_equal( dom.children[1].nodeName, 'SPAN' )
			$mol_assert_equal( dom.children[1].textContent, ' bar' )
			$mol_assert_equal( dom.children[2].nodeName, 'A' )
			$mol_assert_equal( dom.children[2].getAttribute( 'href' ), 'hhh:ton' )
			
		},
		
	})
}
