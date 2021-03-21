namespace $ {
	
	const concurrency = 1_000_000
	
	/** Manages versions through composed CROWD stores */
	export class $hyoo_crowd_stamper {
		
		readonly peer: number
		
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
		
		feed( version: number ) {
			if( this.version_max > version ) return
			this.version_max = version
		}
		
		genegate() {
			return this.version_max = ( Math.floor( this.version_max / concurrency ) + 1 ) * concurrency + this.peer
		}
		
		fork( peer: number ) {
			return new $hyoo_crowd_stamper( peer, this.version_max )
		}
		
	}
	
}
