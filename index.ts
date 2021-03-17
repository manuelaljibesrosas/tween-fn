const noop = () => {};

type easingFn = (x: number) => number;

const easings = {
  LINEAR: (x: number) => x,
  SQUARED: (x: number) => Math.pow(x, 2),
  CUBIC: (x: number) => Math.pow(x, 3),
  QUART: (x: number) => Math.pow(x, 4),
  QUINT: (x: number) => Math.pow(x, 5),
  EASE_OUT_QUINT: (x: number) => 1 - Math.pow(1 - x, 5),
  EASE_IN_OUT_QUINT: (x: number) => x < 0.5 ? 16 * Math.pow(x, 5) : 1 - Math.pow(-2 * x + 2, 5) / 2,
  EASE_OUT_ELASTIC: (x: number) => {
    const c4 = (2 * Math.PI) / 3;

    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  },
};

enum directions {
  FORWARD = 0b00,
  BACKWARD = 0b01,
  ALTERNATE = 0b10,
}

interface TweenOptions {
  iterations?: number;
  direction?: directions;
  from?: number;
  to?: number;
  delay?: number;
  duration?: number;
  ease?: easingFn;
  begin?: (meta?: any) => void;
  update?: (y: number, meta?: any) => void;
  complete?: (y: number, meta?: any) => void;
  change?: (y: number, meta?: any) => void;
  loop?: (y: number, meta?: any) => void;
  meta?: object;
}

class Tween {
  completed: boolean = false;
  count: number = 0;
  delta: number = 0;
  begun: boolean = false;
  iterations: number;
  direction: directions;
  from: number;
  to: number;
  delay: number;
  duration: number;
  ease: easingFn;
  begin: (meta?: any) => void;
  update: (y: number, meta?: any) => void;
  complete: (y: number, meta?: any) => void;
  change: (y: number, meta?: any) => void;
  loop: (y: number, meta?: any) => void;
  meta: object;

  constructor(options: TweenOptions = {}) {
    const {
      iterations = 1,
      direction = directions.FORWARD,
      from = 0,
      to = 1,
      delay = 0,
      duration = 200,
      ease = easings.LINEAR,
      begin = noop,
      update = noop,
      complete = noop,
      change = noop,
      loop = noop,
      meta = {},
    } = options;

    this.iterations = iterations;
    this.direction = direction;
    this.from = from;
    this.to = to;
    this.delay = delay;
    this.duration = duration;
    this.ease = ease;
    this.begin = begin;
    this.update = update;
    this.complete = complete;
    this.change = change;
    this.loop = loop;
    this.meta = meta;
    this.delta = to - from;
  }

  tick(elapsed: number) {
    // calculate elapsed using delay offset
    elapsed -= this.delay;
    if (elapsed < 0) // it isn't our time yet
      return;
    else if (!this.begun) {
      this.begun = true;
      this.begin(this.meta);
    }
    const progress = Math.min((elapsed - (this.duration * this.count)) / this.duration, 1);
    
    let value;
    if (!(this.direction & directions.BACKWARD))
      value = (this.ease(progress) * this.delta) + this.from;
    else
      value = 1 - (this.ease(progress) * this.delta) + this.from;

    if (progress === 1) {
      if (this.direction & directions.ALTERNATE)
        this.direction = this.direction ^ directions.BACKWARD;

      if (this.iterations > ++this.count) {
        this.loop(value, this.meta);
        this.change(value, this.meta);
      } else {
        this.complete(value, this.meta);
        this.change(value, this.meta);
        this.completed = true;
      }
    } else {
      this.update(value, this.meta);
      this.change(value, this.meta);
    }
  }

  reset() {
    this.completed = false;
    this.count = 0;
    this.begun = false;
  }
}

class TweenPair extends Tween {
  a: Tween;
  b: Tween;

  constructor(a: Tween, b: Tween, opts?: TweenOptions) {
    super(opts);
    this.a = a;
    this.b = b;
    const totalDurationA = a.duration + a.delay;
    const totalDurationB = b.duration + b.delay;
    this.duration = Math.max(
      totalDurationA,
      totalDurationB,
    );
  }

  tick(elapsed: number) {
    // calculate elapsed using delay offset
    elapsed -= this.delay;
    if (elapsed < 0) // it isn't our time yet
      return;

    if (!this.a.completed)
      this.a.tick(elapsed);
    if (!this.b.completed)
      this.b.tick(elapsed);

    if (this.a.completed && this.b.completed)
      this.completed = true;
  }

  reset() {
    this.a.reset();
    this.b.reset();
  }
}

class Subscription {
  id: number = 0;
  unsubscribe = () => cancelAnimationFrame(this.id);
}

const unit = (options: TweenOptions) => (
  new Tween(options)
);
const merge = (a: Tween, b: Tween) => (
  new TweenPair(a, b)
);
const mergeAll = (ts: Array<Tween>) => ts.reduce((acc, cur) => merge(acc, cur));
const sequence = (ts: Array<Tween>): Tween => mergeAll(ts.map((t, i) => {
  if (i === 0)
    return t;
  t.delay += ts[i - 1].delay + ts[i - 1].duration;
  return t;
}));

interface Dependencies {
  now: () => number;
  requestFrame: (callback: (currentTime: number) => void) => number;
}

function run(
  tween: Tween,
  { now = performance.now, requestFrame = requestAnimationFrame }: Dependencies,
) {
  tween.reset();
  const startTime = now();
  let subscription = new Subscription();

  const tick = (currentTime: DOMHighResTimeStamp) => {
    const elapsed = Math.max(0, currentTime - startTime);

    tween.tick(elapsed);

    if (!tween.completed)
      subscription.id = requestFrame(tick);
  };

  subscription.id = requestFrame(tick);

  return subscription;
}

// transform utils
const computeTransform = (target: string, transform: string): string => (
  target.split(' ')
    .filter((a) => {
      const foundMatch = transform.split(' ').findIndex((b) => (
        a.split('(')[0] === b.split('(')[0]
      ));
      // if we find a match we want to return false
      // so that the transform function gets filtered out
      return foundMatch < 0;
    })
    .concat([transform])
    .join(" ")
);

// interpolation utils
const interpolate = (progress: number, from: number, to: number) => (
  from + ((to - from) * progress)
);
const interpolateArray = (
  progress: number,
  from: Array<number>,
  to: Array<number>,
): Array<number> => (
  from.map((a, i) => interpolate(progress, a, to[i]))
);

// path utils
type Path = string;
const getPathFromSource = (src: Path) => {
  const re = /[a-zA-Z]+/g;
  let prevIndex = 0;
  let match = re.exec(src);
  let ret = [];

  while ((match = re.exec(src)) !== null) {
    ret[ret.length] = [src[prevIndex], ...src.slice(prevIndex + 1, match.index).trim().split(' ')];
    prevIndex = match.index;
  }
  ret[ret.length] = [src[prevIndex]];

  return ret;
};
const interpolatePath = (progress: number, s1: Path, s2: Path): Path => {
  const p1 = getPathFromSource(s1);
  const p2 = getPathFromSource(s2);

  return p1.map((a, i) => {
    const b = p2[i];
    const cmd = a[0];

    return `${cmd} ${interpolateArray(progress, a.slice(1).map(Number), b.slice(1).map(Number))}`;
  }).join(' ');
};

export {
  Tween,
  TweenPair,
  easings,
  directions,
  unit,
  merge,
  mergeAll,
  sequence,
  run,
  computeTransform,
  interpolate,
  interpolateArray,
  interpolatePath,
};
