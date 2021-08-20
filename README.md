# CROWDs

Conflict-free Reinterpretable Ordered Washed Data (Secure) - Delta CRDT with additional abilities.

![](https://github.com/hyoo-ru/crowd.hyoo.ru/raw/v2/logo/logo.svg)

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

- Wiped data comptely removes from state.
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
  - **Self** - Node id
  - **Head** - Parent Node id.
  - **Lead** - Leader Node id.
  - **Seat** - Number of position in the siblings list.
  - **Peer** - Global unique identifier of independent actor.
  - **Time** - Monotonic version.
  - **Data** - Any JSON data.
  - **Sign** - Crypto sign of whole Chunk data.
- **Delta** - Difference of two Doc state as list of Chunks.
- **Clock** - Vector clock. Dictionary which maps Peer to Time.
- **Token** - Minimal meaningfull part of text (single word + punctuation + one space).
- **Point** - Place inside Chunk. Usefull for caret.
- **Range** - Range between two Points. Usefull for selection.
- **Offset** - Count of letters from beginning.
- **Channel** - Geter/Setter method. `foo()` - read. `foo(123)` - write. Write returns written.

# Internals

## State/Delta Format

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

Internally Chunks may be stored in RDBMS. Example:

```sql
CREATE TABLE chunks (
	head uint(6),
	self uint(6),
	lead uint(6),
	seat uint(2),
	peer uint(6),
	time uint(4),
	data json,
	sign byte(32),
)
```

## Single Chunk structure

![](https://github.com/hyoo-ru/crowd.hyoo.ru/raw/v2/diagram/chunk.svg)

Primary key for Chunks: `[ Head, Self ]`

## Creation and modifiction of simple Doc

![](https://github.com/hyoo-ru/crowd.hyoo.ru/raw/v2/diagram/reorder.svg)

# Data Types Representation

## Atomic JSON

Single value store. Just CvRDT LWW-Register.

- `value( next?: unknown )` Channel for raw value. Returns `null` by default.
- `bool( next?: boolean )` Channel for `boolean` value. Returns `false` by default.
- `numb( next?: number )` Channel for `number` value. Returns `0` by default.
- `str( next?: string )` Channel for `string` value. Returns `""` by default.

## Mergeable Struct

Struct is completely virtual thing. No one Chunk is stored for it. Only for field values (except it's structs too etc).

- `sub( key: string )` Returns inner Node for field name.

![](https://github.com/hyoo-ru/crowd.hyoo.ru/raw/v2/diagram/struct.svg)

### Lookup agorithm

- Make derived Head by formula:

```javascript
field_head = hash_48bit( field_name, struct_self )
```

So all Peers writes to the same Node when uses the same key.

## Mergeable Ordered List

- `list( next?: unknown[] )` Channel for list of raw values. Uses `insert` to replace content.
- `insert( next?: unknown[], from?, to? )` Replaces range of items with reconciliation. Appends to the end when range isn't defined.

### Properties

- New Chunk is created for every item.
- Left precedence. Seat of item relies on left item, non right.
- No interleaving. Sequence of left-to-right inserted items will stay together after merge.
- Removed item is remain as tombstone for ordering purposes.

### Ordering Algorithm

- Input: Head value.
- Select all Chunks with given Head.
- Sort found Chunks by Seat asc, Time asc, Peer asc.
- Make empty list for result.
- Iterate over all found Chunks.
	- If Lead of current chunk is 0, then use 0 as preferred Seat.
	- If Lead of current chunk is not 0, then locate existen Lead in the result list.
		- If Lead is located, then use next Seat as preferred.
		- if Lead isn't located, then insert Chunk at the end of result list.
	- If preferred Seat less then Seat of Chunk, then insert Chunk at the end of result list.
	- Otherwise insert Chunk at the preferred Seat.

## Mergeable Ordered Dictionary

- `sub( key: string )` Returns inner Node for key.
- `list()` Returns list of keys.

It's both Struct and List:

- As list it contains keys.
- As struct it stores every key by derived Head.

So, every key is Node for value.

## Mergeable Text

- `text( next?: string )` Channel for text representations of List. Uses `write` to replace content.
- `write( next?: string, from?, to? )` Replaces range of text with reconciliation. Writes to the end when range isn't defined.

Under the hood, text is just List of Tokens. So, entering word letter by letter changes same Chunk instead of creating new.

### Properties

- Can be simply bound to native `<textarea>`.
- Merge never produces unreadable token value. Only one of valid (LWW).
- No interleaving. The typed text will not be interrupted after merging.
- For `3.2MB` text (320k words) of "[War and Peace](http://az.lib.ru/t/tolstoj_lew_nikolaewich/text_0073.shtml)" in CROWD Doc takes up  `40MB` (`12x`) in JSON serialization and `25MB` (`8x`) in binary with signing.

### **[Online sandbox](https://crowd.hyoo.ru/)**

[![](https://i.imgur.com/IF9HA2r.png)](https://crowd.hyoo.ru/)

### Write Algorithm

- Input: new text and range of existen text.
- Locate Tokens which relate to the range.
- Before and after new text appen substrings of first and last tokens which should be untouched.
- Split new text using universal tokinizer.
- Reconciliate list of tokens unsing list insertion algorithm.

## Mergeable Document

- `root` Returns root Node with Head = 0.
- `delta( clock )` Returns delta between past clock and now.
- `apply( delta )` Merges delta to current state.
- `toJSON()` Returns full state dump.
- `fork( peer: number )` Makes independent clone with another Peer for testing purposes.

### Delta Algorithm

- Input: Clock, received from Peer.
- Iterate over all Chunk in Doc.
	- Skip Chunks which Time less then Clock Time for same Peer.
- Return all remainig Chunks ordered by Time.

Example with SQL:

```sql
SELECT *
FROM chunks
WHERE
	NOT( peer = 1 AND time <= 123 )
	AND NOT( peer = 2 AND time <= 456 )
	AND NOT( peer = 3 AND time <= 789 )
	...
ORDER BY
	time ASC,
	peer ASC
```

### Apply Algorithm

- Input: list of Chunks.
- Iterate over Chunks from Delta.
	- Locate Chunk from Doc with same Head and Self.
	- If Chunk doesn't exists, add Chunk to Doc.
	- If Chunk exists and Time of new Chunk is greater, replace old by new.
	- If Chunk exists and Time of new Chunk is same, but Peer is greater, replace old by new.
	- Otherwise skip this Chunk.

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

# Sign and Verify

- `$hyoo_crowd_chunk_pack( chunk, private_key )` - Pack Chunk to binary with crypto signing.
- `$hyoo_crowd_chunk_unpack( binary )` - Unpack Chunk from binary.
- `$hyoo_crowd_chunk_verify( binary, public_key )` - Verify crypto sign of packed Chunk.

# Usage Example

```typescript
// // Usage from NPM. Isn't required in MAM.
// import {
//   $hyoo_crowd_doc,
// } from 'hyoo_crowd_lib'

// Create document
const base = new $hyoo_crowd_doc();

// Make independent forks for testng
const alice = base.fork(1);
const bob = base.fork(2);
const carol = base.fork(3);

// Twice change register named "foo"
alice.root.sub("foo").str("A1");
alice.root.sub("foo").str("A2");

// Change register named "foo" then converts it to sequence and insert value
bob.root.sub("foo").str("B1");
bob.root.sub("foo").insert(["B2", "B3"]);

// Write some text at the end of sequence named "foo"
carol.root.sub("foo").write("C1 C2");

// Make deltas
const alice_delta = alice.delta(base.clock);
const bob_delta = bob.delta(base.clock);
const carol_delta = carol.delta(base.clock);

// Cross merge all of them
alice.apply(bob_delta).apply(carol_delta);
bob.apply(alice_delta).apply(carol_delta);
carol.apply(bob_delta).apply(alice_delta);

// ["A2","C1 ","C2","B1","B2","B3"]
console.log(
  alice.root.sub("foo").list(),
  bob.root.sub("foo").list(),
  carol.root.sub("foo").list()
);
```

[Sandbox](https://codepen.io/nin-jin/pen/JjbqRYX?editors=0000011)

# Comparison of Libraries

|                        | [$hyoo_crowd](https://github.com/hyoo-ru/crowd.hyoo.ru) | [Automerge](https://github.com/automerge/automerge) | [YJS](https://github.com/yjs/yjs)   | [delta-crdt](https://github.com/peer-base/js-delta-crdts)
|------------------------|------------|-----------|-------|-----------
| Approach               | dCvRDT     | CRDT      | CRDT  | dCRDT
| Garbage Collection     | Doesn't required      | Stores full history      | Enabled by default  | ❓
| Gzipped Bundle Size    | [**6 KB**](https://bundlephobia.com/result?p=hyoo_crowd_lib)       | [60 KB](https://bundlephobia.com/result?p=automerge)     | [23 KB](https://bundlephobia.com/result?p=yjs) | [43 KB](https://bundlephobia.com/result?p=delta-crdts)
| Sequence: 500 Push + 500 Shift Perf | **17 ms** | 280 ms | 36 ms
| Sequence: 500 Push + 500 Shift Mem | 80 KB | 2_100 KB | **12 KB**
| Text: 500 Append + 500 Crop Perf   | **22 ms** | 370 ms | 31 ms
| Text: 500 Append + 500 Crop Mem   | 80 KB | 3_300 KB | **13 KB**

## Benchmarks

### [Sequence: Push + Shift](https://perf.js.hyoo.ru/#!prefixes=%5B%22const%20%7B%20%24hyoo_crowd_doc%20%7D%20%3D%20%24mol_import.module%28%5Cn%5Ct'https%3A%2F%2Funpkg.com%2Fhyoo_crowd_lib%2Fweb.esm.js'%5Cn%29.default%22%2C%22%24mol_import.script%28%5Cn%5Ct'https%3A%2F%2Funpkg.com%2Fautomerge%400%2Fdist%2Fautomerge.js'%5Cn%29%22%2C%22const%20%7B%20Doc%20%7D%20%3D%20%24mol_import.module%28%5Cn%5Ct'https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fyjs%2F%2Besm'%5Cn%29%22%5D/sources=%5B%22let%20doc%7B%23%7D%20%3D%20new%20%24hyoo_crowd_doc%28%29%5Cnlet%20list%7B%23%7D%20%3D%20doc%7B%23%7D.root.sub%28%20'list'%20%29%5Cnfor%28%20let%20i%20%3D%200%3B%20i%20%3C%20total%3B%20%2B%2Bi%20%29%5Cn%5Ctlist%7B%23%7D.insert%28%5B%20i%20%5D%29%5Cnfor%28%20let%20i%20%3D%200%3B%20i%20%3C%20total%3B%20%2B%2Bi%20%29%5Cn%5Ctlist%7B%23%7D.cut%28%200%20%29%5Cn%22%2C%22let%20doc%7B%23%7D%20%3D%20Automerge.from%28%7B%20list%3A%20%5B%5D%20%7D%29%5Cnfor%28%20let%20i%20%3D%200%3B%20i%20%3C%20total%3B%20%2B%2Bi%20%29%5Cn%5Ctdoc%7B%23%7D%20%3D%20Automerge.change%28%20doc%7B%23%7D%2C%20'op'%2C%5Cn%5Ct%5Ctdoc%20%3D%3E%20doc.list.push%28%20i%20%29%5Cn%5Ct%29%5Cnfor%28%20let%20i%20%3D%200%3B%20i%20%3C%20total%3B%20%2B%2Bi%20%29%5Cn%5Ctdoc%7B%23%7D%20%3D%20Automerge.change%28%20doc%7B%23%7D%2C%20'op'%2C%5Cn%5Ct%5Ctdoc%20%3D%3E%20doc.list.shift%28%29%5Cn%5Ct%29%22%2C%22const%20doc%7B%23%7D%20%3D%20new%20Doc%5Cnconst%20list%7B%23%7D%20%3D%20doc%7B%23%7D.getArray%28%20'list'%20%29%5Cnfor%28%20let%20i%20%3D%200%3B%20i%20%3C%20total%3B%20%2B%2Bi%20%29%5Cn%5Ctlist%7B%23%7D.push%28%5B%20i%20%5D%29%5Cnfor%28%20let%20i%20%3D%200%3B%20i%20%3C%20total%3B%20%2B%2Bi%20%29%5Cn%5Ctlist%7B%23%7D.delete%280%2C1%29%22%5D/prefix=const%20total%20%3D%20500)

### Chrome 92
![](https://i.imgur.com/ZpwnDS0.png)

### FireFox 91
![](https://i.imgur.com/ARB3cRJ.png)

### [Text: Append + Crop](https://perf.js.hyoo.ru/#!prefixes=%5B%22const%20%7B%20%24hyoo_crowd_doc%20%7D%20%3D%20%24mol_import.module%28%5Cn%5Ct'https%3A%2F%2Funpkg.com%2Fhyoo_crowd_lib%2Fweb.esm.js'%5Cn%29.default%22%2C%22%24mol_import.script%28%5Cn%5Ct'https%3A%2F%2Funpkg.com%2Fautomerge%400%2Fdist%2Fautomerge.js'%5Cn%29%22%2C%22const%20%7B%20Doc%2C%20Text%20%7D%20%3D%20%24mol_import.module%28%5Cn%5Ct'https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fyjs%2F%2Besm'%5Cn%29%22%5D/sources=%5B%22let%20doc%7B%23%7D%20%3D%20new%20%24hyoo_crowd_doc%28%29%5Cnlet%20text%7B%23%7D%20%3D%20doc%7B%23%7D.root.sub%28%20'text'%20%29%5Cnfor%28%20let%20i%20%3D%200%3B%20i%20%3C%20total%3B%20%2B%2Bi%20%29%20%7B%5Cn%5Cttext%7B%23%7D.write%28%20i%20%2B%20'%20'%20%29%5Cn%7D%5Cnfor%28%20let%20i%20%3D%20total-1%3B%20i%20%3E%3D%200%3B%20--i%20%29%20%7B%5Cn%5Cttext%7B%23%7D.write%28%20''%2C%200%2C%20String%28i%29.length%20%2B%201%20%29%5Cn%7D%22%2C%22let%20doc%7B%23%7D%20%3D%20Automerge.from%28%7B%7D%29%5Cndoc%7B%23%7D%20%3D%20Automerge.change%28doc%7B%23%7D%2C%20doc%20%3D%3E%20%7B%5Cn%5Ctdoc.text%20%3D%20new%20Automerge.Text%28%29%5Cn%7D%29%5Cnfor%28%20let%20i%20%3D%200%3B%20i%20%3C%20total%3B%20%2B%2Bi%20%29%5Cn%5Ctdoc%7B%23%7D%20%3D%20Automerge.change%28%20doc%7B%23%7D%2C%20'op'%2C%5Cn%5Ct%5Ctdoc%20%3D%3E%20doc.text.insertAt%28%5Cn%5Ct%5Ct%5Ctdoc.text.length%2C%5Cn%5Ct%5Ct%5Ct...%20%28%20i%20%2B%20'%20'%20%29%2C%5Cn%5Ct%5Ct%29%5Cn%5Ct%29%5Cnfor%28%20let%20i%20%3D%200%3B%20i%20%3C%20total%3B%20%2B%2Bi%20%29%5Cn%5Ctdoc%7B%23%7D%20%3D%20Automerge.change%28%20doc%7B%23%7D%2C%20'op'%2C%20doc%20%3D%3E%20%7B%5Cn%5Ct%5Ctconst%20len%20%3D%20String%28i%29.length%20%2B%201%5Cn%5Ct%5Ctfor%28%20let%20j%20%3D%200%3B%20j%20%3C%20len%3B%20%2B%2Bj%20%29%5Cn%5Ct%5Ct%5Ctdoc.text.deleteAt%280%29%5Cn%5Ct%7D%20%29%22%2C%22const%20doc%7B%23%7D%20%3D%20new%20Doc%5Cnconst%20text%7B%23%7D%20%3D%20doc%7B%23%7D.get%28%20'text'%2C%20Text%20%29%5Cnfor%28%20let%20i%20%3D%200%3B%20i%20%3C%20total%3B%20%2B%2Bi%20%29%5Cn%5Cttext%7B%23%7D.insert%28%20text%7B%23%7D.length%2C%20i%20%2B%20'%20'%20%29%5Cnfor%28%20let%20i%20%3D%200%3B%20i%20%3C%20total%3B%20%2B%2Bi%20%29%5Cn%5Cttext%7B%23%7D.delete%28%200%2C%20String%28i%29.length%20%2B%201%20%29%22%5D/prefix=const%20total%20%3D%20500)

### Chrome 89

![](https://i.imgur.com/Hzvrm0h.png)

### FireFox 91

![](https://i.imgur.com/kmig8gm.png)

### [crdt-benchmarks](https://github.com/dmonad/crdt-benchmarks)

# Community

- Leave us a feedback in [duscussions section](https://github.com/hyoo-ru/crowd.hyoo.ru/discussions).
- Support [Hyoo Guild](https://github.com/hyoo-ru) to drive open source to the future.
