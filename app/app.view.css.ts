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
			margin: $mol_gap.block,
			padding: $mol_gap.block,
		},
		
	} )
	
}
