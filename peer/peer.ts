namespace $ {
	
	export enum $hyoo_crowd_peer_level {
		get = 0,
		add = 1,
		mod = 2,
		law = 3,
	}
	
	export class $hyoo_crowd_peer extends Object {
		
		id: $mol_int62_string
		
		constructor(
			readonly key_public: $mol_crypto_auditor_public,
			readonly key_public_serial: string,
			readonly key_private: $mol_crypto_auditor_private,
			readonly key_private_serial: string,
		) {
			super()
			this.id = $mol_int62_hash_string( this.key_public_serial )
		}
		
		static async generate() {
			
			const pair = await $$.$mol_crypto_auditor_pair()
			const serial = await pair.private.serial()
			
			return new this(
				pair.public,
				$mol_crypto_auditor_private_to_public( serial ),
				pair.private,
				serial,
			)
			
		}
		
		static async restore(
			serial: string,
		) {
			
			return new this(
				await $$.$mol_crypto_auditor_public.from( serial ),
				$mol_crypto_auditor_private_to_public( serial ),
				await $$.$mol_crypto_auditor_private.from( serial ),
				serial,
			)
	
		}
		
	}
	
}
