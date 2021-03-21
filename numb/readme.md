# CROWD Counter

Number that can be shifted by any value. Equivalent of dCRDT PN-Counter with same properties.


## Properties

- Merges without lost of changes.
- Allows increase/decrease by any number.
- Allows negative and float values.

## State format

```javascript
{
	"values": [ +5, +4, -1 ],
	"stamps": [ +1000001, +3000002, -3000003 ],
}
// Alice increases by 5.
// Bob increases by 3 then increases by 1.
// Carol decreases by 2 then increases by 1.

.value === 8

Size = 16 * PeersInState
```

Stamp is always non negative.

## Delta format

Delta is partial state dump like:

```javascript
{
	"values": [ +4, -1 ],
	"stamps": [ +3000002, -3000003 ],
}
// Bob increases by 3 then increases by 1.
// Carol decreases by 2 then increases by 1.

Size = 16 * PeersInDelta
```

## Views

- `value` Current value or `0` by default.

## Mutations

- `shift( diff )`
