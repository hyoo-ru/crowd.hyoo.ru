// 		point_by_offset( offset: number ) {
			
// 			for( const token of this.tokens ) {
				
// 				const len = this.value_of( token ).length
				
// 				if( offset < len ) return [ token, offset ]
// 				else offset -= len
				
// 			}
			
// 			return [ 0, 0 ]
// 		}
		
// 		offset_by_point( point: number[] ) {
			
// 			let offset = 0
			
// 			for( const token of this.tokens ) {
				
// 				if( token === point[0] ) return offset + point[1]
				
// 				offset += this.value_of( token ).length
// 			}
			
// 			return offset
// 		}
// }
