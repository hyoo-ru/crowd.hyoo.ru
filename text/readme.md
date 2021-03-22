# CROWD Text

Rich text.

## Properties

- Can be binded to native `<textarea>`.
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

Size ~= 10 * Size( Text ) + 4 * Count( Flows ) + 2
```

## Delta Format

Delta is partial state dump which depends on the inner stores.

## Views

- `text` Plain text as string

## Mutations

- `text` Replace full text with reconciliation.
- `write( text, offset_from = length, delete_count = 0 )` Replace range by new text.

## [Online sandbox](https://crowd.hyoo.ru/)

[![](https://i.imgur.com/4RJEWsB.png)](https://crowd.hyoo.ru/)

- Currently bound to native textarea. It's simple, but slow on large texts. 
