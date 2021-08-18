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
			return this.store().root.text( next )
		}
		
		delta() {
			this.text()
			return this.store().delta( this.sync_clock() )
		}
		
		changes() {
			this.text()
			const clock = this.store().clock
			return clock.now - this.sync_clock().now
		}
		
		size_state() {
			this.text()
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
			return this.store().root.list().length
		}
		
		tokens_total() {
			this.text()
			return this.store().size()
		}
		
		tokens_dead() {
			return this.tokens_total() - this.tokens_alive()
		}
		
		stats() {
			this.text()
			return super.stats()
			.replace( '{peer}', this.store().peer.toLocaleString() )
			.replace( '{changes}', this.changes().toLocaleString() )
			.replace( '{tokens:alive}', this.tokens_alive().toLocaleString() )
			.replace( '{tokens:dead}', this.tokens_dead().toLocaleString() )
			.replace( '{tokens:total}', this.tokens_total().toLocaleString() )
			.replace( '{stamp:now}', this.store().clock.now.toLocaleString() )
			.replace( '{stamp:sync}', this.sync_clock().now.toLocaleString() )
			.replace( '{size:text}', this.size_text().toLocaleString() )
			.replace( '{size:state}', this.size_state().toLocaleString() )
			.replace( '{size:delta}', this.size_delta().toLocaleString() )
		}
		
	}
	
}
