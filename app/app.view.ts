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
			
			this.Left().sync_clock( new $hyoo_crowd_clock( this.Left().store().clock ) )
			this.Right().sync_clock( new $hyoo_crowd_clock( this.Right().store().clock ) )
			
			return Math.random()
		}

	}

	export class $hyoo_crowd_app_peer extends $.$hyoo_crowd_app_peer {

		@ $mol_mem
		sync_clock( next = new $hyoo_crowd_clock ) {
			return next
		}
		
		@ $mol_mem
		text( next?: string ) {
			this.sync()
			return $hyoo_crowd_text.for( this.store(), 0, 0 ).text( next )
		}
		
		@ $mol_mem
		delta() {
			this.text()
			return this.store().delta( this.sync_clock() )
		}
		
		@ $mol_mem
		delta_view() {
			return this.delta().slice().reverse().map( chunk => ({
				'Nest': $mol_int62_dump( chunk.nest_hi, chunk.nest_lo ),
				'Head': $mol_int62_dump( chunk.head_hi, chunk.head_lo ),
				'Prev': $mol_int62_dump( chunk.prev_hi, chunk.prev_lo ),
				'Next': $mol_int62_dump( chunk.next_hi, chunk.next_lo ),
				'Self': $mol_int62_dump( chunk.self_hi, chunk.self_lo ),
				'Peer': $mol_int62_dump( chunk.peer_hi, chunk.peer_lo ),
				'Time': $mol_int62_dump( chunk.time_hi, chunk.time_lo ),
				'Data': JSON.stringify( chunk.data ),
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
			return $hyoo_crowd_list.for( this.store(), 0, 0 ).list().length
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
			return this.store().delta().reduce( ( res, chunk )=> res + this.$.$hyoo_crowd_chunk_bin.from( chunk ).byteLength, 0 )
		}
		
		@ $mol_mem
		size_delta_bin() {
			return this.delta().reduce( ( res, chunk )=> res + this.$.$hyoo_crowd_chunk_bin.from( chunk ).byteLength, 0 )
		}
		
		stats() {
			this.text()
			return super.stats()
			.replace( '{peer}', $mol_int62_dump( this.store().peer.hi, this.store().peer.lo ) )
			.replace( '{changes}', this.changes().toLocaleString() )
			.replace( '{tokens:alive}', this.tokens_alive().toLocaleString() )
			.replace( '{tokens:dead}', this.tokens_dead().toLocaleString() )
			.replace( '{tokens:total}', this.tokens_total().toLocaleString() )
			.replace( '{stamp:now}', $mol_int62_dump( this.store().clock.last_hi, this.store().clock.last_lo ) )
			.replace( '{stamp:sync}', $mol_int62_dump( this.sync_clock().last_hi, this.sync_clock().last_lo ) )
			.replace( '{size:text}', this.size_text().toLocaleString() )
			.replace( '{size:state}', this.size_state_bin().toLocaleString() )
			.replace( '{size:delta}', this.size_delta_bin().toLocaleString() )
		}
		
	}
	
}
