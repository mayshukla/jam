# JAM

A live coding environment that allows realtime collaboration through a web browser.

Inspired by other live coding systems such as:
- [Sonic Pi](https://sonic-pi.net/)
- [Tidal Cycles](https://tidalcycles.org/)
- [Gibber](https://github.com/gibber-cc/gibber)

## Running Locally

Install [deno](https://deno.land/).

Run server:

```bash
deno run --allow-net --allow-read server.ts
```

Go to `http://localhost:8000/` in a browser.

## Project Status

I just started working on this so basically nothing is implemented yet :(

## TODO

- Implement backend with syncing
  - [x] implement differential syncing
- Add features to user API
  - [x] silence function
  - [ ] sequence manipulation through decorators and dot operators

	  e.g. seq("c4 e4 g4").shuffle().half()
	       this would be a wrapper around:
		   new HalfSequence(new ShuffleSequence(new ListSequence(...)))

  - [ ] configuration of options such as cycles per second
  - [ ] set volume of each named oscillator/track
  - [ ] effects
  - [ ] samples
  - [ ] LFOs
  - [ ] add support for parsing midi note numbers (e.g. 60 for middle C)
	- this may be more intuitive for people who don't know music theory
- UI improvements
  - [x] don't crash or stop music when an error occurs
  - [ ] cancel scheduled events and re-run scheduling (after state is restored)
        after an exception is thrown
  - [x] display error messages from user code in html page rather than in the
        console
  - [ ] make error messages more meaningful
	- this can be done by verifying the arguments of user functions such as
      play() rather than allowing any invalid arguments to cause exceptions to
      be thrown later.
  - [ ] show other users' cursors
  - [x] keyboard shortcuts
  - [x] syntax highlighting

## Ideas for sequence manipulation
- [x] chooseRand
- [x] join (concatenates 2 sequences)
- [x] times
- [x] divide
- [x] every(n)
- [ ] shuffle
- [ ] reverse
- [ ] chance(x) (will play the sequence with a probability x)
- [ ] chord("c4 e4 g4") (plays notes simultaneously)
- [ ] euclidean
- [ ] microtonal notes, non-western scales

## References
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques
- https://www.html5rocks.com/en/tutorials/audio/scheduling/
