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
				'ππ'.match( $hyoo_crowd_tokenizer ),
				[ 'π', 'π' ],
			)
		},
		
		'emoji with modifier'() {
			$mol_assert_like(
				'π©πΏπ©πΏ'.match( $hyoo_crowd_tokenizer ),
				[ 'π©πΏ', 'π©πΏ' ],
			)
		},
		
		'combo emoji with modifier'() {
			$mol_assert_like(
				'π©πΏβπ€βπ§πΏπ©πΏβπ€βπ§πΏ'.match( $hyoo_crowd_tokenizer ),
				[ 'π©πΏβπ€βπ§πΏ', 'π©πΏβπ€βπ§πΏ' ],
			)
		},
		
		'word with spaces'() {
			$mol_assert_like(
				'foo1  bar2'.match( $hyoo_crowd_tokenizer ),
				[ 'foo1 ', ' ', 'bar2' ],
			)
		},
		
		'word with diactric'() {
			$mol_assert_like(
				'ΠΜΠ΅Μ'.match( $hyoo_crowd_tokenizer ),
				[ 'ΠΜΠ΅Μ' ],
			)
		},
		
		'word with punctuation'() {
			$mol_assert_like(
				'foo--bar'.match( $hyoo_crowd_tokenizer ),
				[ 'foo--', 'bar' ],
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
