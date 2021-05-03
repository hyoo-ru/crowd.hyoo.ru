namespace $ {
	
	/** CROWD Register */
	export class $hyoo_crowd_reg extends $hyoo_crowd_store {
		
		protected _value = null as $hyoo_crowd_delta_value | null
		protected _stamp = 0
		protected _mult = 1
		
		get version() {
			return this.clock.version_from( this._stamp )
		}
		
		str( next?: string ) {
			return String( this.value( next ) ?? '' )
		}
		
		numb( next?: number ) {
			return Number( this.value( next ) ?? 0 )
		}
		
		bool( next?: boolean ) {
			return Boolean( this.value( next ) ?? false )
		}
		
		delta( clock = new $hyoo_crowd_clock ) {
			if( !clock.is_new( this._stamp ) ) return $hyoo_crowd_delta([],[])
			return $hyoo_crowd_delta( [ this._value ], [ this._stamp ] )
		}
		
		value( next?: $hyoo_crowd_delta_value ) {
			
			if( next === undefined ) return this._value
			if( this._value === next ) return this._value
			
			this._value = next
			this.clock.feed( this._stamp = this._mult * this.clock.generate() )

			return next
		}
		
		apply(
			delta: ReturnType< typeof $hyoo_crowd_delta >,
		) {
			
			for( let i = 0; i < delta.values.length; ++i ) {
				
				const val = delta.values[i]
				const stamp = delta.stamps[i]
			
				this.clock.feed( stamp )
				
				if( this._mult * stamp <= this._mult * this._stamp ) continue
				
				this._value = val
				this._stamp = stamp
			}
			
			return this
		}
			
	}
	
	export class $hyoo_crowd_reg_back extends $hyoo_crowd_reg {
		protected _mult = -1
	}
	
}
