namespace $ {
	
	const { unicode_only, line_end, repeat_greedy, optional, char_only, char_except } = $mol_regexp 
	
	export let $hyoo_crowd_tokenizer = $mol_regexp.from({
		token: {
			
			'line-break': line_end ,
			
			'emoji': [
				
				unicode_only( 'Extended_Pictographic' ),
				optional( unicode_only( 'Emoji_Modifier' ) ),
				
				repeat_greedy([
					
					unicode_only( 'Emoji_Component' ),
					
					unicode_only( 'Extended_Pictographic' ),
					optional( unicode_only( 'Emoji_Modifier' ) ),
					
				]),
				
			],
			
			'Word-punctuation-space': [
				
				repeat_greedy( char_only([
					unicode_only( 'General_Category', 'Uppercase_Letter' ),
					unicode_only( 'Diacritic' ),
					unicode_only( 'General_Category', 'Number' ),
				]) ),
				
				repeat_greedy( char_only([
					unicode_only( 'General_Category', 'Lowercase_Letter' ),
					unicode_only( 'Diacritic' ),
					unicode_only( 'General_Category', 'Number' ),
				]) ),
				
				repeat_greedy( char_except([
					unicode_only( 'General_Category', 'Uppercase_Letter' ),
					unicode_only( 'General_Category', 'Lowercase_Letter' ),
					unicode_only( 'Diacritic' ),
					unicode_only( 'General_Category', 'Number' ),
					unicode_only( 'White_Space' ),
				]) ),
				
				optional( unicode_only( 'White_Space' ) ),
				
			],
			
		},
	} )

}
