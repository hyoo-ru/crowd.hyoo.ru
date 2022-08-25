namespace $ {
	
	async function make_land( id = '1_1' as $mol_int62_string ) {
		return $hyoo_crowd_land.make({
			id: $mol_const( id ),
			peer: $mol_const( await $hyoo_crowd_peer.generate() ),
		})
	}
	
	$mol_test({
		
		async 'import exported html'() {
			
			const left = await make_land()
			left.chief.as( $hyoo_crowd_list ).list([ 'foo', { tag: 'i' }, 'bar' ])
			left.chief.nodes( $hyoo_crowd_text )[1].text( 'ton' )
			const html = left.chief.as( $hyoo_crowd_html ).html()
			
			const right = await make_land('2_2')
			right.chief.as( $hyoo_crowd_html ).html( html )
			
			$mol_assert_equal( html, left.chief.as( $hyoo_crowd_html ).html() )
			$mol_assert_equal(
				left.chief.as( $hyoo_crowd_text ).text(),
				right.chief.as( $hyoo_crowd_text ).text(),
				'foobar',
			)
			
		},
		
		async 'import wild spans'() {
			
			const land = await make_land()
			land.chief.as( $hyoo_crowd_html ).html( '<body><span>foo bar<a href="ton"/></span></body>' )
			
			const dom = land.chief.as( $hyoo_crowd_dom ).dom()
			$mol_assert_equal( dom.children[0].nodeName, 'SPAN' )
			$mol_assert_equal( dom.children[0].textContent, 'foo' )
			$mol_assert_equal( dom.children[1].nodeName, 'SPAN' )
			$mol_assert_equal( dom.children[1].textContent, ' bar' )
			$mol_assert_equal( dom.children[2].nodeName, 'A' )
			$mol_assert_equal( dom.children[2].getAttribute( 'href' ), 'ton' )
			
		},
		
	})
}
