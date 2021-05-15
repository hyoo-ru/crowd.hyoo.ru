namespace $ {
	$mol_test({
		
		'empty string'() {
			$mol_assert_like(
				[ ... $hyoo_crowd_text_tokenizer.parse( '' ) ],
				[],
			)
		},
		
		'new lines'() {
			$mol_assert_like(
				[ ... $hyoo_crowd_text_tokenizer.parse( '\n\r\n' ) ].map( t => t.token ),
				[ '\n', '\r\n' ],
			)
		},
		
		'emoji'() {
			$mol_assert_like(
				[ ... $hyoo_crowd_text_tokenizer.parse( '😀😁' ) ].map( t => t.token ),
				[ '😀', '😁' ],
			)
		},
		
		'emoji with modifier'() {
			$mol_assert_like(
				[ ... $hyoo_crowd_text_tokenizer.parse( '👩🏿👩🏿' ) ].map( t => t.token ),
				[ '👩🏿', '👩🏿' ],
			)
		},
		
		'combo emoji with modifier'() {
			$mol_assert_like(
				[ ... $hyoo_crowd_text_tokenizer.parse( '👩🏿‍🤝‍🧑🏿👩🏿‍🤝‍🧑🏿' ) ].map( t => t.token ),
				[ '👩🏿‍🤝‍🧑🏿', '👩🏿‍🤝‍🧑🏿' ],
			)
		},
		
		'word with spaces'() {
			$mol_assert_like(
				[ ... $hyoo_crowd_text_tokenizer.parse( 'foo1  bar2' ) ].map( t => t.token ),
				[ 'foo1 ', ' ', 'bar2' ],
			)
		},
		
		'word with diactric'() {
			$mol_assert_like(
				[ ... $hyoo_crowd_text_tokenizer.parse( 'Е́е́' ) ].map( t => t.token ),
				[ 'Е́е́' ],
			)
		},
		
		'word with punctuation'() {
			$mol_assert_like(
				[ ... $hyoo_crowd_text_tokenizer.parse( 'foo--bar' ) ].map( t => t.token ),
				[ 'foo--', 'bar' ],
			)
		},
		
		'CamelCase'() {
			$mol_assert_like(
				[ ... $hyoo_crowd_text_tokenizer.parse( 'Foo1BAR2' ) ].map( t => t.token ),
				[ 'Foo1', 'BAR2' ],
			)
		},
		
	})
}
