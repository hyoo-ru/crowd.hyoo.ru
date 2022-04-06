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
			return $hyoo_crowd_text.for( this.store() ).text( next )
		}
		
		@ $mol_mem
		delta() {
			this.text()
			return this.store().delta( this.sync_clock() )
		}
		
		@ $mol_mem
		delta_view() {
			return this.delta().map( chunk => ({
				head: chunk.head.toString(36).toUpperCase(),
				self: chunk.self.toString(36).toUpperCase(),
				prev: chunk.prev.toString(36).toUpperCase(),
				next: chunk.next.toString(36).toUpperCase(),
				peer: chunk.peer.toString(36).toUpperCase(),
				time: chunk.time.toString(36).toUpperCase(),
				data: JSON.stringify( chunk.data ),
			}) )
		}
		
		changes() {
			return this.delta().length
		}
		
		size_state() {
			return $mol_charset_encode( JSON.stringify( this.store() ) ).length
		}
		
		size_delta() {
			return $mol_charset_encode( JSON.stringify( this.delta() ) ).length
		}
		
		size_text() {
			return $mol_charset_encode( this.text() ).length
		}
		
		tokens_alive() {
			this.text()
			return $hyoo_crowd_list.for( this.store() ).list().length
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
			return this.store().delta().reduce( ( res, chunk )=> res + this.$.$hyoo_crowd_chunk_pack( chunk ).length, 0 )
		}
		
		@ $mol_mem
		size_delta_bin() {
			return this.delta().reduce( ( res, chunk )=> res + this.$.$hyoo_crowd_chunk_pack( chunk ).length, 0 )
		}
		
		stats() {
			this.text()
			return super.stats()
			.replace( '{peer}', this.store().peer.toString(36).toUpperCase() )
			.replace( '{changes}', this.changes().toLocaleString() )
			.replace( '{tokens:alive}', this.tokens_alive().toLocaleString() )
			.replace( '{tokens:dead}', this.tokens_dead().toLocaleString() )
			.replace( '{tokens:total}', this.tokens_total().toLocaleString() )
			.replace( '{stamp:now}', this.store().clock.now.toString(36).toUpperCase() )
			.replace( '{stamp:sync}', this.sync_clock().now.toString(36).toUpperCase() )
			.replace( '{size:text}', this.size_text().toLocaleString() )
			.replace( '{size:state}', this.size_state().toLocaleString() )
			.replace( '{size:delta}', this.size_delta().toLocaleString() )
			.replace( '{size:text:bin}', this.size_text().toLocaleString() )
			.replace( '{size:state:bin}', this.size_state_bin().toLocaleString() )
			.replace( '{size:delta:bin}', this.size_delta_bin().toLocaleString() )
		}
		
	}
	
}
