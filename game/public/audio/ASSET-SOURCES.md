# Growora audio assets

No music or ambience audio files were present in the project, so none are
referenced or shipped as placeholder paths. The current implementation makes
its original, quiet music and sound layers with the Web Audio API.

To replace an individual synthesized layer with a real asset, add a legally
licensed, locally hosted file here and set its URL in `src/audio-assets.js`.
Supported manifest keys are `music` (a gapless, loop-edited track), `birds`,
`water`, `chickens`, and `bees`. Music, water, and bees are looped; bird and
chicken files are played as occasional one-shots. Use assets that permit
redistribution and include their source, license, and attribution here before
shipping them. Keep empty manifest values for layers without an installed
asset; the synthesizer remains the fallback.
