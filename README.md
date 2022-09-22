# CROWDs

Conflict-free Reinterpretable Ordered Washed Data (Secure) - Delta based CRDT with additional abilities.

![](https://github.com/hyoo-ru/crowd.hyoo.ru/raw/master/logo/logo.svg)

# Key Properties

## Conflict-free

- Any states can be merged without conflicts.
- Convergence (Strong Eventual Consistency).
- Merge result is **independent of merge order** (except auth units).
- Merge is semilattice.

## Reinterpretable

- Same state can be reinterpreted as any Type (weak typing).
- Type of data can be changed dynamicaly without data migration.
- **Cross-merge** between different types is available.

## Ordered

- Every data have a stable place in the document.
- Wiped data inside some Head stays tombstone to hold place.
- **Interleaving-free**.

## Washed

- Wiped data comptely removed from state.
- Past state can't be reproduced. Snapshots/layers/changelog should be used for that.
- Garbage collection isn't required.
- But metadata size (binary, with signs) ~28x of user data size (~14x without signs).

## Data

- All **deltas are idempotent**.
- Every token is just one unit.
- Delta is simply slice of full state (array of units).
- Deltas can be merged together to reduce transmit size.

## Secure

- Every unit is crypto signed separately.
- Every peer **checks signs and rights** and rejects incorrect units.
- Every unit can be encrypted (not yet).
- Conflict-free **merge without decrypt**.
- Merging doesn't invalidate signs.
- Security features can be ommited if decentralization isn't required.

# Real World Usages

- [$hyoo_page](https://page.hyoo.ru) - decentralized real-time wiki.
- [$hyoo_talks](https://talks.hyoo.ru) - decentralized secure messanger.
- [$hyoo_draw](https://talks.hyoo.ru) - infinity collaborative whiteboard.
- [$hyoo_sketch](https://sketch.hyoo.ru) - fast UI mockups.
- [BenZen](https://github.com/hyoo-ru/benzen) - Conflict-Free Version Control System

# Articles

- [Consistent about Consensus](https://github.com/nin-jin/slides/tree/master/consensus).
- The Whole Point of Conflict-Free Data Tyes (Coming soon).
- CROWD - Secure Universal CRDT (Coming soon).

# Vocabulary

- **World** - Whole state as graph of Lands.
- **Node** - A single subtree which represented by few Units with same Self in different Heads.
- **Unit** - Minimal atomic unit of data with metadata. Actually it's edge between Nodes. And it's extended CvRDT LWW-Register.
  - **Land** - Document direct graph which consists of (real) Units and (virtual) Nodes over them and syncs entirely.
  - **Self** - Node id
  - **Head** - Parent Node id.
  - **Prev** - Previous Node id in the siblings list.
  - **Next** - Next Node id in the siblings list.
  - **Auth** - Global unique identifier of independent actor.
  - **Time** - Monotonic time as count of 100ms intervals from Aeon start.
  - **Aeon** - number of 7-year epochs from ~2022-08-04 (not yet).
  - **Data** - Any JSON or Binary data. Size is limited by 32KB.
  - **Sign** - Crypto sign of whole Unit data.
  - **kind** - Type of unit (👑 `grab`, 🏅 `give`, 🔑 `join`, 📦 `data`) with different acceptance criterias.
  - **group** - Priority of synchronization (`auth`, `data`).
- **Level** - Access level (`law`, `mod`, `add`, `get`).
- **Peer** - Any actor who have private key to make and sign Units.
  - **Lord** - Any Peer who have `law` level for Land.
  - **King** - Peer with same id as Land. He has `law` level in that Land by default.
  - **Knight** - Temporary King to grab Land and grant level for current Peer and/or for all Peers.
- **Home** - Land where Peer is King (with same id).
- **Delta** - Difference of two Land states as list of Units.
- **Clock** - Vector clock. Dictionary which maps Peer to Time.
- **Token** - Minimal meaningfull part of text (space + single word / spaces / punctuation etc).
- **Point** - Place inside Unit. Usefull for caret position.
- **Range** - Range between two Points. Usefull for selection.
- **Offset** - Count of letters from beginning.
- **Seat** - Position in the list.
- **Channel** - Geter/Setter method. `foo()` - read. `foo(123)` - write and return written.

# Internals

## State/Delta Format

```typescript
type Unit = Readonly<{
    land: int62
    auth: int62
    head: int62
    self: int62
    next: int62
    prev: int62
    time: int31
    data: json | bin
    sign: bin64
}>

type State = Unit[]
type Delta = readonly Unit[]
```

Internally Units may be stored in RDBMS. Example:

```sql
CREATE TABLE units (
	land int(8),
	auth int(8),
	head int(8),
	self int(8),
	next int(8),
	prev int(8),
	time int(4),
	data json,
	sign byte(64),
)
```

## Single Unit structure

![](https://github.com/hyoo-ru/crowd.hyoo.ru/raw/master/diagram/unit.svg)

Primary key for Units: `[ Land, Head, Self ]`

# Sync Flow

![](https://github.com/hyoo-ru/crowd.hyoo.ru/raw/master/diagram/sync.svg)

## Delta

Delta is array of 8-byte aligned binary serialized Units of same Land ordered by Aeon+Time.

![](https://github.com/hyoo-ru/crowd.hyoo.ru/raw/master/diagram/delta.svg)

## Unit

Unit contains data, it global position, time of creation, authorship and sign of all of this.

![](https://github.com/hyoo-ru/crowd.hyoo.ru/raw/master/diagram/unit-bin.svg)

## Clocks

Contains last seen Times for each Peer+Group of already known Units.

![](https://github.com/hyoo-ru/crowd.hyoo.ru/raw/master/diagram/clocks-bin.svg)

# Data Types Representation

## Atomic CROWD Register

Single value store. Just CvRDT LWW-Register. Value is any JSON or Binary data with size <= 32KB.

![](https://github.com/hyoo-ru/crowd.hyoo.ru/raw/master/diagram/register.svg)

### $hyoo_crowd_reg

- `value( next?: unknown )` Channel for raw value. Returns `null` by default.
- `bool( next?: boolean )` Channel for `boolean` value. Returns `false` by default.
- `numb( next?: number )` Channel for `number` value. Returns `NaN` by default.
- `str( next?: string )` Channel for `string` value. Returns `""` by default.

## CROWD Struct

Struct is completely virtual thing. No one Unit is stored for it. Only for field values (except it's structs too, etc).

![](https://github.com/hyoo-ru/crowd.hyoo.ru/raw/master/diagram/struct.svg)

### Lookup agorithm

- Make derived Head by formula:

```javascript
field_head = hash_62bit( field_name, struct_self )
```

So each Peer writes to the same Node when uses the same key.

### $hyoo_crowd_struct

- `sub( key: string )` Returns inner Node for field name.
- `yoke( key: string, Node, king_level, base_level )` Makes or reuse Land which Self is stored inside register.

## CROWD Ordered List

![](https://github.com/hyoo-ru/crowd.hyoo.ru/raw/master/diagram/reorder.svg)

### Properties

- New Unit is created for every item.
- Left precedence. Position of item relies on left item, then right.
- No interleaving. Sequence of left-to-right inserted items will stay together after merge.
- Removed item is remain as tombstone for ordering purposes.

### Ordering Algorithm

- Input: Head value.
- Select all Units with given Head.
- Make queue as sorted found Units by Time asc, Peer asc.
- Make empty list for result.
- Iterate over all queue while it isn't empty.
	- If Prev == 0, then place it at the begin.
	- If Prev != 0, then locate existen Prev in the result list.
		- If Prev is located, place after that.
		- if Prev isn't located, then check Next:
			- If Next == 0, then place it at the end.
			- If Next != 0, then locate existen Prev in the result list.
				- If Next is located, place before that.
				- if Next isn't located, then skip unit and proceed followed.
	- If unit is placed remove it from queue and start from begin of queue.

### $hyoo_crowd_list

- `list( next?: unknown[] )` Channel for list of raw values. Uses `insert` to replace content.
- `set( next?: unknown[] )` Channel for list of unique raw values.
- `insert( next?: unknown[], from?: number, to?: number )` Replaces range of items with reconciliation. Appends to the end when range isn't defined.
- `move( from?: number, to?: number )` Moves item to another seat.
- `cut( seat: number )` Removes item by seat.
- `has( val: unknown )` Checks for value existence.
- `add( val: unknown )` Adds value if doesn't exist.
- `drop( val: unknown )` Removes value if exists.

## CROWD Ordered Dictionary

It's both Struct and List:

- As list it contains keys.
- As struct it stores every key in Unit with derived Self. So, every key is Node for value.

![](https://github.com/hyoo-ru/crowd.hyoo.ru/raw/master/diagram/dict.svg)

### $hyoo_crowd_dict

- `keys()` Channel for list of keys.
- `sub( key: string, Node )` Returns inner Node for key.
- `has( val: unknown )` Checks for value existence.
- `add( val: unknown )` Adds value if doesn't exist.
- `drop( val: unknown )` Removes value if exists.

## CROWD JSON

It's recursive version of Dictionary. Special values which marks inner structures:

- `{}` - inner JSON.
- `[]` - inner List.

### $hyoo_crowd_json

- `json( json )` Channel for JSON.

## CROWD Plain Text

Under the hood, String is just List of Tokens. So, entering word letter by letter changes same Unit instead of creating new. Text is the List of Strings which represents multiline text.

### Properties

- Can be simply bound to native `<textarea>` with real-time synchronization.
- Merge never produces unreadable token value. Only one of valid (LWW).
- No interleaving. The typed text will not be interrupted after merging.
- Weight of unsecure CROWD representation of text 3x..9x of raw text snapshot (and 11x..27x for secure).

### **[Online sandbox](https://crowd.hyoo.ru/)**

![](https://i.imgur.com/VpR3OB1.png)

### Write Algorithm

- Input: new text and range of existen text.
- Locate Tokens which relate to the range.
- Before and after new text append substrings of first and last tokens which should be untouched.
- Split new text using tokenizer.
- Reconciliate list of tokens unsing the List insertion algorithm.

### $hyoo_crowd_text

- `str( next?: string )` Channel for String representation. Uses `write` to replace content.
- `text( next?: string )` Channel for Text representation. 
- `selection( peer, next?: [ number, number ] )` Channel for selection Offsets of given Peer inside this Text. Stored inside Peer Home Land with anchoring to most inner token.
- `write( next?: string, from?, to? )` Replaces range of String with reconciliation. Writes to the end when range isn't defined.

## CROWD Rich Text

Under the hood, tokens are stored in the same form as in plain text. There may be elements between them in form `["div"]`, which can contain the same content. Every token is represented as SPAN. Every DOM element has `id` equal to Self. This `id` is using to reuse existing Units and track Nodes moving.

### $hyoo_crowd_dom

- `dom( next?: Element | DocumentFragment )` Channel for DOM representation of subtree.
- `html( next?: string )` Channel for XHTML serialization of DOM.

## CROWD Document

### Delta Algorithm

- Input: Clocks, received from Peer.
- Iterate over all Unit in Land.
	- Skip Units which Time less then Clock Time for same Peer.
- Return all remainig Units ordered by Time.

Example with SQL:

```sql
SELECT *
FROM Unit
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

- Input: list of Units.
- Iterate over Units from Delta.
	- Locate Unit from Land with same Head and Self.
	- If Unit doesn't exists, add Unit to Land.
	- If Unit exists and Time of new Unit is greater, replace old by new.
	- If Unit exists and Time of new Unit is same, but Peer is greater, replace old by new.
	- Otherwise skip this Unit.

### $hyoo_crowd_land

- `chief` Returns chief Node with Head = 0.
- `delta( clocks? )` Returns delta between past clock and now.
- `apply( delta )` Merges delta to current state.
- `fork( peer )` Makes independent clone with another Peer for testing purposes.

# Reinterpretations

*need update*

- ✅ Expected behaviour.
- ⭕ Unexpected but acceptable behaviour.
- ❌ Unacceptable behaviour in most cases.

| What\As    | Atom                  | Struct                          | List                 | Dictionary               | Text                                | DOM
|------------|-----------------------|---------------------------------|----------------------|--------------------------|-------------------------------------|----
| Atom       | ✅ Same              | ⭕ Nullish fields               | ✅ As single item    | ✅ As key               | ✅ String as tokens, other ignored  | ✅ String as tokens, other ignored
| Struct     | ⭕ first field value | ✅ Same                         | ⭕ Field values      | ❌ Field values as keys | ⭕ Empty                            | ⭕ Empty
| List       | ⭕ fist item         | ⭕ Nullish fields               | ✅ Same              | ✅ Items as keys        | ⭕ Strings as tokens, other ignored | ⭕ Items as spans 
| Dictionary | ⭕ first key         | ✅ keys values as fields values | ✅ Keys              | ✅ Same                 | ✅ Keys as tokens                   | ✅ Keys as tokens
| JSON       |                      |                                  |                      |                          |                                     | 
| String     |                      |                                  |                      |                          |                                     | 
| Text       | ❌ first token       | ⭕ Nullish fields               | ✅ Tokens            | ❌ Tokens as keys       | ✅ Same                             | ✅ Tokens as spans 
| DOM        | ❌ first token       | ⭕ Nullish fields               | ✅ Top level items   | ❌ Tokens as keys       | ⭕ Text from top level tokens       | ✅ Same

# Usage Example

```typescript
// // Usage from NPM. Isn't required in MAM.
// import {
//   $hyoo_crowd_land,
//   $hyoo_crowd_reg,
//   $hyoo_crowd_list,
//   $hyoo_crowd_text,
// } from 'hyoo_crowd_lib'

// Create document
const base = new $hyoo_crowd_land;

// Make independent forks for testng
const alice = base.fork({ id: '1_1' });
const bob = base.fork({ id: '2_2' });
const carol = base.fork({ id: '3_3' });

// Twice change register named "foo"
alice.chief.sub("foo", $hyoo_crowd_reg).str("A1");
alice.chief.sub("foo", $hyoo_crowd_reg).str("A2");

// Change register named "foo"
// Then converts it to sequence and insert some values
bob.chief.sub("foo", $hyoo_crowd_reg).str("B1");
bob.chief.sub("foo", $hyoo_crowd_list).insert(["B2", "B3"]);

// Replace text named "foo"
carol.chief.sub("foo", $hyoo_crowd_text).str("C1 C2");

// Make deltas
const alice_delta = alice.delta(base.clock);
const bob_delta = bob.delta(base.clock);
const carol_delta = carol.delta(base.clock);

// Cross merge all of them
alice.apply(bob_delta).apply(carol_delta);
bob.apply(alice_delta).apply(carol_delta);
carol.apply(bob_delta).apply(alice_delta);

console.log(
  ["A2", "C1", " C2", "B1", "B2", "B3"],
  alice.chief.sub("foo", $hyoo_crowd_list).list(),
  bob.chief.sub("foo", $hyoo_crowd_list).list(),
  carol.chief.sub("foo", $hyoo_crowd_list).list()
);
```

[Sandbox](https://codepen.io/nin-jin/pen/mdLeLRw?editors=0012)

# Comparison of CRDT Libraries

|                        | [$hyoo_crowd](https://github.com/hyoo-ru/crowd.hyoo.ru) | [Automerge](https://github.com/automerge/automerge) | [YJS](https://github.com/yjs/yjs)   | [delta-crdt](https://github.com/peer-base/js-delta-crdts)
|------------------------|-------------|-----------|-------|-----------
| Approach               | delta-state | op-log    | delta-state  | delta-state
| Garbage Collection     | Doesn't required | Stores full history | Enabled by default  | ❓
| Changes signing        | ✅ Support | ❌       | ❌  | ❓
| Merge without decrypt  | ✅ Support | ❌       | ❌  | ❓
| Gzipped Bundle Size    | [**15 KB**](https://bundlephobia.com/result?p=hyoo_crowd_lib)       | [46 KB](https://bundlephobia.com/result?p=automerge)     | [24 KB](https://bundlephobia.com/result?p=yjs) | [43 KB](https://bundlephobia.com/result?p=delta-crdts)
| Sequence: 500 Push + 500 Shift Perf | **17 ms** | 420 ms | 21 ms
| Sequence: 500 Push + 500 Shift Mem | 84 KB | 986 KB | **3.84 KB**
| Text: 500 Append + 500 Crop Perf   | 21 ms | 480 ms | **18 ms**
| Text: 500 Append + 500 Crop Mem   | 86 KB | 1_080 KB | **5 KB**

## Benchmarks

### [Sequence: Push + Shift](https://perf.js.hyoo.ru/#!prefixes=%5B%22const%20%7B%20%24hyoo_crowd_land%20%7D%20%3D%20%24mol_import.module%28%5Cn%5Ct'https%3A%2F%2Funpkg.com%2Fhyoo_crowd_lib%2Fweb.esm.js'%5Cn%29.default%22%2C%22%24mol_import.script%28%5Cn%5Ct'https%3A%2F%2Funpkg.com%2Fautomerge%2Fdist%2Fautomerge.js'%5Cn%29%22%2C%22const%20%7B%20Doc%20%7D%20%3D%20%24mol_import.module%28%5Cn%5Ct'https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fyjs%2F%2Besm'%5Cn%29%22%5D/sources=%5B%22let%20doc%7B%23%7D%20%3D%20new%20%24hyoo_crowd_land%28%29%5Cnlet%20list%7B%23%7D%20%3D%20doc%7B%23%7D.chief.sub%28%20'list'%2C%20%24hyoo_crowd_list%20%29%5Cnfor%28%20let%20i%20%3D%200%3B%20i%20%3C%20total%3B%20%2B%2Bi%20%29%5Cn%5Ctlist%7B%23%7D.insert%28%5B%20i%20%5D%29%5Cnfor%28%20let%20i%20%3D%200%3B%20i%20%3C%20total%3B%20%2B%2Bi%20%29%5Cn%5Ctlist%7B%23%7D.cut%28%200%20%29%5Cn%22%2C%22let%20doc%7B%23%7D%20%3D%20Automerge.from%28%7B%20list%3A%20%5B%5D%20%7D%29%5Cnfor%28%20let%20i%20%3D%200%3B%20i%20%3C%20total%3B%20%2B%2Bi%20%29%5Cn%5Ctdoc%7B%23%7D%20%3D%20Automerge.change%28%20doc%7B%23%7D%2C%20'op'%2C%5Cn%5Ct%5Ctdoc%20%3D%3E%20doc.list.push%28%20i%20%29%5Cn%5Ct%29%5Cnfor%28%20let%20i%20%3D%200%3B%20i%20%3C%20total%3B%20%2B%2Bi%20%29%5Cn%5Ctdoc%7B%23%7D%20%3D%20Automerge.change%28%20doc%7B%23%7D%2C%20'op'%2C%5Cn%5Ct%5Ctdoc%20%3D%3E%20doc.list.shift%28%29%5Cn%5Ct%29%22%2C%22const%20doc%7B%23%7D%20%3D%20new%20Doc%5Cnconst%20list%7B%23%7D%20%3D%20doc%7B%23%7D.getArray%28%20'list'%20%29%5Cnfor%28%20let%20i%20%3D%200%3B%20i%20%3C%20total%3B%20%2B%2Bi%20%29%5Cn%5Ctlist%7B%23%7D.push%28%5B%20i%20%5D%29%5Cnfor%28%20let%20i%20%3D%200%3B%20i%20%3C%20total%3B%20%2B%2Bi%20%29%5Cn%5Ctlist%7B%23%7D.delete%280%2C1%29%22%5D/prefix=const%20total%20%3D%20500)

### Chrome 104
![](https://i.imgur.com/xgPpqi4.png)

### FireFox 104
![](https://i.imgur.com/c9Q3eRB.png)

### [Text: Append + Crop](https://perf.js.hyoo.ru/#!prefixes=%5B%22const%20%7B%20%24hyoo_crowd_land%20%7D%20%3D%20%24mol_import.module%28%5Cn%5Ct'https%3A%2F%2Funpkg.com%2Fhyoo_crowd_lib%2Fweb.esm.js'%5Cn%29.default%22%2C%22%24mol_import.script%28%5Cn%5Ct'https%3A%2F%2Funpkg.com%2Fautomerge%2Fdist%2Fautomerge.js'%5Cn%29%22%2C%22const%20%7B%20Doc%2C%20Text%20%7D%20%3D%20%24mol_import.module%28%5Cn%5Ct'https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fyjs%2F%2Besm'%5Cn%29%22%5D/sources=%5B%22let%20doc%7B%23%7D%20%3D%20new%20%24hyoo_crowd_land%28%29%5Cnlet%20text%7B%23%7D%20%3D%20doc%7B%23%7D.chief.sub%28%20'text'%2C%20%24hyoo_crowd_text%20%29%5Cnfor%28%20let%20i%20%3D%200%3B%20i%20%3C%20total%3B%20%2B%2Bi%20%29%20%7B%5Cn%5Cttext%7B%23%7D.write%28%20'%20'%20%2B%20i%20%29%5Cn%7D%5Cnfor%28%20let%20i%20%3D%20total-1%3B%20i%20%3E%3D%200%3B%20--i%20%29%20%7B%5Cn%5Cttext%7B%23%7D.write%28%20''%2C%200%2C%20String%28i%29.length%20%2B%201%20%29%5Cn%7D%22%2C%22let%20doc%7B%23%7D%20%3D%20Automerge.from%28%7B%7D%29%5Cndoc%7B%23%7D%20%3D%20Automerge.change%28doc%7B%23%7D%2C%20doc%20%3D%3E%20%7B%5Cn%5Ctdoc.text%20%3D%20new%20Automerge.Text%28%29%5Cn%7D%29%5Cnfor%28%20let%20i%20%3D%200%3B%20i%20%3C%20total%3B%20%2B%2Bi%20%29%5Cn%5Ctdoc%7B%23%7D%20%3D%20Automerge.change%28%20doc%7B%23%7D%2C%20'op'%2C%5Cn%5Ct%5Ctdoc%20%3D%3E%20doc.text.insertAt%28%5Cn%5Ct%5Ct%5Ctdoc.text.length%2C%5Cn%5Ct%5Ct%5Ct...%20%28%20'%20'%20%2B%20i%20%29%2C%5Cn%5Ct%5Ct%29%5Cn%5Ct%29%5Cnfor%28%20let%20i%20%3D%200%3B%20i%20%3C%20total%3B%20%2B%2Bi%20%29%5Cn%5Ctdoc%7B%23%7D%20%3D%20Automerge.change%28%20doc%7B%23%7D%2C%20'op'%2C%20doc%20%3D%3E%20%7B%5Cn%5Ct%5Ct%2F***%2F%20const%20len%20%3D%20String%28i%29.length%20%2B%201%5Cn%5Ct%5Ctfor%28%20let%20j%20%3D%200%3B%20j%20%3C%20len%3B%20%2B%2Bj%20%29%5Cn%5Ct%5Ct%5Ctdoc.text.deleteAt%280%29%5Cn%5Ct%7D%20%29%22%2C%22const%20doc%7B%23%7D%20%3D%20new%20Doc%5Cnconst%20text%7B%23%7D%20%3D%20doc%7B%23%7D.get%28%20'text'%2C%20Text%20%29%5Cnfor%28%20let%20i%20%3D%200%3B%20i%20%3C%20total%3B%20%2B%2Bi%20%29%5Cn%5Cttext%7B%23%7D.insert%28%20text%7B%23%7D.length%2C%20'%20'%20%2B%20i%20%29%5Cnfor%28%20let%20i%20%3D%200%3B%20i%20%3C%20total%3B%20%2B%2Bi%20%29%5Cn%5Cttext%7B%23%7D.delete%28%200%2C%20String%28i%29.length%20%2B%201%20%29%22%5D/prefix=const%20total%20%3D%20500)

### Chrome 104

![](https://i.imgur.com/0X9W1MR.png)

### FireFox 104

![](https://i.imgur.com/d75gvHo.png)

### [crdt-benchmarks](https://github.com/dmonad/crdt-benchmarks)

# Support the Project

- Leave us a feedback in [duscussions section](https://github.com/hyoo-ru/crowd.hyoo.ru/discussions).
- [Fund $hyoo_guild](https://boosty.to/hyoo) to drive open source to the future.
