"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.interpolatePath = exports.interpolateArray = exports.interpolate = exports.computeTransform = exports.run = exports.loop = exports.sequence = exports.mergeAll = exports.merge = exports.unit = exports.directions = exports.easings = exports.TweenPair = exports.Tween = void 0;
var noop = function () { };
var easings = {
    LINEAR: function (x) { return x; },
    SQUARED: function (x) { return Math.pow(x, 2); },
    CUBIC: function (x) { return Math.pow(x, 3); },
    QUART: function (x) { return Math.pow(x, 4); },
    EASE_OUT_QUART: function (x) { return 1 - Math.pow(1 - x, 4); },
    QUINT: function (x) { return Math.pow(x, 5); },
    EASE_OUT_QUINT: function (x) { return 1 - Math.pow(1 - x, 5); },
    EASE_IN_OUT_QUINT: function (x) { return x < 0.5 ? 16 * Math.pow(x, 5) : 1 - Math.pow(-2 * x + 2, 5) / 2; },
    EASE_IN_ELASTIC: function (x) {
        return Math.sin(((x - 1) - 0.3 / 4) * (2 * Math.PI) / 0.3) * -(Math.pow(2, 10 * (x - 1)));
    },
    EASE_OUT_ELASTIC: function (x) {
        return Math.pow(2, -10 * x) * Math.sin((x - 0.3 / 4) * (2 * Math.PI) / 0.3) + 1;
    },
    SINE: function (x) { return Math.sin(x * Math.PI); }
};
exports.easings = easings;
var directions;
(function (directions) {
    directions[directions["FORWARD"] = 0] = "FORWARD";
    directions[directions["BACKWARD"] = 1] = "BACKWARD";
    directions[directions["ALTERNATE"] = 2] = "ALTERNATE";
})(directions || (directions = {}));
exports.directions = directions;
var Tween = /** @class */ (function () {
    function Tween(options) {
        if (options === void 0) { options = {}; }
        this.completed = false;
        this.count = 0;
        this.delta = 0;
        this.begun = false;
        var _a = options.iterations, iterations = _a === void 0 ? 1 : _a, _b = options.direction, direction = _b === void 0 ? directions.FORWARD : _b, _c = options.from, from = _c === void 0 ? 0 : _c, _d = options.to, to = _d === void 0 ? 1 : _d, _e = options.delay, delay = _e === void 0 ? 0 : _e, _f = options.duration, duration = _f === void 0 ? 200 : _f, _g = options.ease, ease = _g === void 0 ? easings.LINEAR : _g, _h = options.begin, begin = _h === void 0 ? noop : _h, _j = options.update, update = _j === void 0 ? noop : _j, _k = options.complete, complete = _k === void 0 ? noop : _k, _l = options.change, change = _l === void 0 ? noop : _l, _m = options.loop, loop = _m === void 0 ? noop : _m, _o = options.meta, meta = _o === void 0 ? {} : _o;
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
    Tween.prototype.tick = function (elapsed) {
        // calculate elapsed using delay offset
        elapsed -= this.delay;
        if (elapsed < 0) // it isn't our time yet
            return;
        else if (!this.begun) {
            this.begun = true;
            this.begin(this.meta);
        }
        var progress = Math.min((elapsed - (this.duration * this.count)) / this.duration, 1);
        var value;
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
            }
            else {
                this.complete(value, this.meta);
                this.change(value, this.meta);
                this.completed = true;
            }
        }
        else {
            this.update(value, this.meta);
            this.change(value, this.meta);
        }
    };
    Tween.prototype.reset = function () {
        this.completed = false;
        this.count = 0;
        this.begun = false;
    };
    return Tween;
}());
exports.Tween = Tween;
var TweenPair = /** @class */ (function (_super) {
    __extends(TweenPair, _super);
    function TweenPair(a, b, opts) {
        var _this = _super.call(this, opts) || this;
        _this.a = a;
        _this.b = b;
        var totalDurationA = a.duration + a.delay;
        var totalDurationB = b.duration + b.delay;
        _this.duration = Math.max(totalDurationA, totalDurationB);
        return _this;
    }
    TweenPair.prototype.tick = function (elapsed) {
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
    };
    TweenPair.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.a.reset();
        this.b.reset();
    };
    return TweenPair;
}(Tween));
exports.TweenPair = TweenPair;
var Loop = /** @class */ (function (_super) {
    __extends(Loop, _super);
    function Loop(t, iterations) {
        var _this = _super.call(this, { iterations: iterations }) || this;
        _this.tick = function (elapsed) {
            elapsed -= _this.count * _this.t.duration;
            if (!_this.t.completed)
                _this.t.tick(elapsed);
            if (_this.t.completed) {
                if (_this.iterations > _this.count) {
                    _this.t.reset();
                    _this.count++;
                }
                else
                    _this.completed = true;
            }
        };
        _this.t = t;
        return _this;
    }
    return Loop;
}(Tween));
var loop = function (tween, iterations) { return (new Loop(tween, iterations)); };
exports.loop = loop;
var Subscription = /** @class */ (function () {
    function Subscription() {
        var _this = this;
        this.id = 0;
        this.unsubscribe = function () { return cancelAnimationFrame(_this.id); };
    }
    return Subscription;
}());
var unit = function (options) { return (new Tween(options)); };
exports.unit = unit;
var merge = function (a, b) { return (new TweenPair(a, b)); };
exports.merge = merge;
var mergeAll = function (ts) { return ts.reduce(function (acc, cur) { return merge(acc, cur); }); };
exports.mergeAll = mergeAll;
var sequence = function (ts) { return mergeAll(ts.map(function (t, i) {
    if (i === 0)
        return t;
    t.delay += ts[i - 1].delay + ts[i - 1].duration;
    return t;
})); };
exports.sequence = sequence;
function run(tween, dependencies) {
    if (dependencies === void 0) { dependencies = {}; }
    var _a = Object.assign({
        now: (typeof window !== 'undefined') ? performance.now.bind(performance) : null,
        requestFrame: (typeof window !== 'undefined') ? requestAnimationFrame : null
    }, dependencies), now = _a.now, requestFrame = _a.requestFrame;
    tween.reset();
    var startTime = now();
    var subscription = new Subscription();
    var tick = function (currentTime) {
        var elapsed = Math.max(0, currentTime - startTime);
        tween.tick(elapsed);
        if (!tween.completed)
            subscription.id = requestFrame(tick);
    };
    subscription.id = requestFrame(tick);
    return subscription;
}
exports.run = run;
// transform utils
var computeTransform = function (target, transform) { return (target.split(' ')
    .filter(function (a) {
    var foundMatch = transform.split(' ').findIndex(function (b) { return (a.split('(')[0] === b.split('(')[0]); });
    // if we find a match we want to return false
    // so that the transform function gets filtered out
    return foundMatch < 0;
})
    .concat([transform])
    .join(" ")); };
exports.computeTransform = computeTransform;
// interpolation utils
var interpolate = function (progress, from, to) { return (from + ((to - from) * progress)); };
exports.interpolate = interpolate;
var interpolateArray = function (progress, from, to) { return (from.map(function (a, i) { return interpolate(progress, a, to[i]); })); };
exports.interpolateArray = interpolateArray;
var getPathFromSource = function (src) {
    var re = /[a-zA-Z]+/g;
    var prevIndex = 0;
    var match = re.exec(src);
    var ret = [];
    while ((match = re.exec(src)) !== null) {
        ret[ret.length] = __spreadArray([src[prevIndex]], src.slice(prevIndex + 1, match.index).trim().split(' '));
        prevIndex = match.index;
    }
    ret[ret.length] = [src[prevIndex]];
    return ret;
};
var interpolatePath = function (progress, s1, s2) {
    var p1 = getPathFromSource(s1);
    var p2 = getPathFromSource(s2);
    return p1.map(function (a, i) {
        var b = p2[i];
        var cmd = a[0];
        return cmd + " " + interpolateArray(progress, a.slice(1).map(Number), b.slice(1).map(Number));
    }).join(' ');
};
exports.interpolatePath = interpolatePath;
