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
			
			this.Left().sync_clock( this.Left().store().clock.fork(0) )
			this.Right().sync_clock( this.Right().store().clock.fork(0) )
			
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
			return this.store().text( next )
		}
		
		delta() {
			this.text()
			return this.store().delta( this.sync_clock() )
		}
		
		changes() {
			this.text()
			const clock = this.store().clock
			return clock.index_from( clock.version_max ) - clock.index_from( this.sync_clock().version_max )
		}
		
		size_state() {
			this.text()
			return JSON.stringify( this.store() ).length
		}
		
		size_delta() {
			return JSON.stringify( this.delta() ).length
		}
		
		tokens_alive() {
			this.text()
			return this.store().root.items_internal.length
		}
		
		tokens_total() {
			this.text()
			return this.store().for( 'token' ).stores.size
		}
		
		tokens_dead() {
			return this.tokens_total() - this.tokens_alive()
		}
		
		stats() {
			this.text()
			return super.stats()
			.replace( '{peer}', this.store().clock.peer.toLocaleString() )
			.replace( '{changes}', this.changes().toLocaleString() )
			.replace( '{tokens:alive}', this.tokens_alive().toLocaleString() )
			.replace( '{tokens:dead}', this.tokens_dead().toLocaleString() )
			.replace( '{tokens:total}', this.tokens_total().toLocaleString() )
			.replace( '{stamp:now}', this.store().clock.version_max.toLocaleString() )
			.replace( '{stamp:sync}', this.sync_clock().version_max.toLocaleString() )
			.replace( '{size:text}', this.text().length.toLocaleString() )
			.replace( '{size:state}', this.size_state().toLocaleString() )
			.replace( '{size:delta}', this.size_delta().toLocaleString() )
			.replace( '{dump:delta}', JSON.stringify( this.delta() ) )
		}
		
	}
	
}
