# CROWD Stamper

Manages versions through composed CROWD stores.

## Stamp Format

10 base digits: `V_VVV_VVV_VVV_AAA_AAA`

- `V` - version counter. ~ `10**10` ~ `2**32`
- `A` - actor id. ~ `10**6` ~ `2**20`

Negative stamps is used for tombstones.

## Stamp Properties

- Stamps from one actor is monotonic. Its useful to take delta from last saw state of actor to current state. Every actor should remember last version of all other actors.
- Next stamp is greater than all known stamps.
