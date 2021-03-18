# CROWD Text

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
