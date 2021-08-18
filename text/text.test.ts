// namespace $ {
// 	$mol_test({
		
		
// 		'Offset <=> path'() {
			
// 			const obj = { foo: 1, bar: 2 };
// 			const { foo, ...restObjectItems } = obj;
			
// 			const store = new $hyoo_crowd_text().fork(1)
// 			store.text( 'foo bar' )
			
// 			$mol_assert_like(
// 				store.point_by_offset( 0 ),
// 				[ store.tokens[0], 0 ],
// 			)
// 			$mol_assert_like(
// 				store.offset_by_point([ store.tokens[0], 0 ]),
// 				0,
// 			)
			
// 			$mol_assert_like(
// 				store.point_by_offset( 4 ),
// 				[ store.tokens[1], 0 ],
// 			)
// 			$mol_assert_like(
// 				store.offset_by_point([ store.tokens[1], 0 ]),
// 				4,
// 			)
			
// 			$mol_assert_like(
// 				store.point_by_offset( 6 ),
// 				[ store.tokens[1], 2 ],
// 			)
// 			$mol_assert_like(
// 				store.offset_by_point([ store.tokens[1], 2 ]),
// 				6,
// 			)
			
// 			$mol_assert_like(
// 				store.point_by_offset( 7 ),
// 				[ 0, 0 ],
// 			)
// 			$mol_assert_like(
// 				store.offset_by_point([ 0, 0 ]),
// 				7,
// 			)
			
// 		},
		
// 	})
// }
