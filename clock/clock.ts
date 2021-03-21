namespace $ {
	
	const concurrency = 1_000_000
	
	/** Manages stamps for composed CROWD stores */
	export class $hyoo_crowd_clock {
		
		readonly peer: number
		
		readonly saw_versions = new Map< number, number >()
		
		constructor(
			peer?: number,
			public version_max = 0,
		) {
			
			this.peer = peer
				? peer % concurrency
				: Math.floor( concurrency * Math.random() )
		
		}
		
		version_from( stamp: number ) {
			return Math.abs( stamp )
		}
		
		index_from( stamp: number ) {
			return Math.floor( Math.abs( stamp ) / concurrency )
		}
		
		peer_from( stamp: number ) {
			return Math.abs( stamp ) % concurrency
		}
		
		make( index: number, peer = this.peer ) {
			return index * concurrency + peer
		}
		
		feed( stamp: number ) {
			
			const version = this.version_from( stamp )
			
			if( this.version_max < version ) {
				this.version_max = version
			}
			
			if( this.saw_versions.get( version ) ?? 0 < version ) {
				this.saw_versions.set( this.peer_from( stamp ), version )
			}
			
		}
		
		is_new( stamp: number ) {
			const version = this.version_from( stamp )
			return version > ( this.saw_versions.get( this.peer_from( stamp ) ) ?? 0 )
		}
		
		is_ahead( clock: $hyoo_crowd_clock ) {
			
			for( const version of this.saw_versions.values() ) {
				if( clock.is_new( version ) ) return true
			}
			
			return false
		}
		
		genegate() {
			return this.version_max = ( Math.floor( this.version_max / concurrency ) + 1 ) * concurrency + this.peer
		}
		
		fork( peer: number ) {
			return new $hyoo_crowd_clock( peer, this.version_max )
		}
		
	}
	
}
