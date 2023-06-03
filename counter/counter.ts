namespace $ {
	export class $hyoo_crowd_counter extends $hyoo_crowd_reg {
		
		/** All counted peer ids. */
		list() {
			return this.yoke([])?.residents() ?? []
		}
		
		/** Count of counted peers. */
		total() {
			return this.list().length
		}
		
		/** Is current peer counted. */
		counted( next?: boolean ) {
			const yoke = this.yoke([])
			switch( next ) {
				case true: yoke?.join(); return Boolean( yoke )
				case false: yoke?.leave(); return false
				case undefined: return yoke?.residents().includes( this.land.peer_id() )
			}
		}
		
	}
}
