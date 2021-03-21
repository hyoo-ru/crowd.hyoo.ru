namespace $ {
	
	/** CROWD Register */
	export class $hyoo_crowd_reg extends $hyoo_crowd_store {
		
		protected _value = null as $hyoo_crowd_delta_value | null
		protected _stamp = 0
		protected _mult = 1
		
		get version() {
			return this.clock.version_from( this._stamp )
		}
		
		get str() {
			return String( this._value ?? '' )
		}
		set str( next: string ) {
			this.value = next
		}
		
		get numb() {
			return Number( this._value ?? 0 )
		}
		set numb( next: number ) {
			this.value = next
		}
		
		get bool() {
			return Boolean( this._value ?? false )
		}
		set bool( next: boolean ) {
			this.value = next
		}
		
		delta( clock = new $hyoo_crowd_clock ) {
			if( !clock.is_new( this._stamp ) ) return $hyoo_crowd_delta([],[])
			return $hyoo_crowd_delta( [ this._value ], [ this._stamp ] )
		}
		
		get value() {
			return this._value
		}
		set value( val: $hyoo_crowd_delta_value ) {
			
			if( this._value === val ) return
			
			this._value = val
			this.clock.feed( this._stamp = this._mult * this.clock.generate() )

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
