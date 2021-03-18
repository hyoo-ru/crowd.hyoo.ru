# CROWD Text

Rich text.

## Properties

May be binded to native `<textarea>`.

## Work in progress

- Currently support only plain text.
- Currently support only full text replacement API (with reconciliation of course). More precise mutations are coming soon.

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

Size = 6 * Size( Text ) + 4 * Count( Flows ) + 2
```

## Delta Format

Delta is partial state dump which depends on the inner stores.

## Views

- `text` Plain text as string

## Mutations

- `text` Replace full text with reconciliation.
- `write( flow, from, to, text )` Coming soon.
