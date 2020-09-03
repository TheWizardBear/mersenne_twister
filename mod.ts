/**
 * MersenneTwister
 * 
 * 
 * 
 */
export default class MersenneTwister {

	/* Period parameters */
	N = 624;
	M = 397;
	MATRIX_A = 0x9908b0df; /* constant vector a */
	UPPER_MASK = 0x80000000; /* most significant w-r bits */
	LOWER_MASK = 0x7fffffff; /* least significant r bits */

	mt = new Array(this.N); /* the array for the state vector */
	mti = this.N + 1; /* mti==N+1 means mt[N] is not initialized */

	constructor(seed ? : number | number[]) {
		if (typeof seed === "undefined") {
			seed = new Date().getTime();
			console.log(seed)
		}

		if (typeof seed === "number") {
			this.init_seed(seed as number);
		} else {
			this.init_by_array(seed);
		}
	}

	/* initializes mt[N] with a seed */
	/* origin name init_genrand */
	init_seed(s: number) {
		this.mt[0] = s >>> 0;
		for (this.mti = 1; this.mti < this.N; this.mti++) {
			let s = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30);
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

	/* initialize by an array with array-length */
	/* init_key is the array for initializing keys */
	/* slight change for C++, 2004/2/26 */
	init_by_array(init_key: number[]) {
		let key_length = init_key.length;
		let i, j;
		this.init_seed(19650218);
		i = 1;
		j = 0;
		for (let k = this.N > key_length ? this.N : key_length; k; k--) {
			let s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30)
			this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1664525) << 16) + ((s & 0x0000ffff) * 1664525))) +
				init_key[j] + j; /* non linear */
			this.mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
			i++;
			j++;
			if (i >= this.N) {
				this.mt[0] = this.mt[this.N - 1];
				i = 1;
			}
			if (j >= key_length) j = 0;
		}
		for (let k = this.N - 1; k; k--) {
			let s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
			this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) + (s & 0x0000ffff) * 1566083941)) -
				i; /* non linear */
			this.mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
			i++;
			if (i >= this.N) {
				this.mt[0] = this.mt[this.N - 1];
				i = 1;
			}
		}

		this.mt[0] = 0x80000000; /* MSB is 1; assuring non-zero initial array */
	}

	/* generates a random number on [0,0xffffffff]-interval */
	/* origin name genrand_int32 */
	random_int() :number {
		let y;
		let mag01 = new Array(0x0, this.MATRIX_A);
		/* mag01[x] = x * MATRIX_A  for x=0,1 */

		if (this.mti >= this.N) {
			/* generate N words at one time */
			let kk;

			if (this.mti == this.N + 1) /* if init_seed() has not been called, */
				this.init_seed(5489); /* a default initial seed is used */

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
	 * const prng = new MersenneTwister(5555);
   * console.log(prng.random_int31()); // 1196907045
	 *
	 */
	random_int31() :number {
		return (this.random_int() >>> 1);
	}

	/**
	 * Generates a random number on [0,1]-real-interval
	 * (Original name genrand_real1)
	
	*/
	random_incl() :number {
		return this.random_int() * (1.0 / 4294967295.0);
		/* divided by 2^32-1 */
	}

	/* generates a random number on [0,1)-real-interval */
	random() :number {
		return this.random_int() * (1.0 / 4294967296.0);
		/* divided by 2^32 */
	}

	/* generates a random number on (0,1)-real-interval */
	/* origin name genrand_real3 */
	random_excl() :number {
		return (this.random_int() + 0.5) * (1.0 / 4294967296.0);
		/* divided by 2^32 */
	}

	/* generates a random number on [0,1) with 53-bit resolution*/
	/* origin name genrand_res53 */
	random_long() :number {
		let a = this.random_int() >>> 5,
			b = this.random_int() >>> 6;
		return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
	}
}


/* These real versions are due to Isaku Wada, 2002/01/09 added */
