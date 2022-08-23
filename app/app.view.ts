namespace $.$$ {

	export class $hyoo_crowd_app extends $.$hyoo_crowd_app {
		
		sync_enabled() {
			return this.Left().changes() + this.Right().changes() > 0
		}

		@ $mol_mem
		sync( next?: Event ) {
			
			if( next == undefined ) return 0
			
			const left_delta = this.Left().delta()
			const right_delta = this.Right().delta()
			
			this.Left().store().apply( right_delta )
			this.Right().store().apply( left_delta )
			
			this.Left().sync_clocks( this.Left().store().clocks.map( clock => new $hyoo_crowd_clock( clock ) ) as any )
			this.Right().sync_clocks( this.Right().store().clocks.map( clock => new $hyoo_crowd_clock( clock ) ) as any )
			
			return Math.random()
		}

	}

	export class $hyoo_crowd_app_peer extends $.$hyoo_crowd_app_peer {

		@ $mol_mem
		sync_clocks( next = [ new $hyoo_crowd_clock, new $hyoo_crowd_clock ] as const ) {
			return next
		}
		
		@ $mol_mem
		text( next?: string ) {
			this.sync()
			return this.store().chief.as( $hyoo_crowd_text ).text( next )
		}
		
		@ $mol_mem
		delta() {
			this.text()
			return this.store().delta( this.sync_clocks() )
		}
		
		@ $mol_mem
		delta_view() {
			return this.delta().slice().reverse().map( unit => ({
				
				'Time': unit.time + '_' + unit.spin,
				'Land': $mol_int62_to_string( unit.land() ),
				
				'Auth': $mol_int62_to_string( unit.auth() ),
				'Head': $mol_int62_to_string( unit.head() ),
				
				'Next': $mol_int62_to_string( unit.next() ),
				'Prev': $mol_int62_to_string( unit.prev() ),
				
				'Self': $mol_int62_to_string( unit.self() ),
				'Data': JSON.stringify( unit.data ),
				
			}) )
		}
		
		changes() {
			return this.delta().length
		}
		
		size_text() {
			return $mol_charset_encode( this.text() ).length
		}
		
		tokens_alive() {
			this.text()
			return this.store().chief.as( $hyoo_crowd_list ).list().length
		}
		
		tokens_total() {
			this.text()
			return this.store().size()
		}
		
		tokens_dead() {
			return this.tokens_total() - this.tokens_alive()
		}
		
		@ $mol_mem
		size_state_bin() {
			return this.store().delta().reduce( ( res, unit )=> res + this.$.$hyoo_crowd_unit_bin.from( unit ).byteLength, 0 )
		}
		
		@ $mol_mem
		size_delta_bin() {
			return this.delta().reduce( ( res, unit )=> res + this.$.$hyoo_crowd_unit_bin.from( unit ).byteLength, 0 )
		}
		
		stats() {
			this.text()
			return super.stats()
			.replace( '{peer}', $mol_int62_to_string( this.store().auth.id ) )
			.replace( '{changes}', this.changes().toLocaleString() )
			.replace( '{tokens:alive}', this.tokens_alive().toLocaleString() )
			.replace( '{tokens:dead}', this.tokens_dead().toLocaleString() )
			.replace( '{tokens:total}', this.tokens_total().toLocaleString() )
			.replace( '{stamp:now}', this.store().clock_data.last_time + '_' + this.store().clock_data.last_spin )
			.replace( '{stamp:sync}', this.sync_clocks()[1].last_time + '_' + this.sync_clocks()[1].last_spin )
			.replace( '{size:text}', this.size_text().toLocaleString() )
			.replace( '{size:state}', this.size_state_bin().toLocaleString() )
			.replace( '{size:delta}', this.size_delta_bin().toLocaleString() )
		}
		
	}
	
}
