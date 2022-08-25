namespace $ {
	
	export enum $hyoo_crowd_peer_level {
		get = 0,
		add = 1,
		mod = 2,
		law = 3,
	}
	
	export class $hyoo_crowd_peer extends Object {
		
		id: $mol_int62_pair
		ids: $mol_int62_string
		
		constructor(
			readonly key_public: $mol_crypto_auditor_public,
			readonly key_public_serial: Uint8Array,
			readonly key_private: $mol_crypto_auditor_private,
			readonly key_private_serial: Uint8Array,
		) {
			super()
			this.id = $mol_int62_hash_buffer( this.key_public_serial )
			this.ids = $mol_int62_to_string( this.id )
		}
		
		static async generate() {
			
			const pair = await $$.$mol_crypto_auditor_pair()
			
			const public_serial = new Uint8Array( await pair.public.serial() )
			const private_serial = new Uint8Array( await pair.private.serial() )
			
			return new this( pair.public, public_serial, pair.private, private_serial )
			
		}
		
		static async restore(
			public_serial: Uint8Array,
			private_serial: Uint8Array,
		) {
			
			const pair = {
				public: await $$.$mol_crypto_auditor_public.from( public_serial ),
				private: await $$.$mol_crypto_auditor_private.from( private_serial ),
			}
			
			return new this( pair.public, public_serial, pair.private, private_serial )
	
		}
		
	}
	
}
