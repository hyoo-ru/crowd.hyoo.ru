namespace $ {
	
	const { unicode_only, line_end, tab, repeat_greedy, optional, forbid_after, char_only, char_except } = $mol_regexp 
	
	export let $hyoo_crowd_tokenizer = $mol_regexp.from({
		token: {
			
			'line-break': line_end ,
			
			'indents': repeat_greedy( tab, 1 ),
			
			'emoji': [
				
				unicode_only( 'Extended_Pictographic' ),
				optional( unicode_only( 'Emoji_Modifier' ) ),
				
				repeat_greedy([
					
					unicode_only( 'Emoji_Component' ),
					
					unicode_only( 'Extended_Pictographic' ),
					optional( unicode_only( 'Emoji_Modifier' ) ),
					
				]),
				
			],
			
			'Word': [
				
				[
					forbid_after( line_end ),
					unicode_only( 'White_Space' ),
				],
				
				repeat_greedy( char_only([
					unicode_only( 'General_Category', 'Uppercase_Letter' ),
					unicode_only( 'Diacritic' ),
					unicode_only( 'General_Category', 'Number' ),
				]), 1 ),
				
				repeat_greedy( char_only([
					unicode_only( 'General_Category', 'Lowercase_Letter' ),
					unicode_only( 'Diacritic' ),
					unicode_only( 'General_Category', 'Number' ),
				]) ),
				
			],
			
			'word': [
				[
					forbid_after( line_end ),
					unicode_only( 'White_Space' ),
				],
				repeat_greedy( char_only([
					unicode_only( 'General_Category', 'Lowercase_Letter' ),
					unicode_only( 'Diacritic' ),
					unicode_only( 'General_Category', 'Number' ),
				]), 1 ),
			],
			
			'space': [
				forbid_after( line_end ),
				unicode_only( 'White_Space' ),
				forbid_after([
					unicode_only( 'General_Category', 'Uppercase_Letter' ),
					unicode_only( 'General_Category', 'Lowercase_Letter' ),
					unicode_only( 'Diacritic' ),
					unicode_only( 'General_Category', 'Number' ),
				]),
			],
			
			'others': [
				
				repeat_greedy( char_except([
					unicode_only( 'General_Category', 'Uppercase_Letter' ),
					unicode_only( 'General_Category', 'Lowercase_Letter' ),
					unicode_only( 'Diacritic' ),
					unicode_only( 'General_Category', 'Number' ),
					unicode_only( 'White_Space' ),
				]), 1 ),
				
			],
			
		},
	} )

}
