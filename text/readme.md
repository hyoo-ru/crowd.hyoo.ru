# CROWD Text

Rich text.

## Properties

- Can be simply bound to native `<textarea>`.
- Uses tokenizer to split text by tokens.
- Retokenization of changed tokens is executed on write.
- Token's value and tokens order are stored separately and can be changed independently.
- Merge never produces unreadable token value. Only one of valid (LWW).

## Work in progress

- Currently support only plain text.
- Currently used full text tokenization. Split by lines should improve performance, reduce delta size and reduce changes overlapping.
- Tokenization by language specific tokenizer (english, markdown, typescript etc) can produce better results. Need investigation. We can achieve conflict-free source code merge here by integration with IDE.

## State Format

```javascript
{
	"values": [
		"flow",
			null, id1, id2, ... , // root flow
			flow1, id3, id4, ... ,
			flow2, id5, id6, ... ,
			...
		"token",
			id1, val1,
			id2, val2,
			...
	],
	"stamps": [ ... ],
}

Size ~= 8 * Size( Text ) + 8 * Count( Flows ) + 2 * Sum( Length( Flows ) ) + 8 * Count( Tombstones ) + 2
```

## Delta Format

Delta is partial state dump which depends on the inner stores.

## Views

- `text` Plain text as string

## Mutations

- `text` Replace full text with reconciliation.
- `write( text, offset_from = length, delete_count = 0 )` Replace range by new text.

## Memory usage

For `3.2MB` text (320k words) of "[War and Peace](http://az.lib.ru/t/tolstoj_lew_nikolaewich/text_0073.shtml)" CROWD Text uses `40MB` (`~13x`) of memory and `16MB` (`5x`) in JSON serialization.

For contrast, [Yjs](https://github.com/yjs/yjs)'s (very optimized CRDT) uses from `1x` (full-text copy-paste) to `112x` (right-to-left letter-by-letter) of memory and `1x` in binary serialization. [Source](https://blog.kevinjahns.de/are-crdts-suitable-for-shared-editing/).

## [Online sandbox](https://crowd.hyoo.ru/)

[![](https://i.imgur.com/4RJEWsB.png)](https://crowd.hyoo.ru/)

- Currently bound to native textarea. It's simple, but slow on large texts. 
