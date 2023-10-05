namespace $ {
	export class $hyoo_crowd_counter extends $hyoo_crowd_reg {
		
		/** All counted peer ids. */
		list() {
			return this.yoke([])?.residents() ?? []
		}

		/* Timestamps of counteds */
		@ $mol_mem
		times() {
			const land = this.yoke([])
			land?.pub.promote()
			return Object.fromEntries(
				[ ... land?._unit_all.values() ?? [] ]
				.filter( unit => unit.data && unit.kind() === $hyoo_crowd_unit_kind.join )
				.map( unit => [ unit.auth as $mol_int62_string, $hyoo_crowd_time_stamp( unit.time ) ] )
			)
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
