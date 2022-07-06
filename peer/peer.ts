namespace $ {
	
	export type $hyoo_crowd_peer = {
		readonly hi: number,
		readonly lo: number,
		readonly public_serial?: Uint8Array,
		readonly public?: $mol_crypto_auditor_public,
		readonly private?: $mol_crypto_auditor_private,
	}
	
	export async function $hyoo_crowd_peer_new() {
		
		const pair = await $$.$mol_crypto_auditor_pair()
		
		const public_serial = new Uint8Array( await pair.public.serial() )
		const [ hi, lo ] = $mol_int62_hash_buffer( public_serial )
		
		return { hi, lo, public_serial, ... pair } as $hyoo_crowd_peer

	}
	
	export async function $hyoo_crowd_peer_restore(
		public_serial: Uint8Array,
		private_serial: Uint8Array,
	) {
		
		const pair = {
			public: await $$.$mol_crypto_auditor_public.from( public_serial ),
			private: await $$.$mol_crypto_auditor_private.from( private_serial ),
		}
		
		const [ hi, lo ] = $mol_int62_hash_buffer( public_serial )
		
		return { hi, lo, public_serial, ... pair } as $hyoo_crowd_peer

	}
	
}
