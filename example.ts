import MersenneTwister from "./mod.ts";

const prng = new MersenneTwister(1234);

console.log(prng.random()); // 0.19151945016346872