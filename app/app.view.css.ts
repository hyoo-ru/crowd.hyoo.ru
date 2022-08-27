namespace $.$$ {
	
	const { rem } = $mol_style_unit
	
	$mol_style_define( $hyoo_crowd_app_peer, {
		
		flex: {
			grow: 1000,
			shrink: 0,
			basis: rem(20),
		},
		
		Body: {
			padding: 0,
		},
						
		Text: {
			margin: $mol_gap.block,
			flex: {
				grow: 0,
			},
		},
		
		Stats: {
			margin: $mol_gap.block,
		},
		
		Delta_section: {
			padding: $mol_gap.block,
		},
		
		Delta: {
			font: {
				size: rem(.875),
				family: 'monospace',
			},
			Cell_text: {
				whiteSpace: 'pre',
			},
		},
		
	} )
	
}
