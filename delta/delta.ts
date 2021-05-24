namespace $ {
	
	/** Atomic primitive values that can be stored in CROWD stores */
	export type $hyoo_crowd_delta_value = string | number | boolean | null

	/** Makes CROWD Delta or State */
	export function $hyoo_crowd_delta(
		values: $hyoo_crowd_delta_value[],
		stamps: number[],
		clock: number[],
	) {
		return { values, stamps, clock }
	}
	
}
