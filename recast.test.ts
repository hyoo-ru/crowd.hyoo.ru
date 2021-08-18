// namespace $ {
	
// 	$mol_test({
		
// 		'Register => Tagged Union'() {
			
// 			let left = $hyoo_crowd_reg.make().fork(2)
			
// 			left.numb( 777 )
// 			left.numb( 123 )
			
// 			let right = $hyoo_crowd_union.of({
// 				index: $hyoo_crowd_reg,
// 				count: $hyoo_crowd_reg,
// 			}).make().fork(1)
			
// 			right.apply( left.delta() )
			
// 			$mol_assert_like( right.type, "index" )
// 			$mol_assert_like( right.as( 'index' )!.numb(), 123 )
			
// 		},
		
// 		'Tagged Union => Register'() {
			
// 			let left = $hyoo_crowd_union.of({
// 				index: $hyoo_crowd_reg,
// 				count: $hyoo_crowd_reg,
// 			}).make().fork(1)
			
// 			left.to('index').numb( 777 )
// 			left.to('count')
			
// 			let right = $hyoo_crowd_reg.make().fork(2)
			
// 			right.apply( left.delta() )
			
// 			$mol_assert_like( right.numb(), 777 )
			
// 		},
		
// 		'Tagged Union => Counter'() {
			
// 			let left = $hyoo_crowd_union.of({
// 				index: $hyoo_crowd_reg,
// 				count: $hyoo_crowd_reg,
// 			}).make().fork(1)
			
// 			left.to('index').numb( 777 )
// 			left.to('count')
			
// 			let right = $hyoo_crowd_numb.make().fork(2)
			
// 			right.apply( left.delta() )
			
// 			$mol_assert_like( right.numb(), 777 )
			
// 		},
		
// 	})
	
// }
