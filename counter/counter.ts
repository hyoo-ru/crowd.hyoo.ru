namespace $ {
	export class $hyoo_crowd_counter extends $hyoo_crowd_reg {
		
		/** Count of counted peers. */
		total() {
			return this.yoke()?.residents().length ?? this.numb()
		}
		
		/** Is current peer counted. */
		counted( next?: boolean ) {
			const yoke = this.yoke()
			switch( next ) {
				case true: yoke?.join(); return Boolean( yoke )
				case false: yoke?.leave(); return false
				case undefined: return yoke?.residents().includes( this.land.peer_id() )
			}
		}
		
	}
}
