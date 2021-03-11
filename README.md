# Tween-fn

A tiny (2kb gzipped) library for coordinating complex animation sequences, it focuses on providing the means for writing a _description_ of a sequence using a small but powerful set of function primitives which are fully composable. Unlike existing alternatives like `GSAP` or `animejs`, `tween-fn` __does not assume anything about your application__, consequently, it doesn't know anything about the DOM or whichever JS framework you happen to prefer, this allows you to be very explicit about what you're trying to achieve

## Installation

```bash
yarn add tween-fn
```

or

```bash
npm i -S tween-fn
```

## Quickstart

We start by writing a sequence using the primitives provided by the library

```typescript
const seq = sequence([
  unit({
    duration: 250,
    change: (value) => {
      el.style.width = `${interpolate(value, 100, 150)}px`;
    },
  }),
  unit({
    duration: 500,
    ease: easings.SQUARED,
    change: (value) => {
      el.style.transform = `translateX(${interpolate(value, 0, 50)})`;
    },
  }),
]);
```

And then pass that to `run` to play it

```typescript
run(seq);
```

For cancelation, you can use the subscription object returned from `run`

```typescript
const subscription = run(seq);

// somewhere else in your application...
subscription.unsubscribe();
```

## Recipes

### Animating multiple `transform`s
To apply multiple transforms at the same time, use the `meta` object supplied to your callback functions to rescue the original value of the transform, then compute the new transformation using the `computeTransform` function

```typescript
unit({
  begin: (meta) => { meta.originalTransform = circle.style.transform; },
  change: (value, { originalTransform }) => {
    circle.style.transform = computeTransform(
      originalTransform,
      `scale(${interpolate(value, 1, 1.2)}) translateX(${interpolate(value, 0, 100)}px)`,
    );
  },
});
```

### SVG path animations
Use the `interpolatePath` utility to easily animate between two different paths

```typescript
const path1 = '';
const path2 = '';

unit({
  change: (value) => {
    path.setAttribute('d', interpolatePath(value, path1, path2));
  },
});
```

### Staggering
Given a list of items, you can coordinate a staggering animation using `mergeAll` and adding delay to each animation

```typescript
mergeAll(nodeList.map((node, i) => unit({
  delay: 100 * i, // 100 miliseconds of delay between each animation
  change: (value) => {
    // do something...
  },
})));
```

## API

### `unit`
Used to create an animation, takes the following options

```typescript
interface TweenOptions {
  iterations?: number;
  direction?: directions;
  from?: number;
  to?: number;
  delay?: number;
  duration?: number;
  ease?: easingFn;
  begin?: (meta?: object | null) => void;
  update?: (y: number, meta?: object | null) => void;
  complete?: (y: number, meta?: object | null) => void;
  change?: (y?: number, meta?: object) => void;
  loop?: (y?: number, meta?: object) => void;
  meta?: object;
}
```

### `mergeAll`
Used for parallel execution of multiple animations

```typescript
mergeAll(ts: Array<Tween>): Tween
```

### `sequence`
Describes a _sequence_ of animations, where each animation supplied will run only after the previous one has completed (unless a negative value for `delay` is used)

```typescript
sequence(ts: Array<Tween>): Tween
```

### `run`
Executes the given description

```typescript
run(tween: Tween): Subscription
```

## Utils

### `easings`
A dictionary holding common easing functions, available functions are

```typescript
easings.LINEAR
easings.SQUARED
easings.CUBIC
easings.QUART
easings.QUINT
easings.EASE_OUT_QUINT
easings.EASE_IN_OUT_QUINT
easings.EASE_OUT_ELASTIC
```

Check out [easings.net](https://easings.net) for more information regarding these

### `interpolate`
Linearly interpolates between two values

```typescript
interpolate(progress: number, start: number, end: number): number
```

### `interpolatePath`
Linearly interpolates between two paths, __paths must have the same number of points__

```typescript
interpolatePath(progress: number, p1: string, p2: string): string
```

## Roadmap
* playback controls
* more easing functions
* add examples
