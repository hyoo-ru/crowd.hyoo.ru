namespace $ {
	
	/** CROWD Ordered Set */
	export class $hyoo_crowd_list extends $hyoo_crowd_store {
		
		protected clock_self = new $hyoo_crowd_clock
		protected readonly array = [] as $hyoo_crowd_delta_value[]
		protected readonly stamps = new Map< $hyoo_crowd_delta_value, number >()
		
		get count() {
			return this.array.length
		}
		
		items( next?: $hyoo_crowd_delta_value[] ) {
			
			const prev = this.array
			if( !next ) return prev.slice()
			
			for( let i = 0; i < next.length; ++i ) {
				
				let n = next[i]
				let p = prev[i]
				if( n === p ) continue
				
				if( next.length > prev.length ) {
					this.insert( n, i )
				} else {
					this.cut( p )
					i --
				}
				 
			}
			
			return prev.slice()
		}
		
		get items_internal() {
			return this.array as readonly $hyoo_crowd_delta_value[]
		}
		
		has( val: $hyoo_crowd_delta_value ) {
			return this.stamps.get( val )! > 0
		}
		
		version_item( val: $hyoo_crowd_delta_value ) {
			return this.clock.version_from( this.stamps.get( val ) ?? 0 )
		}
		
		version_feed( version: number ) {
			this.clock.feed( version )
			this.clock_self.feed( version )
		}
		
		delta( clock = new $hyoo_crowd_clock ): ReturnType< typeof $hyoo_crowd_delta > {
			
			const delta = $hyoo_crowd_delta([],[])
			if( !this.clock_self.is_ahead( clock ) ) return delta
			
			for( const key of this.array ) {
				delta.values.push( key )
				delta.stamps.push( this.stamps.get( key )! )
			}
			
			for( const [ key, stamp ] of this.stamps ) {
				if( stamp > 0 ) continue
				delta.values.push( key )
				delta.stamps.push( stamp )
			}
			
			return delta
		}
		
		insert(
			key: $hyoo_crowd_delta_value,
			pos: number = this.array.length,
		) {
			
			const exists = this.array[ pos ]
			if( exists === key ) return this
			
			const delta = $hyoo_crowd_delta([],[])
				
			if( pos > 0 ) {
				const anchor = this.array[ pos - 1 ]
				delta.values.push( anchor )
				delta.stamps.push( this.stamps.get( anchor )! )
			}
			
			delta.values.push( key )
			delta.stamps.push( this.clock.generate() )
				
			this.apply( delta )
			
			return this
		}
		
		cut(
			key: $hyoo_crowd_delta_value
		) {
			
			const stamp = this.stamps.get( key ) ?? 0
			if( stamp <= 0 ) return this
			
			this.apply( $hyoo_crowd_delta(
				[ key ],
				[ - this.clock.generate() ]
			) )
			
			return this
		}
		
		apply(
			delta: ReturnType< typeof $hyoo_crowd_delta >,
		) {

			const patch_array = [] as $hyoo_crowd_delta_value[]
			const patch_stamps = new Map< $hyoo_crowd_delta_value, number >()
			
			for( let i = 0; i < delta.values.length; ++i ) {
				const key = delta.values[i]
				const stamp = delta.stamps[i]
				patch_stamps.set( key, stamp )
				if( stamp > 0 ) patch_array.push( key )
			}
			
			for( let i = 0; i < delta.values.length; ++i ) {
				
				const current_key = delta.values[i]
				const current_patch_stamp = delta.stamps[i]
				
				const current_self_stamp = this.stamps.get( current_key ) ?? 0
				const current_patch_version = this.clock.version_from( current_patch_stamp )
				
				if( this.version_item( current_key ) >= current_patch_version ) continue
				
				this.stamps.set( current_key, current_patch_stamp )
				this.version_feed( current_patch_version )
				
				if( current_patch_stamp <= 0 ) {
					
					if( current_self_stamp > 0 ) {
						this.array.splice( this.array.indexOf( current_key ), 1 )
					}
					
					continue
				}
				
				for( let anchor = patch_array.indexOf( current_key ) - 1 ;; anchor -- ) {
					
					const anchor_key = patch_array[ anchor ]
					
					if( anchor >= 0 ) {
						const anchor_self_version = this.version_item( anchor_key )
						if( anchor_self_version === 0 ) continue
						if( anchor_self_version > this.clock.version_from( patch_stamps.get( anchor_key )! ) ) continue
					}
					
					let next_pos = anchor_key !== undefined ? this.array.indexOf( anchor_key ) + 1 : 0
					
					while( next_pos < this.array.length ) {
						if( this.version_item( this.array[ next_pos ] ) <= current_patch_version ) break
						next_pos ++
					}
					
					if( current_self_stamp <= 0 ) {
						this.array.splice( next_pos, 0, current_key )
						break
					}
					
					const current_pos = this.array.indexOf( current_key )
					
					if( current_pos === next_pos ) break
					
					if( current_pos > next_pos ) {
						
						this.array.splice(
							next_pos,
							current_pos - next_pos + 1,
							current_key, ... this.array.slice( next_pos, current_pos )
						)
						
					} else {
						
						this.array.splice(
							current_pos,
							next_pos - current_pos + 1,
							... this.array.slice( current_pos + 1, next_pos + 1 ), current_key
						)
						
					}
					
					break
				}
				
			}
			
			return this
		}
		
	}
	
}
