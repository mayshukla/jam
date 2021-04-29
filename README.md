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
  - [ ] silence function
  - [ ] sequence manipulation through decorators and dot operators

	  e.g. seq("c4 e4 g4").rand().half()
	       this would be a wrapper around:
		   new HalfSequence(new RandomSequence(new ListSequence(...)))

  - [ ] configuration of options such as cycles per second
  - [ ] effects
  - [ ] samples
  - [ ] LFOs
- UI improvements
  - [ ] don't crash or stop music when an error occurs
  - [ ] show other users' cursors
  - [x] keyboard shortcuts
  - [x] syntax highlighting

## References
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques
- https://www.html5rocks.com/en/tutorials/audio/scheduling/
