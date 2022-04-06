namespace $ {
	$mol_test({
		
		'empty string'() {
			$mol_assert_like(
				''.match( $hyoo_crowd_tokenizer ),
				null,
			)
		},
		
		'new lines'() {
			$mol_assert_like(
				'\n\r\n'.match( $hyoo_crowd_tokenizer ),
				[ '\n', '\r\n' ],
			)
		},
		
		'numbers'() {
			$mol_assert_like(
				'123'.match( $hyoo_crowd_tokenizer ),
				[ '123' ],
			)
		},
		
		'emoji'() {
			$mol_assert_like(
				'😀😁'.match( $hyoo_crowd_tokenizer ),
				[ '😀', '😁' ],
			)
		},
		
		'emoji with modifier'() {
			$mol_assert_like(
				'👩🏿👩🏿'.match( $hyoo_crowd_tokenizer ),
				[ '👩🏿', '👩🏿' ],
			)
		},
		
		'combo emoji with modifier'() {
			$mol_assert_like(
				'👩🏿‍🤝‍🧑🏿👩🏿‍🤝‍🧑🏿'.match( $hyoo_crowd_tokenizer ),
				[ '👩🏿‍🤝‍🧑🏿', '👩🏿‍🤝‍🧑🏿' ],
			)
		},
		
		'word with spaces'() {
			$mol_assert_like(
				'foo1  bar2'.match( $hyoo_crowd_tokenizer ),
				[ 'foo1', '  ', 'bar2' ],
			)
		},
		
		'word with diactric'() {
			$mol_assert_like(
				'Е́е́'.match( $hyoo_crowd_tokenizer ),
				[ 'Е́е́' ],
			)
		},
		
		'word with punctuation'() {
			$mol_assert_like(
				'foo--bar'.match( $hyoo_crowd_tokenizer ),
				[ 'foo', '--', 'bar' ],
			)
		},
		
		'CamelCase'() {
			$mol_assert_like(
				'Foo1BAR2'.match( $hyoo_crowd_tokenizer ),
				[ 'Foo1', 'BAR2' ],
			)
		},
		
	})
}
