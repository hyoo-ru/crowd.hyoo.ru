# CROWD Clock

Manages stamps for composed CROWD stores. Remembers last seen stamp for every seen peer. And generates new stamp for current peer that greater then all seen.

## Stamp Format

10 base digits: `V_VVV_VVV_VVV_AAA_AAA`

- `V` - version counter. ~ `10**10` ~ `2**32`
- `A` - peer id. ~ `10**6` ~ `2**20`

Negative stamps is used for tombstones.

## Stamp Properties

- Stamps from one peer is monotonic. Its useful to take delta from last saw state of peer to current state. Every peer should remember last version of all other peers.
- Next stamp is greater than all known stamps.
