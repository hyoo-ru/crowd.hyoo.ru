namespace $ {
	
	const max_peer = 2 ** ( 6 * 8 ) - 1
	const max_guid = 2 ** ( 6 * 8 ) - 1
	
	/** Conflict-free Tree */
	export class $hyoo_crowd_tree {
		
		constructor(
			readonly peer = Math.ceil( Math.random() * max_peer )
		) { }
		
		clock = new $hyoo_crowd_clock
		
		protected nodes = new Map<
			$hyoo_crowd_node['guid'],
			$hyoo_crowd_node | undefined
		>([[
			0,
			new $hyoo_crowd_node(
				0,
				0,
				0,
				0,
				0,
				null,
			)
		]])
		
		protected kids = new Map< number, $hyoo_crowd_node[] >()
		
		node( guid: $hyoo_crowd_node['guid'] ) {
			return this.nodes.get( guid )!
		}
		
		get root() {
			return this.node( 0 )
		}
		
		/** Returns list of all alive children of node. */ 
		list( guid: number ): readonly $hyoo_crowd_node[] {
			return this.kids.get( guid )?.filter( node => node.data !== null ) ?? []
		}
		
		/** Makes independent clone with defined peer. */
		fork( peer: number ) {
			return new $hyoo_crowd_tree( peer ).apply( this.delta() )
		}
		
		/** Makes Delta betwteen Clock and now. */
		delta(
			clock = new $hyoo_crowd_clock,
		) {
			
			const delta = [] as $hyoo_crowd_node[]
			
			for( const node of this.nodes.values() ) {
				
				if( !node?.guid ) continue
				
				const version = clock.get( node!.peer )
				if( version && node!.version <= version ) continue
				
				delta.push( node! )
			}
			
			return delta as readonly $hyoo_crowd_node[]
		}
		
		/** Applies Delta to current state. */
		apply( delta: readonly $hyoo_crowd_node[] ) {
			
			for( const patch of delta ) {
				
				this.clock.see( patch.peer, patch.version )
				
				let node = this.nodes.get( patch.guid )
				if( node ) {
					
					if( patch.version < node.version ) continue
					if( patch.version === node.version && patch.peer < node.peer ) continue
				
					this.back_unlink( node )
					
				}
				
				this.nodes.set( patch.guid, patch )
				this.back_link( patch )
				
			}
			
			return this
		}
		
		/** Makes back links to node inside Parent/Leader */
		protected back_link( node: $hyoo_crowd_node ) {
			
			let parent = this.nodes.get( node.parent )!
			let leader = node.leader ? this.nodes.get( node.leader )! : null
			
			let siblings = this.kids.get( parent.guid )
			if( siblings ) {
				const index = leader ? siblings.indexOf( leader ) + 1 : 0
				siblings.splice( index, 0, node )
			} else {
				this.kids.set( parent.guid, [ node ] )
			}

			return this
		}
		
		/** Romoves back links to node inside Parent/Leader */
		protected back_unlink( node: $hyoo_crowd_node ) {
			
			let parent = this.nodes.get( node.parent )!
			let siblings = this.kids.get( parent.guid )!
			
			const index = siblings.indexOf( node )
			siblings.splice( index, 1 )
			
			return this
		}
		
		/** Marks node with its subtree as deleted and wipes data. */
		wipe( node: $hyoo_crowd_node ) {
			
			if( node.data === null ) return this
			
			for( const kid of this.list( node.guid ) ) {
				this.wipe( kid )
			}
			
			return this.apply([
				node.wiped( this.peer, this.clock.tick( this.peer ) )
			])
			
		}
		
		/** Places data to tree. */
		put( {
			guid = Math.ceil( Math.random() * max_guid ),
			parent = 0,
			leader = 0,
			data = null,
		}: Partial< Pick< $hyoo_crowd_node, 'guid' | 'parent' | 'leader' | 'data' > > ) {
			
			this.apply([
				new $hyoo_crowd_node(
					guid,
					parent,
					leader,
					this.peer,
					this.clock.tick( this.peer ),
					data,
				)
			])
			
			return guid
		}
		
	}
	
}
