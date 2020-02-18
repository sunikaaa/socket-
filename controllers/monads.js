class Maybe {
  static just(a) {
    return new Just(a);
  }

  static nothing() {
    return new Nothing();
  }

  static fromNullable(...a) {
    let isNull = a.some(value => value === null || value === undefined)
    return !isNull ? Maybe.just(...a) : Maybe.nothing();
  }

  static of (a) {
    return Just(a);
  }

  get isNothing() {
    return false
  }

  get isJust() {
    return false;
  }

}

const Just = class extends Maybe {
  constructor(value) {
    super();
    this._value = value;
  }

  get value() {
    return this._value;
  }

  map(f) {
    return Maybe.fromNullable(f(this._value));
  }

  getOrElse(_) {
    return f(this._value);
  }

  orElse(_) {
    return this;
  }

  chain(f) {
    return f(this._value);
  }

  toString() {
    return `Maybe.just(${this._value})`
  }

  Log() {
    console.log(this._value)
    return this;
  }

}

const Nothing = class extends Maybe {
  map(f) {
    return this
  }

  Log() {
    console.log(this._value)
    return this;
  }

  get value() {
    throw new TypeError("Can't extend the value of a Nothing.");
  }

  getOrElse(other) {
    return other
  }

  orElse(_) {
    return this
  }

  filter(f) {
    return this
  }

  chain(f) {
    return this;
  }

  toString() {
    return 'Maybe Nothing';
  }
}

class Either {
  constructor(...value) {
    this._value = value
  }

  get value() {
    return this._value
  }

  static left(a) {
    return new Left(a);
  }

  static right(a) {
    return new Right(a);
  }

  static fromNullable(val) {
    return val !== null && val !== undefined ? Either.right(val) : Either.left(val);
  }

  static of (a) {
    return Either.right(a);
  }
  Log() {
    console.log(this._value)
    return this._value;
  }
}

class Left extends Either {
  map(_) {
    return this;
  }

  get value() {
    return new TypeError("Can't extract the Value of a Left(a)");
  }

  getOrElse(other) {
    return other;
  }

  orElse(f) {
    return f(this._value)
  }

  chain(f) {
    return this;
  }

  getOrElseThrow(a) {
    throw new Error(a);
  }

  filter(a) {
    return this;
  }

  toString() {
    console.log('this is lett')
    return `Either.Left(${this._value})`;
  }
}

class Right extends Either {
  map(f) {
    return Either.of(f(this._value));
  }

  get value() {
    return this._value;
  }

  getOrElse(other) {
    return this._value;
  }

  orElse(_) {
    return this;
  }

  chain(f) {
    return f(this._value);
  }
  getOrElseThrow(_) {
    return this._value;
  }
  filter(f) {
    return Either.fromNullable(f(this._value ? this._value : null));
  }

  toString() {
    return `Either.Right(${this._value})`;
  }
}

class IO {
  constructor(effect) {
    if (!_.isFunction(effect)) {
      throw 'IO Usage: function required'
    }
    this.effect = effect
  }

  static of (a) {
    return new IO(() => a);
  }

  static from(fn) {
    return new IO(fn)
  }

  map(fn) {
    const self = this;
    return new IO(() => fn(self.effect()));
  }

  chain(fn) {
    return fn((this.effect()));
  }

  run() {
    return this.effect();
  }
}

exports.Either = Either;
exports.Right = Right;
exports.Left = Left;
exports.Maybe = Maybe;
exports.IO = IO;
