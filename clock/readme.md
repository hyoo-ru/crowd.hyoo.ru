# CROWD Clock

Manages vector of versions. Remembers last seen version for every seen peer. And generates new version for current peer that greater then all seen.

## Stamp Properties

- Stamps from one peer is monotonic. Its useful to take delta from last seen state of peer to current state. Every peer should remember last version of all other peers.
- Next version is greater than all seen versions.
