# CROWDs

Conflict-free Reinterpretable Ordered Washed Data (Secure) - Delta CRDT with additional abilities.

![](./logo/logo.svg)

# Key Properties

## Conflict-free

- Any states can be merged without conflicts.
- Convergence (Strong Eventual Consistency).
- Merge result is independent of merge order.
- Merge is semilattice.

## Reinterpretable

- Same state can be reinterpreted as any Type.
- Type of data can be changed dynamicaly without data migration.
- Cross-merge between different types is available.

## Ordered

- Every data have a stable place in the document.
- Wiped data inside some Head stays tombstone to hold place.
- Interleaving-free.

## Washed

- Wiped data complely reoved from state.
- Past state can't be reproduced. Snapshots/layers/changelog should be used for this.
- Small footprint. Metadata size ~= 4x-8x user data size.
- Garbage collection isn't required.

## Data

- All deltas are idempotent.
- Closest to user data as more as possible.
- Every word is just one chunk.
- Delta is simply slice of full state.
- Deltas can be merged together to reduce transmit size.

## Secure

- Every chunk can be crypto signed separately.
- Every peer checks signs and rejects incorrect chunks.
- Every chunk can be crypto encoded.
- Conflict-free merge avaailable without decodign.
- Merging doesn't invalidate signs.

# Vocabulary

- **Doc** - Full CROWD document (DAG) which consists of real Chunks and virtual Nodes over them.
- **Node** - A single subtree which represented by few chunks with same Self in different Heads.
- **Chunk** - Minimal atomic chunk of data with metadata. It's extended LWW-Register.
  - **Self** -
  - **Head** -
  - **Lead** -
  - **Seat** -
  - **Peer** - Global unique identifier of independent actor.
  - **Time** -
  - **Data** -
  - **Sign** -
- **Clock** - Vector clock. Dictionary which maps Peer to Time.
- **Token** - Minimal meaningfull part of text (single word + punctuation + one space).
- **Point** -
- **Range** -
- **Offset** -

# Data Types Representation

![](./diagram/chunk.svg)

## Atomic JSON

Single value store. Just CvRDT LWW-Register.

- `value( next?: unknown )` Current raw value or `null` by default.
- `bool( next?: boolean )` Current value as `boolean` or `false` by default.
- `numb( next?: number )` Current value as `number` or `0` by default.
- `str( next?: string )` Current value as `string` or `""` by default.

## Mergable Struct

## Mergable Ordered List

## Mergable Ordered Dictionary

## Mergable Text

## Mergable Tree

## Mergable Graph

# Comparison of Approaches

## With [CRDT](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type)

- CRDT has stronger guarantees for events commutativity. It gives a strong restriction for deleting old data. CROWD slightly weakens the guarantees, which gives more compact data representation without garbage collection and compactification.
- Some CROWD storages are accidentally dCRDT too.
- Stored CROWD State can be reinterpredeted by different CROWD Storages. Different CROWD Storages may be cross merged. CRDT structures are incompatible in general.

## With [OT](https://en.wikipedia.org/wiki/Operational_transformation)

- OT stores full edit history which is redundant. CROWD competely erases history. For history navigation purposes periodically snapshots is better solution for both.
- OT requires history rebase for convergence. This is too slow and complex. CROWD merge is very simple and fast.

# Available Stores

