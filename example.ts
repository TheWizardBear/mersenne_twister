import MersenneTwister from "./mod.ts";

const prng = new MersenneTwister(5555);

console.log(prng.random_int31()); // 1196907045