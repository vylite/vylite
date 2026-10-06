<script lang="ts" module>
	// A pixel-art beehive scene on a tiny canvas (image-rendering: pixelated, SCALE css px per
	// pixel). Sprites are string grids — edit them directly:
	//   '#' solid ink   '+' 55% ink   '-' 30% ink   'o' hole (background shows = entrance/eyes)
	const ALPHA: Record<string, number> = { '#': 1, '+': 0.55, '-': 0.3 };

	const flip = (art: string[]) => art.map((r) => [...r].reverse().join(''));
	const sprite = (art: string[]) => [art, flip(art)] as const; // [facing right, facing left]

	// hanging skep: coil bands, a rounded entrance, honey strands trailing off the lip
	const HIVE = [
		'.......###.......',
		'....#########....',
		'..++++++++++++#..',
		'.###############.',
		'.###############.',
		'..+++++++++++++..',
		'.#######oo######.',
		'.######oooo#####.',
		'..+++++oooo++++..',
		'..######oo#####..',
		'...###########...',
		'.....#+###+##....',
		'......+....+.....',
		'......+..........',
		'......+..........'
	];
	const HIVE_W = 17;

	// The bee zoo — every kind faces right in frame art, sprite() makes the left twin. Two flap
	// frames each; the body never changes between frames (same mass), only the wings move.
	type BeeKind = { w: number; h: number; frames: readonly (readonly string[][])[] };

	const beeKind = (frames: string[][]): BeeKind => ({
		w: frames[0][0].length,
		h: frames[0].length,
		frames: frames.map((f) => sprite(f))
	});

	// wisp — the smallest thing that still reads as a bee. One band running the full body height
	// (the '+' column near the tail) and a single eye hole near the head
	const BEE_WISP = beeKind([
		['.-.-.', '.+##.', '#+#o#', '.+##.'],
		['-...-', '.+##.', '#+#o#', '.+##.']
	]);

	// a falling drop of honey: beading at the lip, falling, splat in the meadow
	const DROP_SMALL = ['+'];
	const DROP_BIG = ['+', '#'];
	const SPLAT = ['-+++-'];

	// blooms are where bees land (two species; a patch is all one species); tufts and pebbles
	// fill the gaps between them
	const BLOOM = ['.###.', '#+++#', '.###.', '..-..', '..-..', '..-..'];
	const BLOOM_DAISY = ['..#..', '.#+#.', '..#..', '..-..', '..-..'];
	const BLOOM_KINDS = [BLOOM, BLOOM_DAISY];

	// grass tufts carry two frames — the tip pixels shift a column so a breeze can travel
	const GRASS: [string[], string[]][] = [
		[
			['-.-.-', '-----'],
			['.-.-.', '-----']
		],
		[
			['.-.', '---'],
			['-..', '---']
		]
	];
	const PEBBLES = [['##'], ['.##', '###'], ['#..#', '####']];
	// pond-side reeds: the head leans a pixel between frames
	const CATTAIL: [string[], string[]] = [
		['.#.', '.#.', '.-.', '.-.', '.-.'],
		['#..', '#..', '.-.', '.-.', '.-.']
	];

	const LEAF = ['.++.', '++++', '.++.'];
	const LEAF_BIG = ['.++++.', '++++++', '.++++.'];
	const CLOUDS = [
		['...####......', '.#########...', '#############'],
		['..#####..', '#########']
	];

	// deterministic PRNG — same seed, same meadow on every load
	function mulberry32(seed: number) {
		let a = seed >>> 0;
		return () => {
			a |= 0;
			a = (a + 0x6d2b79f5) | 0;
			let t = Math.imul(a ^ (a >>> 15), 1 | a);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	// Fixed terrain: [fraction of width, ground height] steps — flat runs with whole-pixel
	// rises and dips. The band around 0.52–0.68 stays flat so the pond can sit in it.
	const TERRAIN: [number, number][] = [
		[0, 3],
		[0.16, 4],
		[0.26, 3],
		[0.36, 4],
		[0.48, 3],
		[0.68, 4],
		[0.76, 5],
		[0.86, 4],
		[0.93, 5]
	];
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import './Hive.scss';

	const SCALE = 3; // css px per sprite pixel
	const BRANCH_Y = 2; // the straight branch runs along the top, the hive hangs from it
	const HIVE_Y = 6;

	// Smooth motion: a fast tick with sub-pixel float positions drawn rounded (still chunky-
	// pixelated, nothing eases). Bees carry a heading angle and steer with a limited turn rate
	// plus angular noise — outbound flight wavers, a pollen-loaded bee beelines straight home.
	// Every transition is flown; nothing snaps to a new position.
	const TICK_MS = 100;
	const MAX_BEES = 5;
	const P_BEE = 0.012; // per tick while below the cap
	const P_DRIP = 0.008; // per tick while no drop is falling

	let track = $state<HTMLDivElement>();
	let canvas = $state<HTMLCanvasElement>();

	type BeeState =
		| 'roam' // wavering waypoint flight in the sky band
		| 'survey' // heading for the airspace above a flower patch
		| 'circle' // slow wide loops over the patch before choosing a flower
		| 'to-spot' // flying toward the hover point above a bloom
		| 'hover' // drifting above it, deciding
		| 'land' // slow settle onto the head
		| 'sip' // on a flower, slow wings
		| 'home' // beeline back, trailing pollen
		| 'enter'; // slipping into the entrance (vanishes behind the hive)

	type Bee = {
		x: number;
		y: number;
		a: number; // heading, radians
		speed: number; // per-bee pace multiplier — scales BOTH speed and turn so speed/turn (the
		// turning radius that arrival radii must beat) stays invariant across bees
		wait: number; // ticks left sitting behind the hive before this bee launches (staggered exit)
		wings: number; // counter, not a toggle — the sip flap divides it down
		facing: 0 | 1;
		state: BeeState;
		goal: { x: number; y: number }; // waypoint, hover point, or (while circling) orbit centre
		next: { x: number; y: number } | null; // second leg (under the hive, then up to the door)
		spot: { x: number; y: number; px: number; patch: number } | null; // claimed bloom
		stops: number; // roaming waypoints left before picking something to do
		timer: number; // ticks left in timed states (circle/hover/sip)
		t: number; // phase for orbits and drift-bobs
		ramp: number; // 0→1 ease for the circle pace, so speeding up reads as gradual, not a jump
		sips: number; // blooms visited this trip — after a couple, pollen goes home
		pollen: boolean;
	};
	let bees: Bee[] = [];
	let dust: { x: number; y: number; age: number }[] = []; // pollen motes, sinking and fading
	const DUST_LIFE = 28;
	let drop: { x: number; y: number; age: number; splat: number } | null = null;
	let shimmer = 0; // pond sparkle drift
	let breeze = 0; // grass sway wave
	// an occasional wind gust: faint streaks sweeping left→right, quickening the grass as it passes.
	// One at a time, spaced by a cooldown, and each picks fresh streak rows so it's never the same path
	let gust: { x: number; age: number; rows: [number, number, number][] } | null = null;
	let gustCd = 60; // ticks until the next gust may begin
	const GUST_LIFE = 30;
	let clouds: { x: number; y: number; kind: number; phase: number }[] = [];
	type Plant = {
		x: number;
		w: number;
		frames: [string[], string[]];
		top: number;
		bloom: boolean;
		stone: boolean;
		patch: number;
	};
	let plants: Plant[] = [];
	let terr: number[] = []; // ground height per column — fixed profile, varying heights
	let pond = { x0: 0, x1: 0, y: 0 }; // y = water surface row
	let W = 160; // canvas width in pixels, measured
	let H = 33; // canvas height in pixels, measured off the container (≈ three command suggestions)
	let skyFloor = 20; // lowest y the roam band reaches: above every plant top

	const bee = () => BEE_WISP;
	const hiveX = () => Math.min(12, Math.max(2, Math.round(W * 0.06)));
	const doorAt = () => ({ x: hiveX() + 5, y: HIVE_Y + 6 });
	const underHive = () => ({ x: hiveX() + HIVE_W + 5, y: HIVE_Y + HIVE.length + 1 });
	const groundYAt = (x: number) => {
		const cx = Math.max(0, Math.min(W - 1, Math.round(x)));
		if (cx >= pond.x0 && cx < pond.x1) return pond.y; // nobody sinks into the water
		return H - (terr[cx] ?? 3);
	};

	// the sky band bees roam in: right of the hive, on-screen, and strictly above every plant
	// (a bee cruising at petal height is the same ink as the flower — they smear together)
	function skyGoal(fromY?: number) {
		const b = bee();
		const minY = 2;
		const maxY = Math.max(minY, skyFloor - b.h);
		let y = minY + Math.random() * (maxY - minY);
		// waypoints force real vertical travel — a run of same-height goals reads as a bus route
		if (fromY !== undefined && Math.abs(y - fromY) < 4) {
			const dir = fromY - minY < maxY - fromY ? 1 : -1;
			y = Math.max(minY, Math.min(maxY, fromY + dir * (4 + Math.random() * 7)));
		}
		const x0 = hiveX() + HIVE_W + 4;
		const x1 = Math.max(x0 + 10, W - b.w - 4);
		return { x: x0 + Math.random() * (x1 - x0), y };
	}

	// unclaimed blooms — one bee per flower head keeps same-ink sprites from stacking
	function freeBlooms(except?: Bee) {
		const seated: BeeState[] = ['survey', 'circle', 'to-spot', 'hover', 'land', 'sip'];
		const claimed = new Set(
			bees.filter((o) => o !== except && o.spot && seated.includes(o.state)).map((o) => o.spot!.px)
		);
		return plants.filter((p) => p.bloom && !claimed.has(p.x));
	}

	// claim a bloom (one bee per head) without committing to a flight state yet
	function reserve(b: Bee, p: Plant) {
		const k = bee();
		b.spot = { x: p.x + ((p.w - k.w) >> 1), y: p.top - k.h, px: p.x, patch: p.patch };
	}

	function target(b: Bee, p: Plant) {
		reserve(b, p);
		b.state = 'to-spot';
		b.goal = { x: b.spot!.x, y: b.spot!.y - 4 }; // hover point above the head
	}

	function toRoam(b: Bee) {
		b.state = 'roam';
		b.spot = null;
		b.stops = Math.floor(Math.random() * 2); // 0–1 waypoints, then look for a flower
		b.goal = skyGoal(b.y);
	}

	function headHome(b: Bee) {
		b.state = 'home';
		b.spot = null;
		b.goal = underHive(); // approach low, then rise into the entrance from below
		b.next = doorAt();
	}

	// steer toward the goal with a limited turn rate and angular noise, then step along the
	// heading — turn/noise per state is what separates a waver from a beeline
	function steer(b: Bee, tx: number, ty: number, speed: number, turn: number, noise: number) {
		const want = Math.atan2(ty - b.y, tx - b.x);
		let d = want - b.a;
		while (d > Math.PI) d -= 2 * Math.PI;
		while (d < -Math.PI) d += 2 * Math.PI;
		b.a += Math.max(-turn, Math.min(turn, d)) + (Math.random() - 0.5) * noise;
		b.x += Math.cos(b.a) * speed;
		b.y += Math.sin(b.a) * speed;
		if (Math.abs(Math.cos(b.a)) > 0.25) b.facing = Math.cos(b.a) > 0 ? 0 : 1;
	}

	const nearGoal = (b: Bee, r: number) => Math.hypot(b.goal.x - b.x, b.goal.y - b.y) < r;
	const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

	function spawnBee(): Bee {
		const d = doorAt();
		return {
			x: d.x,
			y: d.y,
			a: Math.PI / 2,
			speed: 0.78 + Math.random() * 0.5, // 0.78–1.28: no two bees cruise in lockstep
			wait: 0,
			wings: Math.floor(Math.random() * 8),
			facing: 0,
			state: 'roam',
			goal: underHive(),
			next: null,
			spot: null,
			stops: Math.floor(Math.random() * 2),
			timer: 0,
			t: 0,
			ramp: 0,
			sips: 0,
			pollen: false
		};
	}

	function tick() {
		// a new bee slips out of the entrance and drops below the hive before heading out
		if (bees.length < MAX_BEES && Math.random() < P_BEE) {
			const b = spawnBee();
			b.wait = 6 + Math.floor(Math.random() * 12); // a beat at the door before it flies
			bees.push(b);
		}

		const spec = bee();
		bees = bees.filter((b) => {
			b.wings = (b.wings + 1) & 31;

			switch (b.state) {
				case 'roam': {
					if (b.wait > 0) {
						b.wait -= 1; // still tucked behind the hive, waiting its turn to fly out
						break;
					}
					steer(b, b.goal.x, b.goal.y, 0.45 * b.speed, 0.12 * b.speed, 0.4);
					// soft walls: reflect the heading so the wander curves back instead of sliding
					const maxY = skyFloor - spec.h;
					if (b.y < 2 && Math.sin(b.a) < 0) b.a = -b.a;
					if (b.y > maxY && Math.sin(b.a) > 0) b.a = -b.a;
					if (b.x < 3 && Math.cos(b.a) < 0) b.a = Math.PI - b.a;
					if (b.x > W - spec.w - 3 && Math.cos(b.a) > 0) b.a = Math.PI - b.a;
					// arrival radius must beat the turning radius (speed/turn ≈ 3.75, invariant of
					// b.speed since turn scales with it) or a bee can orbit its waypoint forever
					if (!nearGoal(b, 4.5)) break;
					if (b.stops > 0) {
						b.stops -= 1;
						b.goal = skyGoal(b.y);
						break;
					}
					// bees are here to sip: almost always commit to a flower when one is free, and
					// pick a near one so a bee that drifted to the right end lands on the patch there
					// rather than turning around and flying all the way back for nothing
					const bl = freeBlooms(b);
					if (bl.length > 0 && Math.random() < 0.9) {
						bl.sort(
							(p, q) => Math.hypot(p.x - b.x, p.top - b.y) - Math.hypot(q.x - b.x, q.top - b.y)
						);
						const p = bl[Math.floor(Math.random() * Math.ceil(bl.length / 2))]; // one of the nearer half
						const mates = plants.filter((q) => q.bloom && q.patch === p.patch);
						const cx = mates.reduce((s, q) => s + q.x + q.w / 2, 0) / mates.length;
						// a real patch, and far enough from the hive that wide loops don't look odd:
						// cruise over and circle before choosing. Near-hive blooms go straight in.
						if (p.patch >= 0 && mates.length > 1 && cx > hiveX() + HIVE_W + 28) {
							reserve(b, p); // claim the flower now so circling always ends in a landing
							b.state = 'survey';
							b.goal = { x: cx, y: Math.min(...mates.map((q) => q.top)) - 8 };
						} else target(b, p);
					} else if (Math.random() < 0.4) {
						b.stops = Math.floor(Math.random() * 2);
						b.goal = skyGoal(b.y);
					} else headHome(b);
					break;
				}

				case 'survey':
					steer(b, b.goal.x, b.goal.y, 0.5 * b.speed, 0.25 * b.speed, 0.15);
					if (nearGoal(b, 4)) {
						b.state = 'circle'; // goal stays put — it's the orbit centre now
						b.t = Math.atan2((b.y - b.goal.y) / 3, (b.x - b.goal.x) / 8);
						b.ramp = 0;
						b.timer = 26 + Math.floor(Math.random() * 26); // shorter loop, commits sooner
					}
					break;

				case 'circle': {
					// tight loops over the patch: chase a carrot gliding a small flat ellipse. The
					// pace eases up out of the survey glide (gradual, not a jump) and the smaller,
					// quicker loop makes the circling actually read as circling
					b.ramp = Math.min(1, b.ramp + 0.05);
					const sp = b.speed * (0.5 + 0.18 * b.ramp);
					b.t += sp / 8; // carrot speed ≈ sp × width⁻¹, so the loop holds its width
					steer(
						b,
						b.goal.x + 8 * Math.cos(b.t),
						b.goal.y + 3 * Math.sin(b.t),
						sp,
						0.3 * b.speed,
						0.05
					);
					if (--b.timer > 0) break;
					// drop onto the flower reserved on the way in — circling always ends in a landing
					const s = b.spot!;
					b.state = 'to-spot';
					b.goal = { x: s.x, y: s.y - 4 };
					break;
				}

				case 'to-spot':
					steer(b, b.goal.x, b.goal.y, 0.5 * b.speed, 0.3 * b.speed, 0.15);
					if (nearGoal(b, 2)) {
						b.state = 'hover';
						b.t = 0;
						b.timer = 8 + Math.floor(Math.random() * 10);
					}
					break;

				case 'hover':
					// drift-bob above the head — a weak pull keeps the path continuous (no snapping)
					b.t += 1;
					b.x += (b.goal.x - b.x) * 0.08 + 0.18 * Math.sin(b.t * 0.7);
					b.y += (b.goal.y - b.y) * 0.08 + 0.22 * Math.sin(b.t * 1.2);
					if (--b.timer <= 0) b.state = 'land';
					break;

				case 'land': {
					const s = b.spot!;
					b.x += Math.sign(s.x - b.x) * Math.min(0.35, Math.abs(s.x - b.x));
					b.y += Math.min(0.45, Math.max(0, s.y - b.y));
					if (Math.abs(b.x - s.x) < 0.4 && Math.abs(b.y - s.y) < 0.4) {
						b.x = s.x;
						b.y = s.y;
						b.state = 'sip';
						b.timer = 40 + Math.floor(Math.random() * 60);
					}
					break;
				}

				case 'sip': {
					if (Math.random() < 0.015) b.facing = b.facing === 0 ? 1 : 0;
					if (--b.timer > 0) break;
					b.sips += 1;
					const s = b.spot!;
					// short hop to a neighbouring flower in the same patch before committing home
					const nearby = freeBlooms(b).filter(
						(p) => p.patch === s.patch && s.patch >= 0 && p.x !== s.px
					);
					if (b.sips < 2 && nearby.length > 0 && Math.random() < 0.6) {
						target(b, pick(nearby));
						b.a = -Math.PI / 2;
					} else {
						b.pollen = true;
						headHome(b);
					}
					break;
				}

				case 'home':
					// a pollen-loaded bee beelines home — clearly the fastest thing on screen
					steer(b, b.goal.x, b.goal.y, 1.1 * b.speed, 0.6 * b.speed, 0.06);
					if (b.pollen && Math.random() < 0.18)
						dust.push({
							// off the trailing end (the tail — sprites face right, so the abdomen is the
							// left edge facing right / the right edge facing left) and low on the body,
							// not the wing rows up top
							x: b.x + (b.facing === 0 ? 0 : spec.w - 1),
							y: b.y + spec.h - 1 - Math.floor(Math.random() * 2),
							age: 0
						});
					if (nearGoal(b, 2.5)) {
						if (b.next) {
							b.goal = b.next;
							b.next = null;
							b.state = 'enter';
						}
					}
					break;

				case 'enter':
					steer(b, b.goal.x, b.goal.y, 0.7, 0.9, 0);
					if (nearGoal(b, 1.5)) return false; // slipped inside, pollen delivered
					break;
			}

			// hard walls: nobody leaves the screen, nobody sinks into the terrain or the pond
			b.x = Math.min(W - spec.w - 1, Math.max(1, b.x));
			b.y = Math.min(groundYAt(b.x + spec.w / 2) - spec.h, Math.max(2, b.y));
			return true;
		});

		// airborne bees shy apart so they don't stack into one blob (gentle nudges)
		const flying: BeeState[] = ['roam', 'survey', 'home'];
		const airborne = bees.filter((b) => flying.includes(b.state) && b.wait === 0);
		for (let i = 0; i < airborne.length; i++)
			for (let j = i + 1; j < airborne.length; j++) {
				const a = airborne[i];
				const b = airborne[j];
				if (Math.abs(a.x - b.x) < spec.w && Math.abs(a.y - b.y) < spec.h) {
					const up = a.y <= b.y ? a : b;
					const dn = a.y <= b.y ? b : a;
					up.y = Math.max(2, up.y - 0.3);
					dn.y = Math.min(groundYAt(dn.x) - spec.h, dn.y + 0.3);
				}
			}

		// pollen motes sink slowly and fade — a soft trail, not a sparkler
		dust = dust.filter((d) => {
			d.age += 1;
			d.y += 0.04;
			return d.age < DUST_LIFE;
		});

		// honey: a bead swells at the lip, lets go, and splats in the meadow
		if (drop) {
			drop.age += 1;
			const gy = groundYAt(drop.x) - 1;
			if (drop.y >= gy) {
				drop.y = gy;
				if (++drop.splat > 12) drop = null; // splat soaks in
			} else if (drop.age > 32 && drop.age % 2 === 0) drop.y += 1; // falling
		} else if (Math.random() < P_DRIP) {
			drop = {
				x: hiveX() + 6 + Math.floor(Math.random() * 6),
				y: HIVE_Y + HIVE.length,
				age: 0,
				splat: 0
			};
		}

		shimmer += 1;
		// one gust at a time, spaced by a cooldown so they never chain. Each gust picks fresh streak
		// rows so it never sweeps the exact same path twice. While it passes it quickens the sway and
		// gives roaming bees a gentle downwind nudge (never enough to fight their steering).
		if (gustCd > 0) gustCd -= 1;
		if (!gust && gustCd === 0 && Math.random() < 0.03) {
			const band = Math.max(4, skyFloor - 3);
			const rows: [number, number, number][] = [];
			for (let i = 0, n = 3 + Math.floor(Math.random() * 2); i < n; i++)
				rows.push([
					2 + Math.floor(Math.random() * band),
					Math.floor(Math.random() * 6) - 3,
					2 + Math.floor(Math.random() * 2)
				]);
			gust = { x: -12, age: 0, rows };
		}
		if (gust) {
			gust.x += 2.6;
			breeze += 2;
			for (const b of bees) if (b.state === 'roam' && b.wait === 0) b.x += 0.18;
			if (++gust.age > GUST_LIFE || gust.x > W + 12) {
				gust = null;
				gustCd = 110 + Math.floor(Math.random() * 170); // ~11–28s of calm before the next
			}
		}
		breeze += 1;

		// clouds crawl one pixel every so often, each on its own beat, wrapping around
		for (const cl of clouds) {
			cl.phase += 1;
			if (cl.phase % 12 === 0) cl.x += 1;
			if (cl.x > W + 2) cl.x = -14;
		}

		draw();
	}

	function drawSprite(
		ctx: CanvasRenderingContext2D,
		art: readonly string[],
		x0: number,
		y0: number,
		color: string,
		fade = 1
	) {
		ctx.fillStyle = color;
		for (let r = 0; r < art.length; r++) {
			for (let c = 0; c < art[r].length; c++) {
				const a = ALPHA[art[r][c]];
				if (!a) continue; // '.' and 'o' stay unpainted — background shows through
				ctx.globalAlpha = a * fade;
				ctx.fillRect(x0 + c, y0 + r, 1, 1);
			}
		}
		ctx.globalAlpha = 1;
	}

	function drawBee(ctx: CanvasRenderingContext2D, b: Bee, ink: string) {
		const spec = bee();
		const flap = b.state === 'sip' ? (b.wings >> 3) & 1 : b.wings & 1;
		drawSprite(ctx, spec.frames[flap][b.facing], Math.round(b.x), Math.round(b.y), ink);
	}

	function draw() {
		const ctx = canvas?.getContext('2d');
		if (!ctx || !canvas) return;
		const styles = getComputedStyle(canvas);
		// --color-bees is the per-theme sprite ink token; accent is only the fallback for a theme
		// that doesn't define it
		const ink =
			styles.getPropertyValue('--color-bees').trim() ||
			styles.getPropertyValue('--color-accent').trim() ||
			'#888';
		const soft = styles.getPropertyValue('--color-text-muted').trim() || '#888';
		ctx.clearRect(0, 0, W, H);
		for (const cl of clouds) drawSprite(ctx, CLOUDS[cl.kind], Math.round(cl.x), cl.y, soft, 0.3);

		// a gust: a little rake of faint dashes streaking across the sky band, fading as it passes
		if (gust) {
			ctx.fillStyle = soft;
			const gx = Math.round(gust.x);
			const fade = 1 - gust.age / GUST_LIFE;
			for (const [dy, off, len] of gust.rows) {
				ctx.globalAlpha = 0.3 * fade;
				ctx.fillRect(gx + off, dy, len, 1);
				ctx.globalAlpha = 0.16 * fade;
				ctx.fillRect(gx + off - len - 2, dy, Math.max(1, len - 1), 1);
			}
			ctx.globalAlpha = 1;
		}

		// rolling meadow, drawn per column so the fixed ground line can rise and dip
		ctx.fillStyle = ink;
		for (let x = 0; x < W; x++) {
			if (x >= pond.x0 && x < pond.x1) continue; // the pond fills this gap
			const gy = H - terr[x];
			ctx.globalAlpha = 0.24;
			ctx.fillRect(x, gy, 1, 1);
			ctx.globalAlpha = 0.12;
			ctx.fillRect(x, gy + 1, 1, H - gy - 1);
		}
		// the pond: still water one pixel below the bank tops, with a drifting sparkle
		ctx.fillStyle = soft;
		ctx.globalAlpha = 0.32;
		ctx.fillRect(pond.x0, pond.y, pond.x1 - pond.x0, H - pond.y);
		ctx.globalAlpha = 0.55;
		const pw = pond.x1 - pond.x0 - 4;
		if (pw > 6)
			for (let i = 0; i < 2; i++)
				ctx.fillRect(pond.x0 + 2 + ((Math.floor(shimmer / 8) + i * 9) % pw), pond.y, 2, 1);
		ctx.globalAlpha = 1;

		// the straight branch the hive hangs from, dressed with leaf clusters
		const hx = hiveX();
		ctx.fillStyle = ink;
		ctx.globalAlpha = 0.55;
		ctx.fillRect(0, BRANCH_Y, hx + 12, 2);
		ctx.fillRect(hx + 8, BRANCH_Y + 2, 1, HIVE_Y - BRANCH_Y - 2); // the hanging cord
		ctx.globalAlpha = 1;
		drawSprite(ctx, LEAF_BIG, hx + 11, BRANCH_Y - 1, ink, 0.8);
		drawSprite(ctx, LEAF, hx + 4, BRANCH_Y - 2, ink, 0.8);
		drawSprite(ctx, LEAF, hx + 15, BRANCH_Y + 1, ink, 0.8);

		// plants sway to a breeze that travels across the meadow (phase offset by x)
		for (const p of plants) {
			const frame =
				p.frames[0] === p.frames[1]
					? p.frames[0]
					: p.frames[(Math.floor(breeze / 5) + (p.x >> 3)) % 2];
			drawSprite(ctx, frame, p.x, p.top, p.stone ? soft : ink, p.stone ? 0.55 : 0.8);
		}

		// pollen motes fade in the bees' wake — steady, no flicker
		ctx.fillStyle = ink;
		for (const d of dust) {
			ctx.globalAlpha = 0.5 * (1 - d.age / DUST_LIFE);
			ctx.fillRect(Math.round(d.x), Math.round(d.y), 1, 1);
		}
		ctx.globalAlpha = 1;

		// every bee draws behind the hive — a bee slipping in vanishes behind the skep, and no bee
		// ever sits on the entrance
		for (const b of bees) drawBee(ctx, b, ink);
		drawSprite(ctx, HIVE, hx, HIVE_Y, ink);
		// the entrance shows the scene background through (its normal look) — clear its 'o' cells so
		// a bee that vanished behind the skep never bleeds through the hole
		for (let r = 0; r < HIVE.length; r++)
			for (let c = 0; c < HIVE[r].length; c++)
				if (HIVE[r][c] === 'o') ctx.clearRect(hx + c, HIVE_Y + r, 1, 1);
		if (drop) {
			const art = drop.splat > 0 ? SPLAT : drop.age > 16 ? DROP_BIG : DROP_SMALL;
			drawSprite(ctx, art, drop.x - (art === SPLAT ? 2 : 0), drop.y, ink);
		}
	}

	onMount(() => {
		const measure = () => {
			if (!track || !canvas) return;
			// hidden (display:none while suggestions replace the twig) measures 0×0 — bail, or the
			// canvas collapses to its minimum and the walls squash every bee into the same corner
			if (track.clientWidth === 0 || track.clientHeight === 0) return;
			W = Math.max(HIVE_W + 60, Math.floor(track.clientWidth / SCALE));
			// the container's CSS height IS three command suggestions — the scene fills it
			H = Math.max(28, Math.floor(track.clientHeight / SCALE));
			canvas.width = W;
			canvas.height = H;
			canvas.style.width = `${W * SCALE}px`;
			canvas.style.height = `${H * SCALE}px`;

			// fixed terrain profile, scaled to the measured width
			terr = new Array(W).fill(3);
			for (let x = 0; x < W; x++) for (const [f, h] of TERRAIN) if (x >= f * W) terr[x] = h;

			// the pond is dug into the flat band just right of centre; water sits one pixel
			// below the bank tops so the banks read as banks
			pond = { x0: Math.round(W * 0.53), x1: Math.round(W * 0.67), y: H - 2 };

			// Meadow planting — deterministic (seeded PRNG): flower patches (one species per
			// patch) on each side of the pond plus a loner or two; reeds hug the pond banks;
			// grass and pebbles fill the gaps.
			const rng = mulberry32(7);
			plants = [];
			const add = (
				x: number,
				frames: [string[], string[]],
				flags: { bloom?: boolean; stone?: boolean; patch?: number } = {}
			) => {
				const w = frames[0][0].length;
				plants.push({
					x,
					w,
					frames,
					top: groundYAt(x + (w >> 1)) - frames[0].length,
					bloom: flags.bloom ?? false,
					stone: flags.stone ?? false,
					patch: flags.patch ?? -1
				});
			};
			const x0 = hiveX() + HIVE_W + 3;
			const segA: [number, number] = [x0, pond.x0 - 10];
			const segB: [number, number] = [pond.x1 + 8, W - 9];
			const patchAt = (seg: [number, number], frac: number, id: number) => {
				if (seg[1] - seg[0] < 20) return;
				const art = BLOOM_KINDS[Math.floor(rng() * BLOOM_KINDS.length)];
				const n = 2 + Math.floor(rng() * 2);
				let px = Math.round(seg[0] + (seg[1] - seg[0]) * frac - (n * (art[0].length + 2)) / 2);
				for (let i = 0; i < n; i++) {
					const bx = Math.max(seg[0], Math.min(seg[1], px));
					add(bx, [art, art], { bloom: true, patch: id });
					px += art[0].length + 2 + Math.floor(rng() * 3);
				}
			};
			patchAt(segA, 0.5, 0);
			patchAt(segB, 0.35, 1);
			// a plain little patch out near the far-right end (same blooms as everywhere — nothing
			// gaudy) so a bee that drifts out there has somewhere to land instead of turning around
			patchAt(segB, 0.88, 2);
			for (let k = 0; k < 2; k++) {
				const seg = k === 0 ? segA : segB;
				const bx = Math.round(seg[0] + rng() * (seg[1] - seg[0]));
				if (plants.every((p) => !p.bloom || Math.abs(bx - p.x) > 12))
					add(bx, [BLOOM, BLOOM], { bloom: true, patch: -1 });
			}
			add(pond.x0 - 4, CATTAIL, {});
			add(pond.x1 + 1, CATTAIL, {});
			for (let px = x0; px < W - 8; px += 9 + Math.floor(rng() * 9)) {
				if (px > pond.x0 - 8 && px < pond.x1 + 5) continue;
				if (plants.some((p) => p.bloom && Math.abs(px - p.x) < 8)) continue;
				if (rng() < 0.65) add(px, GRASS[Math.floor(rng() * GRASS.length)]);
				else {
					const p = PEBBLES[Math.floor(rng() * PEBBLES.length)];
					add(px, [p, p], { stone: true });
				}
			}

			skyFloor = Math.min(H - Math.max(...terr), ...plants.map((p) => p.top)) - 1;

			// plants just re-flowed — anyone seated or landing was aiming at the old meadow
			for (const b of bees)
				if (['survey', 'circle', 'to-spot', 'hover', 'land', 'sip'].includes(b.state)) toRoam(b);

			clouds = [
				{ x: Math.random() * W * 0.5, y: 0, kind: 1, phase: 0 },
				{ x: W * 0.55 + Math.random() * W * 0.4, y: 3, kind: 0, phase: 6 }
			];
			draw();
		};
		measure();

		// the hive wakes up: every bee starts inside (tucked behind the skep at the door) and files
		// out one at a time — no bee is ever pre-seated in the air or on a flower. Waits accumulate
		// so there's always a clear gap between exits, never two leaving on the same tick.
		let launch = 8;
		for (let i = 0; i < 3; i++) {
			const b = spawnBee();
			b.wait = launch;
			launch += 30 + Math.floor(Math.random() * 28); // a 3–6s beat between each exit
			bees.push(b);
		}
		draw();

		const ro = new ResizeObserver(measure);
		if (track) ro.observe(track);
		const timer = setInterval(tick, TICK_MS);
		return () => {
			ro.disconnect();
			clearInterval(timer);
		};
	});
</script>

<div class="hive-scene" bind:this={track}>
	<canvas class="hive-canvas" bind:this={canvas}></canvas>
</div>
