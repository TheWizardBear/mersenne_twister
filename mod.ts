/**
 * MersenneTwister
 * 
 * 	import MersenneTwister from "https://deno.land/x/mersenne_twister/mod.ts";
 * 	const prng = new MersenneTwister(1234);
 * 	console.log(prng.random()); // 0.19151945016346872
 * 
 * @param {number|number[]} seed The seed for the pseudo random number generator
 */
export default class MersenneTwister {

	//Period parameters

	N = 624;
	M = 397;

	/* constant vector a */
	MATRIX_A = 0x9908b0df;

	/* most significant w-r bits */
	UPPER_MASK = 0x80000000;

	/* least significant r bits */
	LOWER_MASK = 0x7fffffff;

	/* the array for the state vector */
	mt = new Array(this.N);

	/* mti==N+1 means mt[N] is not initialized */
	mti = this.N + 1;

	/**
	 * @param {number|number[]} seed The seed for the pseudo random number generator
	 */
	constructor(seed ? : number | number[]) {
		if (typeof seed === "undefined") {
			seed = new Date().getTime();
		}

		if (typeof seed === "number") {
			this.init_seed(seed as number);
		} else {
			this.init_by_array(seed);
		}
	}

	/**
	 * Initializes mt[N] with a seed 
	 * (Original name init_genrand)
	 * 
	 * @param {number} seed The seed for the pseudo random number generator as a number
	 */
	init_seed(s: number): void {
		this.mt[0] = s >>> 0;
		for (this.mti = 1; this.mti < this.N; this.mti++) {
			const s = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30);
			this.mt[this.mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253) +
				this.mti;
			/* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
			/* In the previous versions, MSBs of the seed affect   */
			/* only MSBs of the array mt[].                        */
			/* 2002/01/09 modified by Makoto Matsumoto             */
			this.mt[this.mti] >>>= 0;
			/* for >32 bit machines */
		}
	}

	/**
	 * initialize by an array with array-length 
	 * init_key is the array for initializing keys
	 * slight change for C++, 2004/2/26
	 *
	 * @param {number[]} seed The seed for the pseudo random number generator as an array of numbers
	 */
	init_by_array(init_key: number[]): void {
		const key_length = init_key.length;
		let i = 1,
			j = 0;
		this.init_seed(19650218);
		for (let k = this.N > key_length ? this.N : key_length; k; k--) {
			const s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30)
			//non-linear
			this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1664525) << 16) + ((s & 0x0000ffff) * 1664525))) +
				init_key[j] + j;
			//for WORDSIZE > 32 machines
			this.mt[i] >>>= 0;
			i++;
			j++;
			if (i >= this.N) {
				this.mt[0] = this.mt[this.N - 1];
				i = 1;
			}
			if (j >= key_length) j = 0;
		}
		for (let k = this.N - 1; k; k--) {
			const s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
			//non-linear
			this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) + (s & 0x0000ffff) * 1566083941)) -
				i;
			//for WORDSIZE > 32 machines
			this.mt[i] >>>= 0; 
			i++;
			if (i >= this.N) {
				this.mt[0] = this.mt[this.N - 1];
				i = 1;
			}
		}

		this.mt[0] = 0x80000000; /* MSB is 1; assuring non-zero initial array */
	}

	/**
	 * generates a random number on [0,0xffffffff]-interval 
	 * (Original name genrand_int32)
	 */
	random_int(): number {
		let y;
		
		const mag01 = new Array(0x0, this.MATRIX_A);
		//mag01[x] = x * MATRIX_A  for x=0,1

		//generate N words at one time
		if (this.mti >= this.N) {
			let kk;

			//if init_seed() has not been called, use a default initial seed instead
			if (this.mti == this.N + 1) this.init_seed(5489);

			for (kk = 0; kk < this.N - this.M; kk++) {
				y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
				this.mt[kk] = this.mt[kk + this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
			}
			for (; kk < this.N - 1; kk++) {
				y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
				this.mt[kk] = this.mt[kk + (this.M - this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
			}
			y = (this.mt[this.N - 1] & this.UPPER_MASK) | (this.mt[0] & this.LOWER_MASK);
			this.mt[this.N - 1] = this.mt[this.M - 1] ^ (y >>> 1) ^ mag01[y & 0x1];

			this.mti = 0;
		}

		y = this.mt[this.mti++];

		/* Tempering */
		y ^= (y >>> 11);
		y ^= (y << 7) & 0x9d2c5680;
		y ^= (y << 15) & 0xefc60000;
		y ^= (y >>> 18);

		return y >>> 0;
	}


	/**
	 * Generates a random number on [0,0x7fffffff]-interval
	 * (Original name genrand_int3)
	 * 
	 *   const prng = new MersenneTwister(5555);
	 *   console.log(prng.random_int31()); // 1196907045
	 *
	 */
	random_int31(): number {
		return (this.random_int() >>> 1);
	}

	/**
	 * Generates a random number on [0,1]-real-interval
	 * Inlcudes 0 and 1
	 * (Original name genrand_real1)
	*/
	random_incl(): number {
		//divide by 2^32-1
		return this.random_int() * (1.0 / 4294967295.0);
	}

	/**
	 * Generates a random number on [0,1)-real-interval 
	 * Includes 0 but not 1
	 * This method works much the same as Math.random() (except it is using a different pseudo random number generator)
	 */
	random(): number {
		//divide by 2^32
		return this.random_int() * (1.0 / 4294967296.0);
	}

	/**
	 * Generates a random number on (0,1)-real-interval
	 * Doesn't include 0 or 1
	 * (Original name genrand_real3)
	 */
	random_excl(): number {
		//divide by 2^32 after adding 0.5
		return (this.random_int() + 0.5) * (1.0 / 4294967296.0);
	}

	/**
	 * Generates a random number on [0,1) with 53-bit resolution
	 * (Original name genrand_res53)
	 */
	random_long(): number {
		const a = this.random_int() >>> 5,
			b = this.random_int() >>> 6;
		return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
	}
}


/* These real versions are due to Isaku Wada, 2002/01/09 added */