| CROWD | CRDT |
|-------|------|
| [CROWD Text](https://github.com/hyoo-ru/crowd.hyoo.ru/blob/master/text) | No equal type
| CROWD JSON | No equal type
| CROWD Graph | No equal type

# Utilites

- [CROWD Store](https://github.com/hyoo-ru/crowd.hyoo.ru/blob/master/store) - Base store class with common CROWD API.
- [CROWD Clock](https://github.com/hyoo-ru/crowd.hyoo.ru/blob/master/clock) - Manages stamps for composed CROWD stores.

# Common API

- `delta( clock )` Returns delta between past clock and now.
- `apply( delta )` Merges delta to current state.
- `toJSON()` Returns full state dump.
- `fork( peer: number )` Makes independent clone with fixed peer id for testing purposes.

# State/Delta Format

```typescript
type Chunk = {
    head: number
    self: number
    lead: number
    seat: number
    peer: number
    time: number
    data: unknown
    sign: null | Uint8Array & { length: 32 }
}

type State = Chunk[]
type Delta = readonly Chunk[]
```

# Reinterpretations

- ✅ Expected behaviour.
- ⭕ Unexpected but acceptable behaviour.
- ❌ Unacceptable behaviour in most cases.

| What \ As  | Atom                        | Struct                           | List               | Dictionary               | Text
|------------|-----------------------------|----------------------------------|--------------------|--------------------------|-------------------------------------
| Atom       | ✅ Same                     | ⭕ Nullish fields               | ✅ As single item  | ✅ As key               | ✅ As string as single token
| Struct     | ⭕ Last changed field value | ✅ Same                         | ⭕ Field values    | ❌ Field values as keys | ⭕ Field values as string as tokens
| List       | ⭕ Last changed item        | ⭕ Nullish fields               | ✅ Same            | ✅ Items as keys        | ❌ Items as strings as tokens
| Dictionary | ⭕ Last changed key         | ✅ keys values as fields values | ✅ Keys            | ✅ Same                 | ✅ Keys as tokens
| Text       | ❌ Last changed token       | ⭕ Nullish fields               | ✅ Tokens          | ❌ Tokens as keys       | ✅ Same

# Usage Example

```typescript
// // Usage from NPM. Isn't required in MAM.
// import {
//   $hyoo_crowd_reg,
//   $hyoo_crowd_union,
//   $hyoo_crowd_set
//   $hyoo_crowd_list,
//   $hyoo_crowd_dict,
//   $hyoo_crowd_text,
// } from 'hyoo_crowd_lib'

// Dynamic typing in custom store
const MyStore = $hyoo_crowd_dict.of({
  val: $hyoo_crowd_union.of({
    bool: $hyoo_crowd_reg,
    numb: $hyoo_crowd_reg,
    str: $hyoo_crowd_reg,
    seq: $hyoo_crowd_list
  })
});

// Normal store creation
const base = MyStore.make();

// Make independent forks for testng
const alice = base.fork(1);
const bob = base.fork(2);
const carol = base.fork(3);

// Twice change register named "foo"
alice.for("foo").to("str").str("A1");
alice.for("foo").to("str").str("A2");

// Change register named "foo" then converts it to sequence and insert value
bob.for("foo").to("str").str("B1");
bob.for("foo").to("seq").insert("B2").insert("B3");

// Serial insert to sequence named "foo"
carol.for("foo").to("seq").insert("C1").insert("C2");

// Make deltas
const alice_delta = alice.delta(base.clock);
const bob_delta = bob.delta(base.clock);
const carol_delta = carol.delta(base.clock);

// Cross merge all of them
alice.apply(bob_delta).apply(carol_delta);
bob.apply(alice_delta).apply(carol_delta);
carol.apply(bob_delta).apply(alice_delta);

// ["A2","C1","C2","B1","B2","B3"]
console.log(
  alice.for("foo").as("seq").items,
  bob.for("foo").as("seq").items,
  carol.for("foo").as("seq").items
);
```

[Sandbox](https://codepen.io/nin-jin/pen/JjbqRYX?editors=0000011)

# Comparison of Libraries

|                        | [$hyoo_crowd](https://github.com/hyoo-ru/crowd.hyoo.ru) | [Automerge](https://github.com/automerge/automerge) | [YJS](https://github.com/yjs/yjs)   | [delta-crdt](https://github.com/peer-base/js-delta-crdts)
|------------------------|------------|-----------|-------|-----------
| Approach               | CROWD      | CRDT      | CRDT  | CRDT
| Garbage Collection     | Doesn't required      | Stores full history      | Enabled by default  | ❓
| Gzipped Bundle Size    | [4 KB](https://bundlephobia.com/result?p=hyoo_crowd_lib)       | [60 KB](https://bundlephobia.com/result?p=automerge)     | [23 KB](https://bundlephobia.com/result?p=yjs) | [43 KB](https://bundlephobia.com/result?p=delta-crdts)
| Sequence: Push + Shift | 2 µs | 400 µs | 50 µs
| Text: Append + Crop    | 16 µs | 1050 µs | 72 µs

## Benchmarks

### [Sequence: Push + Shift](https://perf.js.hyoo.ru/#prefixes=%5B%22%24mol_import.script%28'https%3A%2F%2Funpkg.com%2Fhyoo_crowd_lib%2Fweb.js'%29%5Cnlet%20doc%20%3D%20%24hyoo_crowd_dict.of%28%7B%5Cn%5Ctlist%3A%20%24hyoo_crowd_list%2C%5Cn%7D%29.make%28%29%5Cnconst%20list%20%3D%20doc.for%28%20'list'%20%29%22%2C%22%24mol_import.script%28'https%3A%2F%2Funpkg.com%2Fautomerge%400.14.2%2Fdist%2Fautomerge.js'%29%5Cnlet%20doc%20%3D%20Automerge.from%28%7B%20list%3A%20%5B%5D%20%7D%29%22%2C%22const%20%7B%20Doc%20%7D%20%3D%20%24mol_import.module%28'https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fyjs%2F%2Besm'%29%5Cnconst%20doc%20%3D%20new%20Doc%5Cnconst%20list%20%3D%20doc.getArray%28%20'list'%20%29%22%5D/sources=%5B%22list.insert%28%20%7B%23%7D%20%29%5Cnif%28%20%7B%23%7D%20%3E%20max_count%20%29%5Cn%5Ctlist.cut%28%20list.items_internal%5B0%5D%20%29%5Cn%22%2C%22doc%20%3D%20Automerge.change%28%20doc%2C%20'op'%2C%20doc%20%3D%3E%20%7B%5Cn%5Ctdoc.list.push%28%7B%23%7D%29%5Cn%5Ctif%28%20%7B%23%7D%20%3E%20max_count%20%29%5Cn%5Ct%5Ctdoc.list.shift%28%29%5Cn%7D%20%29%22%2C%22list.push%28%5B%7B%23%7D%5D%29%5Cnif%28%20%7B%23%7D%20%3E%20max_count%20%29%5Cn%5Ctlist.delete%280%2C1%29%22%5D/prefix=const%20max_count%20%3D%20100)

### Chrome 89
![](https://i.imgur.com/6ENhevv.png)

### FireFox 86
![](https://i.imgur.com/QozvpBe.png)

### [Text: Append + Crop](https://perf.js.hyoo.ru/#prefixes=%5B%22%24mol_import.script%28'https%3A%2F%2Funpkg.com%2Fhyoo_crowd_lib%2Fweb.js'%29%5Cnlet%20doc%20%3D%20%24hyoo_crowd_text.make%28%29%22%2C%22%24mol_import.script%28'https%3A%2F%2Funpkg.com%2Fautomerge%400.14.2%2Fdist%2Fautomerge.js'%29%5Cnlet%20doc%20%3D%20Automerge.from%28%7B%7D%29%5Cndoc%20%3D%20Automerge.change%28doc%2C%20doc%20%3D%3E%20%7B%5Cn%5Ctdoc.text%20%3D%20new%20Automerge.Text%28%29%5Cn%7D%29%22%2C%22const%20%7B%20Doc%2C%20Text%20%7D%20%3D%20%24mol_import.module%28'https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fyjs%2F%2Besm'%29%5Cnconst%20doc%20%3D%20new%20Doc%5Cnconst%20text%20%3D%20doc.get%28%20'text'%2C%20Text%20%29%22%5D/sources=%5B%22%7B%5Cn%5Ctconst%20word%20%3D%20String%28%7B%23%7D%29%20%2B%20'%20'%5Cn%5Ctdoc.write%28%20word%20%29%5Cn%5Ctif%28%20%7B%23%7D%20%3E%20max_count%20%29%5Cn%5Ct%5Ctdoc.write%28%20''%2C%200%2C%20word.length%20%29%5Cn%7D%22%2C%22doc%20%3D%20Automerge.change%28%20doc%2C%20'op'%2C%20doc%20%3D%3E%20%7B%5Cn%5Ctconst%20word%20%3D%20String%28%7B%23%7D%29%20%2B%20'%20'%5Cn%5Ctdoc.text.insertAt%28%20doc.text.length%2C%20...%20word%20%29%5Cn%5Ctif%28%20%7B%23%7D%20%3E%20max_count%20%29%5Cn%5Ct%5Ctfor%28%20let%20i%20%3D%200%3B%20i%20%3C%20word.length%3B%20%2B%2Bi%20%29%5Cn%5Ct%5Ct%5Ctdoc.text.deleteAt%280%29%5Cn%7D%20%29%22%2C%22%7B%5Cn%5Ctconst%20word%20%3D%20String%28%7B%23%7D%29%20%2B%20'%20'%5Cn%5Cttext.insert%28%20text.length%2C%20word%20%29%5Cn%5Ctif%28%20%7B%23%7D%20%3E%20max_count%20%29%5Cn%5Ct%5Cttext.delete%28%200%2C%20word.length%20%29%5Cn%7D%22%5D/prefix=const%20max_count%20%3D%20100/postfix)

### Chrome 89

![](https://i.imgur.com/Hp877Ai.png)

### FireFox 86

![](https://i.imgur.com/VI53tQ3.png)

### [crdt-benchmarks](https://github.com/dmonad/crdt-benchmarks)

# Community

- Leave us a feedback in [duscussions section](https://github.com/hyoo-ru/crowd.hyoo.ru/discussions).
- Support [Hyoo Guild](https://github.com/hyoo-ru) to drive open source to the future.
