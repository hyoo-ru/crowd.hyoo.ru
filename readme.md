# Conflict-free Reinterpretable Ordered Washed Data (CROWD)

![](https://habrastorage.org/webt/lz/d_/kh/lzd_khq4fnql2hgo3zlhfwkebg4.png)

## Key Properties

### Conflict-free

- Any states can be merged without conflicts.
- Strong Eventual Consistency.
- Merge result is independent of merge order on different actors.
- Branch merge is semilattice.

### Reinterpretable

- Same state can be reinterpreted as any CROWD Storage.
- CROWD Storage type can be changed dynamicaly without data migration.
- Cross-merge is available between different CROWD Storages.

### Ordered

- Changes from same actor are always ordered and can't be reordered.
- Deltas from same actor aren't commutative.
- All deltas are idempotent.

### Washed

- Historical data isn't stored (except tombstones).
- Small footprint. Metadata size ~= user data size.
- Past state can't be reproduced.
- Garbage collection isn't required.

### Data

- Closest to user data as more as possible. Just list of values and list of stamps.
- Deltas are simple slices of full state.
- Deltas can be merged together to reduce transmit size.

## Comparison of Approaches

### With [CRDT](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type)

- CRDT has stronger guarantees for events commutativity. It gives a strong restriction for deleting old data. CROWD slightly weakens the guarantees, which gives more compact data representation without garbage collection and compactification.
- Some CROWD storages are accidentally dCRDT too.
- Stored CROWD State can be reinterpredeted by different CROWD Storages. Different CROWD Storages may be cross merged. CRDT structures are incompatible in general.

### With [OT](https://en.wikipedia.org/wiki/Operational_transformation)

- OT stores full edit history which is redundant. CROWD competely erases history. For history navigation purposes periodically snapshots is better solution for both.
- OT requires history rebase for convergence. This is too slow and complex. CROWD merge is very simple and fast.

## Available Stores

| CROWD | CRDT |
|-------|------|
| [CROWD Counter](./numb) | Is equal to dCRDT PN-Counter
| [CROWD Register](./reg) | Is same as CvRDT LWW-Register
| [CROWD Unordered Set](./set) | Is equal to dCRDT LWW-Element-Set
| [CROWD Ordered Set](./list) | No equal type
| [CROWD Tagged Union](./union) | No equal type
| [CROWD Dictionary](./dict) | No equal type
| [CROWD Text](./text) | No equal type
| CROWD JSON | No equal type
| CROWD Graph | No equal type

## Utilites

- [CROWD Store](./store) - Base store class with common CROWD API.
- [CROWD Stamper](./stamper) - Manages versions through composed CROWD Stores.

## Common API

- `toJSON( version_min = 0 )` Returns delta between `version_min` and current.
- `apply( delta )` Merges delta to current state.
- `delta( store )` Returns delta between base fork and current.
- `fork( actor: number )` Makes independent clone with fixed actor id for testing purposes.

## State/Delta Format

```javascript
{
	"values": ( string | number | boolean | null )[]
	"stamps": number[] // ints
}
```

## Reinterpretations

| From \ To     | Counter                   | Register               | Unordered Set            | Ordered Set               | Tagged Union     | Dictionary                 | Text
|---------------|---------------------------|------------------------|--------------------------|---------------------------|------------------|----------------------------|---------
| Counter       | ✅ Same                   | ❌                    | ⭕ Set of summands       | ⭕ Set of summands       | ❌               | ❌                        | ❌
| Register      | ✅ As first summand       | ✅ Same               | ✅ As key                | ✅ As key                | ⭕ As first type | ❌                        | ❌
| Unordered Set | ❌                        | ⭕ Last added key     | ✅ Same                  | ✅ Accidental order      | ❌               | ❌                        | ❌
| Ordered Set   | ❌                        | ⭕ Last inserted key  | ✅ Remain order          | ✅ Same                  | ❌               | ❌                        | ❌
| Tagged Union  | ✅ Value as first summand | ✅ Value              | ⭕ Set of type and value | ⭕ Set of type and value | ✅ Same          | ❌                        | ❌
| Dictionary    | ❌                        | ⭕ Last changed value | ⭕ Set of values         | ⭕ Set of values         | ❌               | ✅ Same                   | ❌
| Text          | ❌                        | ❌                    | ❌                       | ❌                       | ❌               | ⭕ With keys: flow, tuple | ✅ Same

- ✅ Expected behaviour.
- ⭕ Unexpected but acceptable behaviour.
- ❌ Unacceptable behaviour in most cases.

## Usage Example

```typescript
// // Usage from NPM. Isn't required in MAM.
// import {
//   $hyoo_crowd_numb,
//   $hyoo_crowd_reg,
//   $hyoo_crowd_set
//   $hyoo_crowd_list,
//   $hyoo_crowd_union,
//   $hyoo_crowd_dict,
//   $hyoo_crowd_text,
// } from 'hyoo_crowd_lib'

// Dynamic typing in custom store
const MyStore = $hyoo_crowd_dict.of(
  $hyoo_crowd_union.of({
    counter: $hyoo_crowd_numb,
    boolean: $hyoo_crowd_reg,
    number: $hyoo_crowd_reg,
    string: $hyoo_crowd_reg,
    sequence: $hyoo_crowd_list
  })
);

// Normal store creation
const base = MyStore.make();

// Make independent forks for testng
const alice = base.fork(1);
const bob = base.fork(2);
const carol = base.fork(3);

// Twice change register named "foo"
alice.for("foo").to("string").str = "A1";
alice.for("foo").to("string").str = "A2";

// Change register named "foo" then converts it to sequence and insert value
bob.for("foo").to("string").str = "B1";
bob.for("foo").to("sequence").insert("B2").insert("B3");

// Serial insert to sequence named "foo"
carol.for("foo").to("sequence").insert("C1").insert("C2");

// Make deltas
const alice_delta = alice.delta(base);
const bob_delta = bob.delta(base);
const carol_delta = carol.delta(base);

// Cross merge all of them
alice.apply(bob_delta).apply(carol_delta);
bob.apply(alice_delta).apply(carol_delta);
carol.apply(bob_delta).apply(alice_delta);

// ["A2","C1","C2","B1","B2","B3"]
console.log(
  alice.for("foo").as("sequence").items,
  bob.for("foo").as("sequence").items,
  carol.for("foo").as("sequence").items
);
```

[Sandbox](https://codepen.io/nin-jin/pen/JjbqRYX?editors=0000011)

# Comparison of Libraries

|                     | [$hyoo_crowd](https://github.com/hyoo-ru/crowd.hyoo.ru) | [Automerge](https://github.com/automerge/automerge) | [YJS](https://github.com/yjs/yjs)   | [delta-crdt](https://github.com/peer-base/js-delta-crdts)
|---------------------|------------|-----------|-------|-----------
| Approach            | CROWD      | CRDT      | CRDT  | CRDT
| Gzipped Bundle Size | [4 KB](https://bundlephobia.com/result?p=hyoo_crowd_lib@1.0.2)       | [60 KB](https://bundlephobia.com/result?p=automerge@0.14.2)     | [23 KB](https://bundlephobia.com/result?p=yjs@13.5.2) | [43 KB](https://bundlephobia.com/result?p=delta-crdts@0.10.3)
| Sequence: Push+Shift | 1 µs | 200 µs | 7 µs

## Benchmarks

### [Sequence: Push+Shift](https://perf.js.hyoo.ru/#prefixes=%5B%22%24mol_import.script%28'https%3A%2F%2Funpkg.com%2Fhyoo_crowd_lib%401.0.4%2Fweb.js'%29%5Cnlet%20doc%20%3D%20%24hyoo_crowd_dict.of%28%7B%5Cn%5Ctseq%3A%20%24hyoo_crowd_dict.of%28%7B%20list%3A%20%24hyoo_crowd_list%20%7D%29%2C%5Cn%7D%29.make%28%29%5Cnconst%20list%20%3D%20doc.for%28%20'seq'%20%29.for%28%20'list'%20%29%22%2C%22%24mol_import.script%28'https%3A%2F%2Funpkg.com%2Fautomerge%400.14.2%2Fdist%2Fautomerge.js'%29%5Cnlet%20doc%20%3D%20Automerge.from%28%7B%20list%3A%20%5B%5D%20%7D%29%22%2C%22const%20%7B%20Doc%20%7D%20%3D%20%24mol_import.module%28'https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fyjs%2F%2Besm'%29%5Cnconst%20doc%20%3D%20new%20Doc%5Cnconst%20list%20%3D%20doc.getArray%28%20'list'%20%29%22%5D/sources=%5B%22list.insert%28%20%7B%23%7D%20%29%5Cnif%28%20%7B%23%7D%20%3E%20max_count%20%29%5Cn%5Ctlist.cut%28%20list.items%5B0%5D%20%29%5Cn%22%2C%22doc%20%3D%20Automerge.change%28%20doc%2C%20'op'%2C%20doc%20%3D%3E%20%7B%5Cn%5Ctdoc.list.push%28%7B%23%7D%29%5Cn%5Ctif%28%20%7B%23%7D%20%3E%20max_count%20%29%5Cn%5Ct%5Ctdoc.list.shift%28%29%5Cn%7D%20%29%22%2C%22list.push%28%5B%7B%23%7D%5D%29%5Cnif%28%20%7B%23%7D%20%3E%20max_count%20%29%5Cn%5Ctlist.delete%280%2C1%29%22%5D/prefix=const%20max_count%20%3D%20100)

![](https://i.imgur.com/6ENhevv.png)

### [crdt-benchmarks](https://github.com/dmonad/crdt-benchmarks)
