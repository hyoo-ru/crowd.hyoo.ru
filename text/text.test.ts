namespace $ {
	$mol_test({
		
		async 'string: Offset <=> Point'() {
			
			const store = $hyoo_crowd_land.make({})
			store.chief.as( $hyoo_crowd_text ).str( 'fooBar' )
			const [ first, second ] = store.chief.units()
			
			$mol_assert_like(
				store.chief.as( $hyoo_crowd_text )
					.point_by_offset( 0 ),
				[ first.self, 0 ],
			)
			$mol_assert_like(
				store.chief.as( $hyoo_crowd_text )
					.offset_by_point([ first.self, 0 ]),
				[ first.self, 0 ],
			)
			
			$mol_assert_like(
				store.chief.as( $hyoo_crowd_text )
					.point_by_offset( 3 ),
				[ first.self, 3 ],
			)
			$mol_assert_like(
				store.chief.as( $hyoo_crowd_text )
					.offset_by_point([ first.self, 3 ]),
				[ first.self, 3 ],
			)
			$mol_assert_like(
				store.chief.as( $hyoo_crowd_text )
					.offset_by_point([ first.self, 5 ]),
				[ first.self, 5 ],
			)
			
			$mol_assert_like(
				store.chief.as( $hyoo_crowd_text )
					.point_by_offset( 5 ),
				[ second.self, 2 ],
			)
			$mol_assert_like(
				store.chief.as( $hyoo_crowd_text )
					.offset_by_point([ second.self, 2 ]),
				[ second.self, 5 ],
			)
			
			$mol_assert_like(
				store.chief.as( $hyoo_crowd_text )
					.point_by_offset( 6 ),
				[ second.self, 3 ],
			)
			$mol_assert_like(
				store.chief.as( $hyoo_crowd_text )
					.offset_by_point([ second.self, 3 ]),
				[ second.self, 6 ],
			)
			
			$mol_assert_like(
				store.chief.as( $hyoo_crowd_text )
					.point_by_offset( 7 ),
				[ '0_0', 1 ],
			)
			$mol_assert_like(
				store.chief.as( $hyoo_crowd_text )
					.offset_by_point([ '0_0', 1 ]),
				[ '0_0', 7 ],
			)
			
		},

		async 'text: Offset <=> Point'() {
			
			const store = $hyoo_crowd_land.make({})
			store.chief.as( $hyoo_crowd_text ).text( 'foo bar\n666 777' )
			const [ first, second ] = store.chief.nodes( $hyoo_crowd_text )
			
			$mol_assert_like(
				store.chief.as( $hyoo_crowd_text ).point_by_offset( 0 ),
				[ first.units()[0].self, 0 ],
			)
			$mol_assert_like(
				store.chief.as( $hyoo_crowd_text ).offset_by_point([ first.units()[0].self, 0 ]),
				[ first.units()[0].self, 0 ],
			)
			
			$mol_assert_like(
				store.chief.as( $hyoo_crowd_text ).point_by_offset( 8 ),
				[ first.units()[2].self, 1 ],
			)
			$mol_assert_like(
				store.chief.as( $hyoo_crowd_text ).offset_by_point([ first.units()[2].self, 1 ]),
				[ first.units()[2].self, 8 ],
			)
			
		},

	})
}
