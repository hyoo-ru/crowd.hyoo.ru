namespace $.$$ {

	export class $hyoo_crowd_app extends $.$hyoo_crowd_app {

		left_store = $hyoo_crowd_text.make()
		right_store = $hyoo_crowd_text.make()
		
		@ $mol_mem
		left( next?: string ) {
			
			this.sync()
			
			if( next !== undefined ) this.left_store.text = next
			return this.left_store.text
			
		}
		
		@ $mol_mem
		right( next?: string ) {
			
			this.sync()
			
			if( next !== undefined ) this.right_store.text = next
			return this.right_store.text
			
		}
		
		left_sync_version = 0
		right_sync_version = 0
		
		@ $mol_mem
		sync( next?: Event ) {
			
			const left_delta = this.left_store.toJSON( this.left_sync_version )
			const right_delta = this.right_store.toJSON( this.right_sync_version )
			
			this.left_sync_version = this.left_store.stamper.version_max
			this.right_sync_version = this.right_store.stamper.version_max
			
			this.left_store.apply( right_delta )
			this.right_store.apply( left_delta )
			
			return Math.random()
		}

	}

}
