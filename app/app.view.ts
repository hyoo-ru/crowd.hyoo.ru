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
			
			this.Left().sync_stamp( this.Left().store().stamper.version_max )
			this.Right().sync_stamp( this.Right().store().stamper.version_max )
			
			return Math.random()
		}

	}

	export class $hyoo_crowd_app_actor extends $.$hyoo_crowd_app_actor {

		@ $mol_mem
		sync_stamp( next = 0 ) {
			return next
		}
		
		@ $mol_mem
		text( next?: string ) {
			
			this.sync()
			
			if( next !== undefined ) this.store().text = next
			return this.store().text
			
		}
		
		delta() {
			this.text()
			return this.store().toJSON( this.sync_stamp() )
		}
		
		changes() {
			this.text()
			const stamper = this.store().stamper
			return stamper.index_from( stamper.version_max ) - stamper.index_from( this.sync_stamp() )
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
			return this.store().root.items_internal.length
		}
		
		tokens_dead() {
			return this.tokens_total() - this.tokens_alive()
		}
		
		stats() {
			this.text()
			return super.stats()
			.replace( '{actor}', this.store().stamper.actor.toLocaleString() )
			.replace( '{changes}', this.changes().toLocaleString() )
			.replace( '{tokens:alive}', this.tokens_alive().toLocaleString() )
			.replace( '{tokens:dead}', this.tokens_dead().toLocaleString() )
			.replace( '{tokens:total}', this.tokens_total().toLocaleString() )
			.replace( '{stamp:now}', this.store().stamper.version_max.toLocaleString() )
			.replace( '{stamp:sync}', this.sync_stamp().toLocaleString() )
			.replace( '{size:text}', this.text().length.toLocaleString() )
			.replace( '{size:state}', this.size_state().toLocaleString() )
			.replace( '{size:delta}', this.size_delta().toLocaleString() )
		}
		
	}
	
}
