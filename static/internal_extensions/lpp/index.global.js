// Name: lpp Beta
// ID: lpp
// Description: A high-level programming language based on Scratch.
// By: FurryR <https://scratch.mit.edu/users/FurryR/>
// License: LGPL-3.0
"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/core/index.ts
  var core_exports = {};
  __export(core_exports, {
    Global: () => Global,
    LppArray: () => LppArray,
    LppAsyncFunctionContext: () => LppAsyncFunctionContext,
    LppClosure: () => LppClosure,
    LppConstant: () => LppConstant,
    LppContext: () => LppContext,
    LppError: () => LppError,
    LppException: () => LppException,
    LppFunction: () => LppFunction,
    LppFunctionContext: () => LppFunctionContext,
    LppHandle: () => LppHandle,
    LppObject: () => LppObject,
    LppPromise: () => LppPromise,
    LppReference: () => LppReference,
    LppReturn: () => LppReturn,
    LppTraceback: () => LppTraceback,
    LppValue: () => LppValue,
    asBoolean: () => asBoolean,
    asValue: () => asValue,
    async: () => async,
    ffi: () => ffi_exports,
    isPromise: () => isPromise,
    raise: () => raise
  });

  // src/core/type/base.ts
  var LppError = class extends Error {
    /**
     * Construct a new Lpp error.
     * @param id Error ID.
     */
    constructor(id) {
      super(`lpp: Error ${id}`);
      this.id = id;
    }
  };
  var LppValue = class {
  };

  // src/core/helper/cast.ts
  function asValue(obj) {
    return obj instanceof LppReference ? obj.value : obj;
  }
  function asBoolean(value) {
    if (value instanceof LppConstant) {
      if (value.value === null)
        return false;
      switch (typeof value.value) {
        case "number":
          return value.value !== 0;
        case "boolean":
          return value.value;
        case "string":
          return value.value.length !== 0;
      }
      return false;
    } else if (value instanceof LppArray) {
      return value.value.length !== 0;
    } else if (value instanceof LppObject) {
      return value.value.size !== 0;
    } else if (value instanceof LppFunction) {
      return true;
    }
    return false;
  }

  // src/core/helper/promise.ts
  function isPromise(value) {
    return typeof value === "object" && value !== null && typeof value.then === "function";
  }
  function async(fn, ...args) {
    const generator = fn(...args);
    function next(v) {
      const res = generator.next(v);
      if (isPromise(res.value)) {
        return res.done ? res.value : res.value.then((v2) => next(v2));
      }
      return res.done ? res.value : next(res.value);
    }
    return next();
  }

  // src/core/helper/math.ts
  function mathOp(lhs, op, rhs) {
    if (!(lhs instanceof LppConstant && rhs instanceof LppConstant))
      return NaN;
    const left = typeof lhs.value === "boolean" ? +lhs.value : lhs.value;
    const right = typeof rhs.value === "boolean" ? +rhs.value : rhs.value;
    const math = /* @__PURE__ */ new Map([
      ["+", (a, b) => a + b],
      ["-", (a, b) => a - b],
      ["*", (a, b) => a * b],
      ["**", (a, b) => a ** b],
      ["/", (a, b) => a / b],
      ["<<", (a, b) => a << b],
      [">>", (a, b) => a >> b],
      [">>>", (a, b) => a >>> b],
      ["&", (a, b) => a & b],
      ["|", (a, b) => a | b],
      ["^", (a, b) => a ^ b]
    ]);
    const fn = math.get(op);
    if (!fn)
      throw new Error("lpp: not implemented");
    return fn(left, right);
  }
  function equal(lhs, rhs) {
    if (lhs instanceof LppConstant && rhs instanceof LppConstant)
      return lhs.value === rhs.value;
    return lhs === rhs;
  }
  function compare(lhs, op, rhs) {
    function compareInternal(fn2, lhs2, rhs2) {
      if (lhs2 instanceof LppConstant) {
        if (rhs2 instanceof LppConstant) {
          if (lhs2.value === null || rhs2.value === null)
            return false;
          switch (typeof lhs2.value) {
            case "boolean": {
              switch (typeof rhs2.value) {
                case "boolean": {
                  return fn2(+lhs2.value, +rhs2.value);
                }
                case "number": {
                  return fn2(+lhs2.value, rhs2.value);
                }
                case "string": {
                  return fn2(+lhs2.value, rhs2.value.length ? 1 : 0);
                }
                default:
                  throw new Error("lpp: unknown rhs");
              }
            }
            case "number": {
              switch (typeof rhs2.value) {
                case "boolean": {
                  return fn2(lhs2.value, +rhs2.value);
                }
                case "number": {
                  return fn2(lhs2.value, rhs2.value);
                }
                case "string": {
                  return fn2(lhs2.value ? 1 : 0, rhs2.value.length ? 1 : 0);
                }
                default:
                  throw new Error("lpp: unknown rhs");
              }
            }
            case "string": {
              switch (typeof rhs2.value) {
                case "boolean": {
                  return fn2(lhs2.value.length ? 1 : 0, +rhs2.value);
                }
                case "number": {
                  return fn2(lhs2.value.length ? 1 : 0, rhs2.value ? 1 : 0);
                }
                case "string": {
                  return fn2(lhs2.value, rhs2.value);
                }
                default:
                  throw new Error("lpp: unknown rhs");
              }
            }
            default:
              throw new Error("lpp: unknown lhs");
          }
        }
        return compareInternal(fn2, lhs2, new LppConstant(asBoolean(rhs2)));
      }
      return compareInternal(fn2, new LppConstant(asBoolean(lhs2)), rhs2);
    }
    const math = /* @__PURE__ */ new Map([
      [">", (a, b) => a > b],
      ["<", (a, b) => a < b],
      [">=", (a, b) => a >= b],
      ["<=", (a, b) => a <= b]
    ]);
    const fn = math.get(op);
    if (!fn)
      throw new Error("lpp: not implemented");
    return compareInternal(fn, lhs, rhs);
  }

  // src/core/helper/index.ts
  function processThenReturn(returnValue, resolve, reject) {
    if (returnValue instanceof LppReturn) {
      const value = returnValue.value;
      if (!(value instanceof LppConstant) || value.value !== null) {
        const then = asValue(value.get("then"));
        if (then instanceof LppFunction) {
          return async(function* () {
            const res = yield then.apply(value, [
              new LppFunction(({ args }) => {
                return async(function* () {
                  yield processThenReturn(
                    new LppReturn(args[0] ?? new LppConstant(null)),
                    resolve,
                    reject
                  );
                  return new LppReturn(new LppConstant(null));
                });
              }),
              new LppFunction(({ args }) => {
                reject(args[0] ?? new LppConstant(null));
                return new LppReturn(new LppConstant(null));
              })
            ]);
            return res instanceof LppException ? void reject(res.value) : void 0;
          });
        }
      }
      return void resolve(returnValue.value);
    }
    return void reject(returnValue.value);
  }
  function raise(res) {
    return res instanceof LppException ? res : new LppException(res.value);
  }

  // src/core/helper/prototype.ts
  function lookupPrototype(proto, name) {
    const cache = /* @__PURE__ */ new WeakSet();
    function lookupPrototypeInternal(proto2, name2) {
      if (proto2 instanceof LppObject) {
        const res = proto2.value.get(name2);
        if (res) {
          return res;
        } else {
          const v = proto2.value.get("prototype");
          if (v instanceof LppObject) {
            if (cache.has(v))
              throw new LppError("recursivePrototype");
            else
              cache.add(v);
            return lookupPrototype(v, name2);
          }
        }
      }
      return null;
    }
    return lookupPrototypeInternal(proto, name);
  }
  function comparePrototype(prototype1, prototype2) {
    if (prototype1 === prototype2)
      return true;
    if (prototype1.value.has("prototype")) {
      const v = prototype1.value.get("prototype");
      if (v instanceof LppObject)
        return comparePrototype(v, prototype2);
    }
    return false;
  }

  // src/core/type/object.ts
  var LppObject = class _LppObject extends LppValue {
    /**
     * Construct a object value.
     * @param value Object content.
     * @param constructor Constructor function. Defaults to Object.
     */
    constructor(value = /* @__PURE__ */ new Map(), constructor) {
      super();
      this.value = value;
      this.value = value ?? /* @__PURE__ */ new Map();
      if (constructor)
        this.value.set("constructor", constructor);
    }
    /**
     * Get a value.
     * @param key Value to get.
     * @returns Child object.
     */
    get(key) {
      if (key === "constructor") {
        return this.value.get(key) ?? global_default.Object;
      } else {
        const res = this.value.get(key);
        if (res || key == "prototype")
          return new LppReference(this, key, res ?? new LppConstant(null));
        const constructor = asValue(this.get("constructor"));
        if (!(constructor instanceof LppFunction))
          throw new Error(
            "lpp: unexpected constructor -- must be a LppFunction instance"
          );
        const proto = asValue(constructor.get("prototype"));
        if (!(proto instanceof _LppObject))
          throw new Error(
            "lpp: unexpected prototype -- must be a LppObject instance"
          );
        const member = lookupPrototype(proto, key);
        if (member === null)
          return new LppReference(this, key, new LppConstant(null));
        return new LppReference(this, key, member);
      }
    }
    /**
     * Set a value.
     * @param key Key to set.
     * @param value Value to set.
     * @returns Value.
     */
    set(key, value) {
      this.value.set(key, value);
      return new LppReference(this, key, value);
    }
    /**
     * Detect whether a value exists.
     * @param key Key to detect.
     * @returns Whether the value exists.
     */
    has(key) {
      if (key === "constructor" || this.value.has(key))
        return true;
      const constructor = asValue(this.get("constructor"));
      if (!(constructor instanceof LppFunction))
        throw new Error(
          "lpp: unexpected constructor -- must be a LppFunction instance"
        );
      const proto = asValue(constructor.get("prototype"));
      if (!(proto instanceof _LppObject))
        throw new Error(
          "lpp: unexpected prototype -- must be a LppObject instance"
        );
      return lookupPrototype(proto, key) !== null;
    }
    /**
     * Delete a value from the object.
     * @param key Key to delete.
     * @returns Whether the value exists.
     */
    delete(key) {
      return this.value.delete(key);
    }
    /**
     * Detect whether a value is constructed from fn.
     * @param fn Function.
     * @returns Whether the value is constructed from fn.
     */
    instanceof(fn) {
      const constructor = this.get("constructor");
      const prototype1 = asValue(constructor.get("prototype"));
      const prototype2 = asValue(fn.get("prototype"));
      if (prototype1 instanceof _LppObject && prototype2 instanceof _LppObject)
        return comparePrototype(prototype1, prototype2);
      return false;
    }
    /**
     * @returns toString for visualReport.
     */
    toString() {
      return "<Lpp Object>";
    }
    /**
     * Do arithmetic operations.
     * @param op Binary operator.
     * @param rhs Right hand side of the operation.
     */
    calc(op, rhs) {
      if (rhs) {
        switch (op) {
          case "=": {
            throw new LppError("assignOfConstant");
          }
          case "+": {
            if (rhs instanceof _LppObject && !(rhs instanceof LppFunction)) {
              if (this.value.has("constructor") || rhs.value.has("constructor")) {
                return new LppConstant(NaN);
              }
              const ret = new _LppObject();
              for (const [key, value] of this.value.entries()) {
                ret.set(key, value);
              }
              for (const [key, value] of rhs.value.entries()) {
                ret.set(key, value);
              }
              return ret;
            }
            return new LppConstant(NaN);
          }
          case "==": {
            return new LppConstant(equal(this, rhs));
          }
          case "!=": {
            return new LppConstant(!equal(this, rhs));
          }
          case ">":
          case "<":
          case ">=":
          case "<=": {
            return new LppConstant(compare(this, op, rhs));
          }
          case "&&":
          case "||": {
            const left = asBoolean(this);
            const right = asBoolean(rhs);
            return new LppConstant(op === "&&" ? left && right : left || right);
          }
          case "instanceof": {
            if (rhs instanceof LppFunction) {
              return new LppConstant(this.instanceof(rhs));
            }
            throw new LppError("notCallable");
          }
          case "*":
          case "**":
          case "-":
          case "/":
          case "%":
          case "<<":
          case ">>":
          case ">>>":
          case "&":
          case "|":
          case "^": {
            return new LppConstant(NaN);
          }
        }
      } else {
        switch (op) {
          case "delete": {
            throw new LppError("assignOfConstant");
          }
          case "!": {
            return new LppConstant(!asBoolean(this));
          }
          case "+":
          case "-":
          case "~": {
            return new LppConstant(NaN);
          }
        }
      }
      throw new Error("lpp: unknown operand");
    }
  };

  // src/core/type/promise.ts
  var LppPromise = class _LppPromise extends LppObject {
    constructor(pm) {
      super(/* @__PURE__ */ new Map(), global_default.Promise);
      this.pm = pm;
    }
    /**
     * then() function.
     * @param resolveFn
     * @param rejectFn
     * @returns
     */
    done(resolveFn, rejectFn) {
      return _LppPromise.generate((resolve, reject) => {
        this.pm.then(
          (value) => {
            if (value instanceof LppValue) {
              if (resolveFn) {
                return async(function* () {
                  return processThenReturn(
                    yield resolveFn.apply(this, [value]),
                    resolve,
                    reject
                  );
                }.bind(this));
              } else {
                return processThenReturn(new LppReturn(value), resolve, reject);
              }
            }
            throw new Error("lpp: unknown result");
          },
          (err) => {
            if (err instanceof LppValue) {
              if (rejectFn) {
                return async(function* () {
                  return processThenReturn(
                    yield rejectFn.apply(this, [err]),
                    resolve,
                    reject
                  );
                }.bind(this));
              } else {
                return reject(err);
              }
            }
            throw err;
          }
        );
        return void 0;
      });
    }
    /**
     * catch() function.
     * @param rejectFn
     * @returns
     */
    error(rejectFn) {
      return _LppPromise.generate((resolve, reject) => {
        this.pm.catch((err) => {
          if (err instanceof LppValue) {
            return async(function* () {
              return processThenReturn(
                yield rejectFn.apply(this, [err]),
                resolve,
                reject
              );
            }.bind(this));
          }
          throw err;
        });
        return void 0;
      });
    }
    static generate(fn) {
      let resolveFn;
      let rejectFn;
      resolveFn = rejectFn = () => {
        throw new Error("not initialized");
      };
      const pm = new Promise((resolve, reject) => {
        resolveFn = resolve;
        rejectFn = reject;
      });
      return async(function* () {
        yield fn(resolveFn, rejectFn);
        return new _LppPromise(pm);
      });
    }
  };

  // src/core/type/function.ts
  var LppHandle = class {
    constructor(fn, self, args) {
      this.fn = fn;
      this.self = self;
      this.args = args;
    }
  };
  var LppFunction = class _LppFunction extends LppObject {
    /**
     * Construct a function object.
     * @warning Do not use this function directly unless you know what you are doing! Use LppFunction.native instead.
     * @param caller Function to execute.
     * @param prototype Function prototype.
     */
    constructor(caller, prototype = new LppObject()) {
      super(/* @__PURE__ */ new Map(), void 0);
      this.caller = caller;
      this.value.set("prototype", prototype);
    }
    /**
     * Construct a native function.
     * @param caller Function to execute.
     * @param prototype Function prototype.
     * @returns Constructed function.
     */
    static native(caller, prototype) {
      function addNativeTraceback(exception, ctx) {
        if (exception instanceof LppException)
          exception.pushStack(
            new LppTraceback.NativeFn(ctx.fn, ctx.self, ctx.args)
          );
        return exception;
      }
      return new _LppFunction((ctx) => {
        return async(function* () {
          return addNativeTraceback(yield caller(ctx), ctx);
        });
      }, prototype);
    }
    /**
     * Get a value.
     * @param key Value to get.
     * @returns Child object.
     */
    get(key) {
      if (key === "constructor") {
        return global_default.Function;
      } else if (key === "prototype") {
        const res = this.value.get(key);
        if (res)
          return res;
        else
          throw new Error("lpp: unexpected get -- prototype is null");
      } else {
        const res = this.value.get(key);
        if (res)
          return new LppReference(this, key, res);
        const constructor = asValue(this.get("constructor"));
        if (!(constructor instanceof _LppFunction))
          throw new Error(
            "lpp: unexpected constructor -- must be a LppFunction instance"
          );
        const proto = asValue(constructor.get("prototype"));
        if (!(proto instanceof LppObject))
          throw new Error(
            "lpp: unexpected prototype -- must be a LppObject instance"
          );
        const member = lookupPrototype(proto, key);
        if (member === null)
          return new LppReference(this, key, new LppConstant(null));
        return new LppReference(this, key, member);
      }
    }
    /**
     * Set a value.
     * @param key Key to set.
     * @param value Value to set.
     * @returns Value.
     */
    set(key, value) {
      this.value.set(key, value);
      return new LppReference(this, key, value);
    }
    /**
     * Detect whether a value exists.
     * @param key Key to detect.
     * @returns Whether the value exists.
     */
    has(key) {
      if (key === "constructor" || this.value.has(key))
        return true;
      const constructor = asValue(this.get("constructor"));
      if (!(constructor instanceof _LppFunction))
        throw new Error(
          "lpp: unexpected constructor -- must be a LppFunction instance"
        );
      const proto = asValue(constructor.get("prototype"));
      if (!(proto instanceof LppObject))
        throw new Error(
          "lpp: unexpected prototype -- must be a LppObject instance"
        );
      return lookupPrototype(proto, key) !== null;
    }
    /**
     * Delete a value from the object.
     * @param key Key to delete.
     * @returns Whether the value exists.
     */
    delete(key) {
      if (key === "prototype") {
        throw new LppError("assignOfConstant");
      }
      return this.value.delete(key);
    }
    /**
     * Call function with arguments.
     * @param self Function self object. Might be null.
     * @param args Function arguments.
     * @returns Return value.
     */
    apply(self, args) {
      return this.caller(new LppHandle(this, self, args));
    }
    /**
     * Do arithmetic operations.
     * @param op Binary operator.
     * @param rhs Right hand side of the operation.
     */
    calc(op, rhs) {
      if (rhs) {
        switch (op) {
          case "=": {
            throw new LppError("assignOfConstant");
          }
          case "==": {
            return new LppConstant(equal(this, rhs));
          }
          case "!=": {
            return new LppConstant(!equal(this, rhs));
          }
          case ">":
          case "<":
          case ">=":
          case "<=": {
            return new LppConstant(compare(this, op, rhs));
          }
          case "&&":
          case "||": {
            const left = asBoolean(this);
            const right = asBoolean(rhs);
            return new LppConstant(op === "&&" ? left && right : left || right);
          }
          case "instanceof": {
            if (rhs instanceof _LppFunction) {
              return new LppConstant(this.instanceof(rhs));
            }
            throw new LppError("notCallable");
          }
          case "+":
          case "*":
          case "**":
          case "-":
          case "/":
          case "%":
          case "<<":
          case ">>":
          case ">>>":
          case "&":
          case "|":
          case "^": {
            return new LppConstant(NaN);
          }
        }
      } else {
        switch (op) {
          case "delete": {
            throw new LppError("assignOfConstant");
          }
          case "!": {
            return new LppConstant(!asBoolean(this));
          }
          case "+":
          case "-":
          case "~": {
            return new LppConstant(NaN);
          }
        }
      }
      throw new Error("lpp: unknown operand");
    }
    /**
     * Call function as a constructor.
     * @param args Function arguments.
     * @returns Return value.
     */
    construct(args) {
      if (this === global_default.Number || this === global_default.String || this === global_default.Boolean || this === global_default.Array || this === global_default.Function || this === global_default.Object)
        return this.apply(new LppConstant(null), args);
      const obj = this === global_default.Promise ? new LppPromise(new Promise(() => {
      })) : new LppObject(/* @__PURE__ */ new Map(), this);
      return async(function* () {
        const result = yield this.apply(obj, args);
        if (result instanceof LppException)
          return result;
        return new LppReturn(obj);
      }.bind(this));
    }
    /**
     * @returns toString for visualReport.
     */
    toString() {
      return "<Lpp Function>";
    }
  };

  // src/core/type/array.ts
  var LppArray = class _LppArray extends LppValue {
    /**
     * Construct an array object.
     * @param value Array of values.
     */
    constructor(value = []) {
      super();
      this.value = value;
    }
    /**
     * Get a value.
     * @param key Value to get.
     * @returns Child object.
     */
    get(key) {
      if (key === "constructor") {
        return global_default.Array;
      } else {
        const idx = parseInt(key, 10);
        if (idx >= 0) {
          const res = this.value[idx];
          if (res)
            return new LppReference(this, key, res);
          else
            return new LppReference(this, key, new LppConstant(null));
        } else {
          const constructor = asValue(this.get("constructor"));
          if (!(constructor instanceof LppFunction))
            throw new Error(
              "lpp: unexpected constructor -- must be a LppFunction instance"
            );
          const proto = asValue(constructor.get("prototype"));
          if (!(proto instanceof LppObject))
            throw new Error(
              "lpp: unexpected prototype -- must be a LppObject instance"
            );
          const member = lookupPrototype(proto, key);
          if (member === null)
            throw new LppError("invalidIndex");
          return new LppReference(this, key, member);
        }
      }
    }
    /**
     * Set a value.
     * @param key Key to set.
     * @param value Value to set.
     * @returns Value.
     */
    set(key, value) {
      const idx = parseInt(key, 10);
      if (idx >= 0) {
        this.value[idx] = value;
        return new LppReference(this, key, value);
      } else
        throw new LppError("invalidIndex");
    }
    /**
     * Detect whether a value exists.
     * @param key Key to detect.
     * @returns Whether the value exists.
     */
    has(key) {
      if (key === "constructor")
        return true;
      const idx = parseInt(key, 10);
      if (idx >= 0 && idx in this.value)
        return true;
      const constructor = asValue(this.get("constructor"));
      if (!(constructor instanceof LppFunction))
        throw new Error(
          "lpp: unexpected constructor -- must be a LppFunction instance"
        );
      const proto = asValue(constructor.get("prototype"));
      if (!(proto instanceof LppObject))
        throw new Error(
          "lpp: unexpected prototype -- must be a LppObject instance"
        );
      return lookupPrototype(proto, key) !== null;
    }
    /**
     * Delete a value from the object.
     * @param key Key to delete.
     * @returns Whether the value exists.
     */
    delete(key) {
      const idx = parseInt(key, 10);
      if (idx >= 0 && idx in this.value) {
        delete this.value[idx];
        return true;
      }
      return false;
    }
    /**
     * Detect whether a value is constructed from fn.
     * @param fn Function.
     * @returns Whether the value is constructed from fn.
     */
    instanceof(fn) {
      return fn === global_default.Array;
    }
    /**
     * @returns toString for visualReport.
     */
    toString() {
      return "<Lpp Array>";
    }
    /**
     * Do arithmetic operations.
     * @param op Binary operator.
     * @param rhs Right hand side of the operation.
     */
    calc(op, rhs) {
      if (rhs) {
        switch (op) {
          case "=": {
            throw new LppError("assignOfConstant");
          }
          case "+": {
            if (rhs instanceof _LppArray) {
              return new _LppArray(this.value.concat(rhs.value));
            }
            return new LppConstant(NaN);
          }
          case "*": {
            if (rhs instanceof LppConstant && (typeof rhs.value === "boolean" || typeof rhs.value === "number")) {
              const time = typeof rhs.value === "boolean" ? +rhs.value : rhs.value;
              if (Number.isInteger(time)) {
                const ret = new _LppArray();
                for (let i = 0; i < time; i++) {
                  ret.value = ret.value.concat(this.value);
                }
                return ret;
              }
            }
            return new LppConstant(NaN);
          }
          case "==": {
            return new LppConstant(equal(this, rhs));
          }
          case "!=": {
            return new LppConstant(!equal(this, rhs));
          }
          case ">":
          case "<":
          case ">=":
          case "<=": {
            return new LppConstant(compare(this, op, rhs));
          }
          case "&&":
          case "||": {
            const left = asBoolean(this);
            const right = asBoolean(rhs);
            return new LppConstant(op === "&&" ? left && right : left || right);
          }
          case "instanceof": {
            if (rhs instanceof LppFunction) {
              return new LppConstant(this.instanceof(rhs));
            }
            throw new LppError("notCallable");
          }
          case "-":
          case "**":
          case "/":
          case "%":
          case "<<":
          case ">>":
          case ">>>":
          case "&":
          case "|":
          case "^": {
            return new LppConstant(NaN);
          }
        }
      } else {
        switch (op) {
          case "delete": {
            throw new LppError("assignOfConstant");
          }
          case "!": {
            return new LppConstant(!asBoolean(this));
          }
          case "+":
          case "-":
          case "~": {
            return new LppConstant(NaN);
          }
        }
      }
      throw new Error("lpp: unknown operand");
    }
  };

  // src/core/type/constant.ts
  var LppConstant = class _LppConstant extends LppValue {
    /**
     * Construct a value.
     * @param _value The stored value.
     */
    constructor(_value) {
      super();
      this._value = _value;
    }
    /**
     * @returns The stored value.
     */
    get value() {
      return this._value;
    }
    /**
     * Get a value.
     * @param key Value to get.
     * @returns Child object.
     */
    get(key) {
      if (this.value === null)
        throw new LppError("accessOfNull");
      if (key === "constructor") {
        switch (typeof this.value) {
          case "string":
            return global_default.String;
          case "number":
            return global_default.Number;
          case "boolean":
            return global_default.Boolean;
        }
      } else if (key === "prototype") {
        return new _LppConstant(null);
      } else {
        if (typeof this.value === "string") {
          const idx = parseInt(key);
          if (!isNaN(idx)) {
            const v = this.value[idx];
            return v !== void 0 ? new _LppConstant(v) : new _LppConstant(null);
          }
        }
        const constructor = asValue(this.get("constructor"));
        if (!(constructor instanceof LppFunction))
          throw new Error(
            "lpp: unexpected constructor -- must be a LppFunction instance"
          );
        const proto = asValue(constructor.get("prototype"));
        if (!(proto instanceof LppObject))
          throw new Error(
            "lpp: unexpected prototype -- must be a LppObject instance"
          );
        const member = lookupPrototype(proto, key);
        if (member === null)
          return new _LppConstant(null);
        return new LppReference(this, key, member);
      }
    }
    /**
     * LppConstant instances are not able to set properties.
     */
    set() {
      throw new LppError("assignOfConstant");
    }
    /**
     * Detect whether a value exists.
     * @param key Key to detect.
     * @returns Whether the value exists.
     */
    has(key) {
      if (this.value === null)
        throw new LppError("accessOfNull");
      if (key === "constructor")
        return true;
      const constructor = asValue(this.get("constructor"));
      if (!(constructor instanceof LppFunction))
        throw new Error(
          "lpp: unexpected constructor -- must be a LppFunction instance"
        );
      const proto = asValue(constructor.get("prototype"));
      if (!(proto instanceof LppObject))
        throw new Error(
          "lpp: unexpected prototype -- must be a LppObject instance"
        );
      return lookupPrototype(proto, key) !== null;
    }
    /**
     * LppConstant instances are not able to set properties.
     */
    delete() {
      if (this.value === null)
        throw new LppError("accessOfNull");
      throw new LppError("assignOfConstant");
    }
    /**
     * Detect whether a value is constructed from fn.
     * @param fn Function.
     * @returns Whether the value is constructed from fn.
     */
    instanceof(fn) {
      if (this.value === null)
        return false;
      switch (typeof this.value) {
        case "string":
          return fn === global_default.String;
        case "number":
          return fn === global_default.Number;
        case "boolean":
          return fn === global_default.Boolean;
      }
    }
    /**
     * toString for visualReport.
     * @returns Human readable string.
     */
    toString() {
      return `${this.value}`;
    }
    /**
     * Do arithmetic operations.
     * @param op Binary operator.
     * @param rhs Right hand side of the operation.
     */
    calc(op, rhs) {
      if (rhs) {
        switch (op) {
          case "=": {
            throw new LppError("assignOfConstant");
          }
          case "+": {
            if (this.value !== null) {
              if (rhs instanceof _LppConstant) {
                if (rhs.value !== null)
                  return new _LppConstant(mathOp(this, op, rhs));
              }
            }
            return new _LppConstant(NaN);
          }
          case "*": {
            if (this.value !== null) {
              if (rhs instanceof _LppConstant) {
                if (typeof this.value === "string" && typeof rhs.value === "number") {
                  if (Number.isInteger(rhs.value))
                    return new _LppConstant(this.value.repeat(rhs.value));
                } else if (typeof this.value === "number" && typeof rhs.value === "string") {
                  if (Number.isInteger(this.value))
                    return new _LppConstant(rhs.value.repeat(this.value));
                }
                return new _LppConstant(mathOp(this, op, rhs));
              } else if (rhs instanceof LppArray && (typeof this.value === "boolean" || typeof this.value === "number")) {
                const time = typeof this.value === "boolean" ? +this.value : this.value;
                if (Number.isInteger(time)) {
                  const ret = new LppArray();
                  for (let i = 0; i < time; i++) {
                    ret.value = ret.value.concat(rhs.value);
                  }
                  return ret;
                }
              }
            }
            return new _LppConstant(NaN);
          }
          case "==": {
            return new _LppConstant(equal(this, rhs));
          }
          case "!=": {
            return new _LppConstant(!equal(this, rhs));
          }
          case ">":
          case "<":
          case ">=":
          case "<=": {
            return new _LppConstant(compare(this, op, rhs));
          }
          case "&&":
          case "||": {
            const left = asBoolean(this);
            const right = asBoolean(rhs);
            return new _LppConstant(op === "&&" ? left && right : left || right);
          }
          case "-":
          case "**":
          case "/":
          case "%":
          case "<<":
          case ">>":
          case ">>>":
          case "&":
          case "|":
          case "^": {
            if (!(rhs instanceof _LppConstant) || this.value === null || rhs.value === null || typeof this.value === "string" || typeof rhs.value === "string")
              return new _LppConstant(NaN);
            return new _LppConstant(mathOp(this, op, rhs));
          }
          case "instanceof": {
            if (rhs instanceof LppFunction) {
              return new _LppConstant(this.instanceof(rhs));
            }
            throw new LppError("notCallable");
          }
        }
      } else {
        switch (op) {
          case "delete": {
            throw new LppError("assignOfConstant");
          }
          case "+": {
            if (!(typeof this.value === "boolean" || typeof this.value === "number" || typeof this.value === "string"))
              return new _LppConstant(NaN);
            return new _LppConstant(+this.value);
          }
          case "-": {
            if (!(typeof this.value === "boolean" || typeof this.value === "number" || typeof this.value === "string"))
              return new _LppConstant(NaN);
            return new _LppConstant(-this.value);
          }
          case "!": {
            return new _LppConstant(!asBoolean(this));
          }
          case "~": {
            if (!(typeof this.value === "boolean" || typeof this.value === "number" || typeof this.value === "string"))
              return new _LppConstant(NaN);
            const v = +this.value;
            if (isNaN(v))
              return new _LppConstant(NaN);
            return new _LppConstant(~v);
          }
        }
      }
      throw new Error("lpp: unknown operand");
    }
  };

  // src/core/type/reference.ts
  var LppReference = class {
    /**
     * Construct a new LppChildObject object.
     * @param parent parent.
     * @param name key in parent.
     * @param value value.
     */
    constructor(parent, name, value) {
      this.name = name;
      this.value = value;
      this.parent = new WeakRef(parent);
    }
    /**
     * Parent object.
     */
    parent;
    /**
     * Get a value.
     * @param key Value to get.
     * @param key Child object.
     */
    get(key) {
      return this.value.get(key);
    }
    /**
     * Set a value.
     * @param key Key to set.
     * @param value Value to set.
     * @returns Value.
     */
    set(key, value) {
      return this.value.set(key, value);
    }
    /**
     * Detect whether a value exists.
     * @param key Key to detect.
     * @returns Whether the value exists.
     */
    has(key) {
      return this.value.has(key);
    }
    /**
     * Delete a value from the object or just delete itself.
     * @param key Key to delete. May be undefined.
     * @returns Whether the value exists.
     */
    delete(key) {
      const parent = this.parent.deref();
      if (!parent)
        throw new LppError("assignOfConstant");
      if (!key)
        return parent.delete(this.name);
      return this.value.delete(key);
    }
    /**
     * Detect whether a value is constructed from fn.
     * @param fn Function.
     * @returns Whether the value is constructed from fn.
     */
    instanceof(fn) {
      return this.value.instanceof(fn);
    }
    /**
     * Assign current value.
     * @param value Value to set.
     * @returns New value.
     */
    assign(value) {
      const parent = this.parent.deref();
      if (!parent)
        throw new LppError("assignOfConstant");
      parent.set(this.name, value);
      this.value = value;
      return this;
    }
    /**
     * toString for visualReport.
     * @returns Human readable string.
     */
    toString() {
      return this.value.toString();
    }
    /**
     * Do arithmetic operations.
     * @param op Binary operator.
     * @param rhs Right hand side of the operation.
     */
    calc(op, rhs) {
      if (op === "=" && rhs) {
        return this.assign(rhs);
      } else if (op === "delete" && !rhs) {
        return new LppConstant(this.delete());
      }
      return this.value.calc(op, rhs);
    }
  };

  // src/core/context.ts
  var LppReturn = class {
    /**
     * Construct a new LppReturn instance.
     * @param value Result.
     */
    constructor(value) {
      this.value = value;
      this.value = value;
    }
  };
  var LppException = class {
    /**
     * Construct a new LppException instance.
     * @param value Result.
     */
    constructor(value) {
      this.value = value;
      this.stack = [];
    }
    /**
     * Traceback.
     */
    stack;
    /**
     * Push stack into traceback.
     * @param stack Current stack.
     */
    pushStack(stack) {
      this.stack.push(stack);
    }
  };
  var LppTraceback;
  ((LppTraceback3) => {
    class Base {
    }
    LppTraceback3.Base = Base;
    class NativeFn extends Base {
      /**
       * Construct a traceback object.
       * @param fn Called function.
       * @param self Self.
       * @param args Arguments.
       */
      constructor(fn, self, args) {
        super();
        this.fn = fn;
        this.self = self;
        this.args = args;
      }
      toString() {
        return "<Native Function>";
      }
    }
    LppTraceback3.NativeFn = NativeFn;
  })(LppTraceback || (LppTraceback = {}));
  var LppClosure = class extends LppValue {
    value = /* @__PURE__ */ new Map();
    /**
     * Get a value.
     * @param key Value to get.
     * @returns Child object.
     */
    get(key) {
      return new LppReference(
        this,
        key,
        this.value.get(key) ?? new LppConstant(null)
      );
    }
    /**
     * Set a value.
     * @param key Key to set.
     * @param value Value to set.
     * @returns Value.
     */
    set(key, value) {
      this.value.set(key, value);
      return new LppReference(this, key, value);
    }
    /**
     * Detect whether a value exists.
     * @param key Key to detect.
     * @returns Whether the value exists.
     */
    has(key) {
      return this.value.has(key);
    }
    /**
     * Delete a value from the object.
     * @param key Key to delete.
     * @returns Whether the value exists.
     */
    delete(key) {
      return this.value.delete(key);
    }
    instanceof() {
      throw new Error("lpp: invalid usage of instanceof on LppClosure");
    }
    toString() {
      return "<Lpp Closure>";
    }
    calc() {
      throw new Error("lpp: invalid usage of calc on LppClosure");
    }
    constructor() {
      super();
    }
  };
  var LppContext = class {
    /**
     * Construct a new context.
     * @param parent Parent closure.
     * @param callback Callback for return / exception.
     */
    constructor(parent, callback) {
      this.parent = parent;
      this.callback = callback;
      this.closure = new LppClosure();
      this.parent = parent;
    }
    /**
     * Closure.
     */
    closure = new LppClosure();
    /**
     * Callback wrapper.
     * @param value Exception.
     */
    resolve(value) {
      this.callback(value);
      this.callback = () => {
      };
    }
    /**
     * Get variable.
     * @param name Variable name.
     * @returns Variable result.
     */
    get(name) {
      if (this.closure.has(name))
        return this.closure.get(name);
      else
        return this.parent ? this.parent.get(name) : this.closure.get(name);
    }
    /**
     * Unwind to a parent function context.
     * @returns Result.
     */
    unwind() {
      return this.parent ? this.parent.unwind() : null;
    }
  };
  var LppFunctionContext = class extends LppContext {
    /**
     * @param parent Parent context.
     * @param self Self object.
     * @param returnCallback Callback if function returns.
     * @param exceptionCallback Callback if function throws.
     */
    constructor(parent, self, callback) {
      super(parent, callback);
      this.self = self;
    }
    /**
     * Unwind to a parent function context.
     * @returns Result.
     */
    unwind() {
      return this;
    }
  };
  var LppAsyncFunctionContext = class extends LppFunctionContext {
    promise;
    detach() {
      if (!this.promise) {
        let resolveFn;
        let rejectFn;
        resolveFn = rejectFn = () => {
          throw new Error("not initialized");
        };
        const pm = new Promise((resolve, reject) => {
          resolveFn = resolve;
          rejectFn = reject;
        });
        this.promise = {
          promise: pm,
          resolve: resolveFn,
          reject: rejectFn
        };
        this.resolve(new LppReturn(new LppPromise(pm)));
      }
    }
  };

  // src/core/global/type/Array.ts
  function Array_default(global2) {
    global2.Array = LppFunction.native(
      ({ args }) => {
        function convertToArray(args2) {
          if (args2.length < 1)
            return new LppArray();
          if (args2.length === 1 && args2[0] instanceof LppArray) {
            return args2[0];
          }
          return new LppArray(args2);
        }
        return new LppReturn(convertToArray(args));
      },
      new LppObject(
        /* @__PURE__ */ new Map([
          [
            "length",
            LppFunction.native(({ self }) => {
              if (!(self instanceof LppArray)) {
                return async(function* () {
                  return raise(
                    yield global2.IllegalInvocationError.construct([])
                  );
                });
              }
              return new LppReturn(new LppConstant(self.value.length));
            })
          ],
          [
            "slice",
            LppFunction.native(({ self, args }) => {
              return async(function* () {
                if (!(self instanceof LppArray)) {
                  return raise(
                    yield global2.IllegalInvocationError.construct([])
                  );
                }
                const start = args[0];
                const end = args[0];
                if (start && !(start instanceof LppConstant) || end && !(end instanceof LppConstant)) {
                  return raise(
                    yield global2.IllegalInvocationError.construct([])
                  );
                }
                return new LppReturn(
                  new LppArray(
                    self.value.slice(
                      start?.value ?? void 0,
                      end?.value ?? void 0
                    )
                  )
                );
              });
            })
          ],
          [
            "map",
            LppFunction.native(({ self, args }) => {
              return async(function* () {
                if (!(self instanceof LppArray) || !(args[0] instanceof LppFunction)) {
                  return raise(
                    yield global2.IllegalInvocationError.construct([])
                  );
                }
                const result = new LppArray();
                const predict = args[0];
                for (const [k, v] of self.value.entries()) {
                  const res = yield predict.apply(self, [
                    v ?? new LppConstant(null),
                    new LppConstant(k)
                  ]);
                  if (res instanceof LppException)
                    return res;
                  else
                    result.value.push(res.value);
                }
                return new LppReturn(result);
              });
            })
          ],
          [
            "every",
            LppFunction.native(({ self, args }) => {
              return async(function* () {
                if (!(self instanceof LppArray) || !(args[0] instanceof LppFunction)) {
                  return raise(
                    yield global2.IllegalInvocationError.construct([])
                  );
                }
                const predict = args[0];
                for (const [k, v] of self.value.entries()) {
                  const res = yield predict.apply(self, [
                    v ?? new LppConstant(null),
                    new LppConstant(k)
                  ]);
                  if (res instanceof LppException)
                    return res;
                  else if (!asBoolean(res.value)) {
                    return new LppReturn(new LppConstant(false));
                  }
                }
                return new LppReturn(new LppConstant(true));
              });
            })
          ],
          [
            "any",
            LppFunction.native(({ self, args }) => {
              return async(function* () {
                if (!(self instanceof LppArray) || !(args[0] instanceof LppFunction)) {
                  return raise(
                    yield global2.IllegalInvocationError.construct([])
                  );
                }
                const predict = args[0];
                for (const [k, v] of self.value.entries()) {
                  const res = yield predict.apply(self, [
                    v ?? new LppConstant(null),
                    new LppConstant(k)
                  ]);
                  if (res instanceof LppException)
                    return res;
                  else if (asBoolean(res.value)) {
                    return new LppReturn(new LppConstant(true));
                  }
                }
                return new LppReturn(new LppConstant(false));
              });
            })
          ]
        ])
      )
    );
  }

  // src/core/global/type/Boolean.ts
  function Boolean_default(global2) {
    global2.Boolean = LppFunction.native(({ args }) => {
      if (args.length < 1)
        return new LppReturn(new LppConstant(false));
      return new LppReturn(new LppConstant(asBoolean(args[0])));
    }, new LppObject(/* @__PURE__ */ new Map()));
  }

  // src/core/global/type/Number.ts
  function Number_default(global2) {
    global2.Number = LppFunction.native(({ args }) => {
      function convertToNumber(args2) {
        if (args2.length < 1)
          return new LppConstant(0);
        const v = args2[0];
        if (v instanceof LppConstant) {
          if (v === new LppConstant(null))
            return new LppConstant(0);
          switch (typeof v.value) {
            case "string":
              return new LppConstant(globalThis.Number(v.value));
            case "number":
              return new LppConstant(v.value);
            case "boolean":
              return v.value ? new LppConstant(1) : new LppConstant(0);
          }
        } else if (v instanceof LppFunction) {
          return new LppConstant(NaN);
        } else if (v instanceof LppObject) {
          return new LppConstant(NaN);
        }
        return new LppConstant(NaN);
      }
      return new LppReturn(convertToNumber(args));
    }, new LppObject(/* @__PURE__ */ new Map()));
    global2.Number.set("EPLISON", new LppConstant(globalThis.Number.EPSILON));
    global2.Number.set("MAX_VALUE", new LppConstant(globalThis.Number.MAX_VALUE));
    global2.Number.set(
      "MAX_SAFE_INTEGER",
      new LppConstant(globalThis.Number.MAX_SAFE_INTEGER)
    );
    global2.Number.set("MIN_VALUE", new LppConstant(globalThis.Number.MIN_VALUE));
    global2.Number.set(
      "MIN_SAFE_INTEGER",
      new LppConstant(globalThis.Number.MIN_SAFE_INTEGER)
    );
    global2.Number.set(
      "isNaN",
      LppFunction.native(({ args }) => {
        return new LppReturn(
          new LppConstant(
            args.length > 0 && args[0] instanceof LppConstant && globalThis.Number.isNaN(args[0].value)
          )
        );
      })
    );
    global2.Number.set(
      "isFinite",
      LppFunction.native(({ args }) => {
        return new LppReturn(
          new LppConstant(
            args.length > 0 && args[0] instanceof LppConstant && globalThis.Number.isFinite(args[0].value)
          )
        );
      })
    );
    global2.Number.set(
      "isSafeInteger",
      LppFunction.native(({ args }) => {
        return new LppReturn(
          new LppConstant(
            args.length > 0 && args[0] instanceof LppConstant && globalThis.Number.isSafeInteger(args[0].value)
          )
        );
      })
    );
    global2.Number.set(
      "isSafeInteger",
      LppFunction.native(({ args }) => {
        return new LppReturn(
          new LppConstant(
            args.length > 0 && args[0] instanceof LppConstant && globalThis.Number.isSafeInteger(args[0].value)
          )
        );
      })
    );
  }

  // src/core/global/type/Object.ts
  function Object_default(global2) {
    global2.Object = LppFunction.native(({ args }) => {
      function convertToObject(args2) {
        if (args2.length < 1)
          return new LppObject();
        return args2[0];
      }
      return new LppReturn(convertToObject(args));
    }, new LppObject(/* @__PURE__ */ new Map()));
  }

  // src/core/global/type/String.ts
  function String_default(global2) {
    global2.String = LppFunction.native(
      ({ args }) => {
        function convertToString(args2) {
          if (args2.length < 1)
            return new LppConstant("");
          const v = args2[0];
          return new LppConstant(v.toString());
        }
        return new LppReturn(convertToString(args));
      },
      new LppObject(
        /* @__PURE__ */ new Map([
          [
            "length",
            LppFunction.native(({ self }) => {
              if (self instanceof LppConstant && typeof self.value === "string") {
                return new LppReturn(new LppConstant(self.value.length));
              }
              return async(function* () {
                return raise(
                  yield global2.IllegalInvocationError.construct(
                    []
                  )
                );
              });
            })
          ]
        ])
      )
    );
  }

  // src/core/global/type/Function.ts
  function Function_default(global2) {
    global2.Function = LppFunction.native(
      ({ args }) => {
        if (args.length < 1)
          return new LppReturn(
            new LppFunction(() => {
              return new LppReturn(new LppConstant(null));
            })
          );
        if (args[0] instanceof LppFunction)
          return new LppReturn(args[0]);
        return async(function* () {
          return raise(
            yield global2.IllegalInvocationError.construct([])
          );
        });
      },
      new LppObject(
        /* @__PURE__ */ new Map([
          ["prototype", asValue(global2.Object.get("prototype"))],
          [
            "bind",
            LppFunction.native(({ self, args }) => {
              if (!(self instanceof LppFunction) || args.length < 1) {
                return async(function* () {
                  return raise(
                    yield global2.IllegalInvocationError.construct([])
                  );
                });
              }
              const selfArg = args[0];
              return new LppReturn(
                new LppFunction((ctx) => {
                  return self.apply(selfArg, ctx.args);
                })
              );
            })
          ]
        ])
      )
    );
  }

  // src/core/global/type/Promise.ts
  function processPromise(self, res) {
    self.pm = res.pm;
    return new LppReturn(new LppConstant(null));
  }
  function Promise_default(global2) {
    global2.Promise = LppFunction.native(
      ({ self, args }) => {
        if (self instanceof LppPromise && args.length > 0 && args[0] instanceof LppFunction) {
          const fn = args[0];
          return async(function* () {
            return processPromise(
              self,
              yield LppPromise.generate((resolve, reject) => {
                return async(function* () {
                  yield fn.apply(self, [
                    new LppFunction(({ args: args2 }) => {
                      return async(function* () {
                        yield processThenReturn(
                          new LppReturn(args2[0] ?? new LppConstant(null)),
                          resolve,
                          reject
                        );
                        return new LppReturn(new LppConstant(null));
                      });
                    }),
                    new LppFunction(({ args: args2 }) => {
                      reject(args2[0] ?? new LppConstant(null));
                      return new LppReturn(new LppConstant(null));
                    })
                  ]);
                  return void 0;
                });
              })
            );
          });
        } else {
          return async(function* () {
            return raise(
              yield global2.IllegalInvocationErrorError.construct(
                []
              )
            );
          });
        }
      },
      new LppObject(
        /* @__PURE__ */ new Map([
          [
            "then",
            LppFunction.native(({ self, args }) => {
              if (self instanceof LppPromise) {
                return new LppReturn(
                  self.done(
                    args[0] instanceof LppFunction ? args[0] : void 0,
                    args[1] instanceof LppFunction ? args[1] : void 0
                  )
                );
              } else {
                return async(function* () {
                  return raise(
                    yield global2.IllegalInvocationErrorError.construct([])
                  );
                });
              }
            })
          ],
          [
            "catch",
            LppFunction.native(({ self, args }) => {
              if (self instanceof LppPromise && args.length > 0 && args[0] instanceof LppFunction) {
                return new LppReturn(self.error(args[0]));
              } else {
                return async(function* () {
                  return raise(
                    yield global2.IllegalInvocationErrorError.construct([])
                  );
                });
              }
            })
          ]
        ])
      )
    );
    global2.Promise.set(
      "resolve",
      LppFunction.native(({ args }) => {
        return async(function* () {
          return new LppReturn(
            yield LppPromise.generate((resolve, reject) => {
              return async(function* () {
                yield processThenReturn(
                  new LppReturn(args[0] ?? new LppConstant(null)),
                  resolve,
                  reject
                );
                return void 0;
              });
            })
          );
        });
      })
    );
    global2.Promise.set(
      "reject",
      LppFunction.native(({ args }) => {
        return new LppReturn(
          new LppPromise(
            globalThis.Promise.reject(args[0] ?? new LppConstant(null))
          )
        );
      })
    );
  }

  // src/core/global/type/index.ts
  function type_default(global2) {
    Number_default(global2);
    Boolean_default(global2);
    String_default(global2);
    Array_default(global2);
    Object_default(global2);
    Function_default(global2);
    Promise_default(global2);
  }

  // src/core/global/error/Error.ts
  function Error_default(global2) {
    const Error2 = global2.Error = LppFunction.native(({ self, args }) => {
      if (self.instanceof(Error2)) {
        self.set("value", args[0] ?? new LppConstant(null));
        self.set("stack", new LppConstant(null));
        return new LppReturn(new LppArray());
      } else {
        return async(function* () {
          return raise(
            yield global2.IllegalInvocationError.construct([])
          );
        });
      }
    }, new LppObject(/* @__PURE__ */ new Map()));
  }

  // src/core/global/error/IllegalInvocationError.ts
  function IllegalInvocationError_default(global2) {
    const IllegalInvocationError = global2.IllegalInvocationError = LppFunction.native(
      ({ self, args }) => {
        if (self.instanceof(IllegalInvocationError)) {
          return async(function* () {
            const v = yield global2.Error.apply(self, args);
            if (v instanceof LppException)
              return v;
            return new LppReturn(new LppConstant(null));
          });
        } else {
          return async(function* () {
            return raise(yield IllegalInvocationError.construct([]));
          });
        }
      },
      new LppObject(
        /* @__PURE__ */ new Map([["prototype", asValue(global2.Error.get("prototype"))]])
      )
    );
  }

  // src/core/global/error/SyntaxError.ts
  function SyntaxError_default(global2) {
    const SyntaxError = global2.SyntaxError = LppFunction.native(
      ({ self, args }) => {
        if (self.instanceof(SyntaxError)) {
          return async(function* () {
            const v = yield global2.Error.apply(self, args);
            if (v instanceof LppException)
              return v;
            return new LppReturn(new LppConstant(null));
          });
        } else {
          return async(function* () {
            return raise(
              yield global2.IllegalInvocationError.construct([])
            );
          });
        }
      },
      new LppObject(
        /* @__PURE__ */ new Map([
          ["prototype", asValue(global2.Error.get("prototype"))]
        ])
      )
    );
  }

  // src/core/global/error/index.ts
  function error_default(global2) {
    Error_default(global2);
    IllegalInvocationError_default(global2);
    SyntaxError_default(global2);
  }

  // src/core/ffi/index.ts
  var ffi_exports = {};
  __export(ffi_exports, {
    fromObject: () => fromObject,
    toObject: () => toObject
  });
  function toObject(value) {
    const map = /* @__PURE__ */ new WeakMap();
    function deserializeInternal(value2) {
      if (value2 instanceof LppConstant)
        return value2.value;
      if (value2 instanceof LppArray) {
        const cache = map.get(value2);
        if (cache)
          return cache;
        const res = value2.value.map((v) => v ? deserializeInternal(v) : null);
        map.set(value2, res);
        return res;
      }
      if (value2 instanceof LppObject) {
        const cache = map.get(value2);
        if (cache)
          return cache;
        const res = {};
        for (const [k, v] of value2.value.entries()) {
          if (k === "constructor")
            continue;
          res[k] = deserializeInternal(v);
        }
        map.set(value2, res);
        return res;
      }
      return null;
    }
    return deserializeInternal(value);
  }
  function fromObject(value) {
    const map = /* @__PURE__ */ new WeakMap();
    function serializeInternal(value2) {
      if (value2 === null || value2 === void 0)
        return new LppConstant(null);
      switch (typeof value2) {
        case "string":
        case "number":
        case "boolean":
          return new LppConstant(value2);
        case "object": {
          const v = map.get(value2);
          if (v)
            return v;
          if (value2 instanceof globalThis.Array) {
            const res = new LppArray(value2.map((value3) => serializeInternal(value3)));
            map.set(value2, res);
            return res;
          }
          const obj = new LppObject();
          for (const [k, v2] of globalThis.Object.entries(value2)) {
            obj.set(k, serializeInternal(v2));
          }
          map.set(value2, obj);
          return obj;
        }
      }
      return new LppConstant(null);
    }
    return serializeInternal(value);
  }

  // src/core/global/JSON.ts
  function JSON_default(global2) {
    global2.JSON = new LppObject(
      /* @__PURE__ */ new Map([
        [
          "parse",
          LppFunction.native(({ args }) => {
            if (args.length < 1 || !(args[0] instanceof LppConstant) || !(typeof args[0].value === "string")) {
              return async(function* () {
                return raise(
                  yield global2.SyntaxError.construct([
                    new LppConstant("Invalid JSON")
                  ])
                );
              });
            }
            try {
              return new LppReturn(
                fromObject(globalThis.JSON.parse(args[0].value))
              );
            } catch (e) {
              return async(function* () {
                if (e instanceof globalThis.Error) {
                  return raise(
                    yield global2.SyntaxError.construct([
                      new LppConstant(e.message)
                    ])
                  );
                }
                throw e;
              });
            }
          })
        ],
        [
          "stringify",
          LppFunction.native(({ args }) => {
            if (args.length < 1) {
              return async(function* () {
                return raise(
                  yield global2.SyntaxError.construct([
                    new LppConstant("Invalid value")
                  ])
                );
              });
            }
            try {
              return new LppReturn(
                new LppConstant(globalThis.JSON.stringify(toObject(args[0])))
              );
            } catch (e) {
              return async(function* () {
                if (e instanceof globalThis.Error) {
                  return raise(
                    yield global2.SyntaxError.construct([
                      new LppConstant(e.message)
                    ])
                  );
                }
                throw e;
              });
            }
          })
        ]
      ])
    );
  }

  // src/core/global/Math.ts
  function Math_default(global2) {
    global2.Math = new LppObject(
      /* @__PURE__ */ new Map([
        ["E", new LppConstant(globalThis.Math.E)],
        ["PI", new LppConstant(globalThis.Math.PI)],
        [
          "sin",
          LppFunction.native(({ args }) => {
            if (args.length < 1 || !(args[0] instanceof LppConstant) || !(typeof args[0].value === "number")) {
              return new LppReturn(new LppConstant(NaN));
            }
            return new LppReturn(
              new LppConstant(globalThis.Math.sin(args[0].value))
            );
          })
        ],
        [
          "sinh",
          LppFunction.native(({ args }) => {
            if (args.length < 1 || !(args[0] instanceof LppConstant) || !(typeof args[0].value === "number")) {
              return new LppReturn(new LppConstant(NaN));
            }
            return new LppReturn(
              new LppConstant(globalThis.Math.sinh(args[0].value))
            );
          })
        ],
        [
          "asin",
          LppFunction.native(({ args }) => {
            if (args.length < 1 || !(args[0] instanceof LppConstant) || !(typeof args[0].value === "number")) {
              return new LppReturn(new LppConstant(NaN));
            }
            return new LppReturn(
              new LppConstant(globalThis.Math.asin(args[0].value))
            );
          })
        ],
        [
          "asinh",
          LppFunction.native(({ args }) => {
            if (args.length < 1 || !(args[0] instanceof LppConstant) || !(typeof args[0].value === "number")) {
              return new LppReturn(new LppConstant(NaN));
            }
            return new LppReturn(
              new LppConstant(globalThis.Math.asinh(args[0].value))
            );
          })
        ],
        [
          "cos",
          LppFunction.native(({ args }) => {
            if (args.length < 1 || !(args[0] instanceof LppConstant) || !(typeof args[0].value === "number")) {
              return new LppReturn(new LppConstant(NaN));
            }
            return new LppReturn(
              new LppConstant(globalThis.Math.cos(args[0].value))
            );
          })
        ],
        [
          "cosh",
          LppFunction.native(({ args }) => {
            if (args.length < 1 || !(args[0] instanceof LppConstant) || !(typeof args[0].value === "number")) {
              return new LppReturn(new LppConstant(NaN));
            }
            return new LppReturn(
              new LppConstant(globalThis.Math.cosh(args[0].value))
            );
          })
        ],
        [
          "acos",
          LppFunction.native(({ args }) => {
            if (args.length < 1 || !(args[0] instanceof LppConstant) || !(typeof args[0].value === "number")) {
              return new LppReturn(new LppConstant(NaN));
            }
            return new LppReturn(
              new LppConstant(globalThis.Math.acos(args[0].value))
            );
          })
        ],
        [
          "acosh",
          LppFunction.native(({ args }) => {
            if (args.length < 1 || !(args[0] instanceof LppConstant) || !(typeof args[0].value === "number")) {
              return new LppReturn(new LppConstant(NaN));
            }
            return new LppReturn(
              new LppConstant(globalThis.Math.acosh(args[0].value))
            );
          })
        ],
        [
          "tan",
          LppFunction.native(({ args }) => {
            if (args.length < 1 || !(args[0] instanceof LppConstant) || !(typeof args[0].value === "number")) {
              return new LppReturn(new LppConstant(NaN));
            }
            return new LppReturn(
              new LppConstant(globalThis.Math.tan(args[0].value))
            );
          })
        ],
        [
          "tanh",
          LppFunction.native(({ args }) => {
            if (args.length < 1 || !(args[0] instanceof LppConstant) || !(typeof args[0].value === "number")) {
              return new LppReturn(new LppConstant(NaN));
            }
            return new LppReturn(
              new LppConstant(globalThis.Math.tanh(args[0].value))
            );
          })
        ],
        [
          "atan",
          LppFunction.native(({ args }) => {
            if (args.length < 1 || !(args[0] instanceof LppConstant) || !(typeof args[0].value === "number")) {
              return new LppReturn(new LppConstant(NaN));
            }
            return new LppReturn(
              new LppConstant(globalThis.Math.atan(args[0].value))
            );
          })
        ],
        [
          "atanh",
          LppFunction.native(({ args }) => {
            if (args.length < 1 || !(args[0] instanceof LppConstant) || !(typeof args[0].value === "number")) {
              return new LppReturn(new LppConstant(NaN));
            }
            return new LppReturn(
              new LppConstant(globalThis.Math.atanh(args[0].value))
            );
          })
        ],
        [
          "atan2",
          LppFunction.native(({ args }) => {
            if (args.length < 2 || !(args[0] instanceof LppConstant) || !(typeof args[0].value === "number") || !(args[1] instanceof LppConstant) || !(typeof args[0].value === "number")) {
              return new LppReturn(new LppConstant(NaN));
            }
            return new LppReturn(
              new LppConstant(globalThis.Math.atan2(args[0].value, args[1].value))
            );
          })
        ],
        [
          "random",
          LppFunction.native(() => {
            return new LppReturn(new LppConstant(globalThis.Math.random()));
          })
        ]
      ])
    );
  }

  // src/core/global/index.ts
  var global = {};
  type_default(global);
  error_default(global);
  JSON_default(global);
  Math_default(global);
  var global_default = global;

  // src/core/index.ts
  var Global = global_default;

  // package.json
  var version = "1.0.0";
  var developers = [
    "\u{1F43A} @FurryR https://github.com/FurryR - Developer, Test, Translation, Documentation",
    "\u{1F914} @SimonShiki https://github.com/SimonShiki - Test, Technical support",
    "\u{1F604} @Nights https://github.com/Nightre - Technical support",
    "\u{1F524} @CST1229 https://github.com/CST1229 - Technical support",
    "\u2B50 @DilemmaGX https://github.com/DilemmaGX - Icon artist (legacy)",
    "\u{1F36D} @TangDo158 https://github.com/TangDo158 - Icon artist (new)",
    "\u{1F43A} @VeroFess https://github.com/VeroFess - Technical support"
  ];

  // src/impl/traceback/dialog.ts
  var dialog_exports = {};
  __export(dialog_exports, {
    CloseIcon: () => CloseIcon,
    Div: () => Div,
    HelpIcon: () => HelpIcon,
    IconGroup: () => IconGroup,
    Text: () => Text,
    Title: () => Title,
    globalStyle: () => globalStyle,
    show: () => show
  });
  function show(Blockly, id, value, textAlign) {
    const workspace = Blockly.getMainWorkspace();
    const block = workspace.getBlockById(id);
    if (!block)
      return;
    Blockly.DropDownDiv.hideWithoutAnimation();
    Blockly.DropDownDiv.clearContent();
    const contentDiv = Blockly.DropDownDiv.getContentDiv(), elem = document.createElement("div");
    elem.setAttribute("class", "valueReportBox");
    elem.append(...value);
    elem.style.maxWidth = "none";
    elem.style.maxHeight = "none";
    elem.style.textAlign = textAlign;
    elem.style.userSelect = "none";
    contentDiv.appendChild(elem);
    Blockly.DropDownDiv.setColour(
      Blockly.Colours.valueReportBackground,
      Blockly.Colours.valueReportBorder
    );
    Blockly.DropDownDiv.showPositionedByBlock(
      workspace,
      block
    );
    return elem;
  }
  function IconGroup(icons) {
    const iconGroup = document.createElement("div");
    iconGroup.style.float = "right";
    iconGroup.append(...icons);
    return iconGroup;
  }
  function CloseIcon(Blockly, title) {
    const icon = document.createElement("span");
    icon.classList.add("lpp-traceback-icon");
    icon.addEventListener("click", () => {
      Blockly.DropDownDiv.hide();
    });
    icon.title = `\u274C ${title}`;
    icon.textContent = "\u274C";
    return icon;
  }
  function HelpIcon(title, hideTitle, onShow, onHide) {
    let state = false;
    const icon = document.createElement("span");
    icon.classList.add("lpp-traceback-icon");
    icon.textContent = "\u2753";
    icon.title = `\u2753 ${title}`;
    icon.addEventListener("click", () => {
      if (state) {
        icon.textContent = "\u2753";
        icon.title = `\u2753 ${title}`;
        onHide();
      } else {
        icon.textContent = "\u2796";
        icon.title = `\u2796 ${hideTitle}`;
        onShow();
      }
      state = !state;
    });
    return icon;
  }
  function Title(value) {
    const text = document.createElement("div");
    text.style.textAlign = "left";
    text.style.whiteSpace = "nowrap";
    text.style.overflow = "hidden";
    text.style.textOverflow = "ellipsis";
    text.title = text.textContent = value;
    return text;
  }
  function Text(value, className) {
    const text = document.createElement("span");
    if (className)
      text.className = className;
    text.textContent = value;
    return text;
  }
  function Div(value, className) {
    const div = document.createElement("div");
    if (className)
      div.className = className;
    div.append(...value);
    return div;
  }
  var globalStyle = document ? document.createElement("style") : void 0;
  if (globalStyle) {
    globalStyle.id = "lpp-traceback-style";
    globalStyle.textContent = `
.lpp-traceback-icon {
  transition: text-shadow 0.25s ease-out;
  color: transparent;
  text-shadow: 0 0 0 gray;
}
.lpp-traceback-icon:hover {
  cursor: pointer;
  text-shadow: 0 0 0 gray, 0px 0px 5px silver;
}
`;
    document.head.appendChild(globalStyle);
  }

  // src/impl/context.ts
  var LppTraceback2;
  ((LppTraceback3) => {
    LppTraceback3.Base = LppTraceback.Base;
    LppTraceback3.NativeFn = LppTraceback.NativeFn;
    class Block2 extends LppTraceback.Base {
      /**
       * Construct a traceback object.
       * @param target Target ID.
       * @param block Block ID.
       * @param context Context.
       */
      constructor(target, block, context) {
        super();
        this.target = target;
        this.block = block;
        this.context = context;
      }
      toString() {
        return this.block;
      }
    }
    LppTraceback3.Block = Block2;
  })(LppTraceback2 || (LppTraceback2 = {}));

  // src/impl/metadata/index.ts
  var metadata_exports = {};
  __export(metadata_exports, {
    TypeMetadata: () => TypeMetadata,
    attach: () => attach,
    hasMetadata: () => hasMetadata
  });
  var TypeMetadata = class {
    /**
     * Construct a type metadata object.
     * @param signature Function's signature.
     */
    constructor(signature) {
      this.signature = signature;
    }
  };
  function hasMetadata(obj) {
    const v = obj;
    return !!v.metadata;
  }
  function attach(obj, metadata) {
    const v = obj;
    v.metadata = metadata;
    return v;
  }

  // src/impl/serialization.ts
  var ScratchMetadata = class extends TypeMetadata {
    /**
     * Construct a Scratch metadata object.
     * @param signature Function's signature.
     * @param blocks Runtime blocks instance (for serialize/deserialize) and Block ID (refers to lpp_constructFunction).
     * @param sprite Original sprite ID of block container.
     * @param target Target ID.
     * @param closure Function's closure.
     */
    constructor(signature, blocks, sprite, target, closure) {
      super(signature);
      this.blocks = blocks;
      this.sprite = sprite;
      this.target = target;
      this.closure = closure;
    }
  };
  function serializeBlock(container, block) {
    function serializeBlockInternal(container2, block2) {
      const v = {};
      v[block2.id] = structuredClone(block2);
      for (const elem of Object.values(block2.inputs)) {
        const subBlock = container2.getBlock(elem.block);
        if (subBlock)
          Object.assign(v, serializeBlockInternal(container2, subBlock));
      }
      if (block2.next) {
        const nextBlock = container2.getBlock(block2.next);
        if (nextBlock)
          Object.assign(v, serializeBlockInternal(container2, nextBlock));
      }
      return v;
    }
    const res = serializeBlockInternal(container, block);
    res[block.id].parent = null;
    return res;
  }
  function deserializeBlock(container, blocks) {
    container._blocks = blocks;
  }
  var Validator;
  ((Validator2) => {
    function isField(value) {
      if (!(typeof value === "object" && value !== null))
        return false;
      const v = value;
      if (v.id !== null && typeof v.id !== "string")
        return false;
      if (typeof v.name !== "string")
        return false;
      if (typeof v.value !== "string")
        return false;
      return true;
    }
    Validator2.isField = isField;
    function isInput(container, value) {
      if (!(typeof value === "object" && value !== null))
        return false;
      const v = value;
      if (v.shadow !== null && typeof v.shadow !== "string")
        return false;
      if (typeof v.name !== "string")
        return false;
      if (typeof v.block !== "string" || !(v.block in container))
        return false;
      return true;
    }
    Validator2.isInput = isInput;
    function isBlock(container, id, value) {
      if (!(typeof value === "object" && value !== null))
        return false;
      const v = value;
      if (v.id !== id)
        return false;
      if (typeof v.opcode !== "string")
        return false;
      if (v.parent !== null) {
        if (typeof v.parent !== "string" || !(v.parent in container) || v.parent === id)
          return false;
      }
      if (v.next !== null) {
        if (typeof v.next !== "string" || !(v.next in container) || v.next === id)
          return false;
      }
      if (typeof v.shadow !== "boolean")
        return false;
      if (typeof v.topLevel !== "boolean")
        return false;
      if (!(typeof v.inputs === "object" && v.inputs !== null) || !Object.values(v.inputs).every((elem) => isInput(container, elem)) && Object.keys(v.inputs).length !== 0)
        return false;
      if (!(typeof v.fields === "object" && v.fields !== null) || !Object.values(v.fields).every((v2) => isField(v2)) && Object.keys(v.fields).length !== 0)
        return false;
      if (v.mutation !== void 0 && !(typeof v.mutation === "object" && v.mutation !== null))
        return false;
      return true;
    }
    Validator2.isBlock = isBlock;
    function isInfo(value) {
      if (!(typeof value === "object" && value !== null))
        return false;
      const v = value;
      if (!(v.signature instanceof Array) || !v.signature.every((v2) => typeof v2 === "string") && v.signature.length !== 0)
        return false;
      if (!(typeof v.script === "object" && v.script !== null) || !Object.entries(v.script).every(
        (elem) => isBlock(v.script, elem[0], elem[1])
      ) && Object.keys(v.script).length !== 0)
        return false;
      if (typeof v.block !== "string" || !(v.block in v.script))
        return false;
      return true;
    }
    Validator2.isInfo = isInfo;
  })(Validator || (Validator = {}));

  // src/impl/boundarg.ts
  var LppBoundArg = class {
    /**
     * Construct a bound arg for lpp.
     * @param value
     */
    constructor(value) {
      this.value = value;
    }
    toString() {
      return "<Lpp BoundArg>";
    }
  };

  // src/impl/traceback/inspector.ts
  function Inspector(Blockly, vm, translate, value) {
    function ExtendIcon(title, hideTitle, onShow, onHide) {
      let state = false;
      const icon = document.createElement("span");
      icon.classList.add("lpp-traceback-icon");
      icon.textContent = "\u2795";
      icon.title = `\u2795 ${title}`;
      icon.addEventListener("click", () => {
        if (state) {
          icon.textContent = "\u2795";
          icon.title = `\u2795 ${title}`;
          onHide();
        } else {
          icon.textContent = "\u2796";
          icon.title = `\u2796 ${hideTitle}`;
          onShow();
        }
        state = !state;
      });
      return icon;
    }
    function objView(value2) {
      function keyValue(index, value3, isArray) {
        const subelem = document.createElement("li");
        subelem.append(
          isArray ? dialog_exports.Text(
            index,
            "lpp-code lpp-inspector-number lpp-inspector-key"
          ) : /^[$_a-zA-Z][$_0-9a-zA-Z]*$/.test(index) ? dialog_exports.Text(
            index,
            `lpp-code lpp-inspector-key${["constructor", "prototype"].includes(String(index)) ? `-${index}` : ""}`
          ) : dialog_exports.Text(
            JSON.stringify(index),
            "lpp-code lpp-inspector-string lpp-inspector-key"
          ),
          dialog_exports.Text(` \u27A1\uFE0F `)
        );
        subelem.append(Inspector(Blockly, vm, translate, value3));
        return subelem;
      }
      const metadata = (value2 instanceof LppObject || value2 instanceof LppFunction) && hasMetadata(value2);
      const div = document.createElement("ul");
      div.classList.add("lpp-list");
      for (const [index, v] of value2.value.entries()) {
        if ((!(value2 instanceof LppFunction) || index !== "prototype") && index !== "constructor")
          div.append(
            keyValue(
              String(index),
              v ?? new LppConstant(null),
              value2 instanceof LppArray || value2 instanceof LppBoundArg
            )
          );
      }
      if (value2 instanceof LppFunction)
        div.append(
          keyValue(
            "prototype",
            value2.value.get("prototype") ?? new LppConstant(null),
            false
          )
        );
      if (value2 instanceof LppArray || value2 instanceof LppFunction || value2 instanceof LppObject) {
        div.append(
          keyValue(
            "constructor",
            value2 instanceof LppArray ? Global.Array : value2.value.get("constructor") ?? (value2 instanceof LppFunction ? Global.Function : Global.Object),
            false
          )
        );
      }
      if (metadata && value2.metadata instanceof ScratchMetadata) {
        const subelem = document.createElement("li");
        subelem.append(
          dialog_exports.Text(
            "[[FunctionLocation]]",
            "lpp-code lpp-inspector-key-constructor"
          ),
          dialog_exports.Text(` \u27A1\uFE0E `)
        );
        const traceback = document.createElement("span");
        traceback.classList.add("lpp-code");
        if (Blockly && value2.metadata.sprite && vm.runtime.getTargetById(value2.metadata.sprite)) {
          const workspace = Blockly.getMainWorkspace();
          traceback.classList.add("lpp-traceback-stack-enabled");
          const { sprite, blocks } = value2.metadata;
          traceback.textContent = blocks[1];
          traceback.title = translate({
            id: "lpp.tooltip.button.scrollToBlockEnabled",
            default: "Scroll to this block.",
            description: "Scroll button text."
          });
          traceback.addEventListener("click", () => {
            const box = Blockly.DropDownDiv.getContentDiv().getElementsByClassName(
              "valueReportBox"
            )[0];
            vm.setEditingTarget(sprite);
            workspace.centerOnBlock(blocks[1], true);
            if (box) {
              Blockly.DropDownDiv.hideWithoutAnimation();
              Blockly.DropDownDiv.clearContent();
              Blockly.DropDownDiv.getContentDiv().append(box);
              Blockly.DropDownDiv.showPositionedByBlock(
                workspace,
                workspace.getBlockById(blocks[1])
              );
            }
          });
        } else {
          traceback.classList.add("lpp-inspector-null");
          traceback.textContent = "null";
        }
        subelem.append(traceback);
        div.append(subelem);
      }
      return div;
    }
    if (value instanceof LppConstant) {
      if (value.value === null)
        return dialog_exports.Text("null", "lpp-code lpp-inspector-null");
      switch (typeof value.value) {
        case "boolean":
        case "number":
          return dialog_exports.Text(String(value.value), "lpp-code lpp-inspector-number");
        case "string":
          return dialog_exports.Text(
            JSON.stringify(value.value),
            "lpp-code lpp-inspector-string"
          );
      }
    } else if (value instanceof LppArray || value instanceof LppObject || value instanceof LppFunction || value instanceof LppBoundArg) {
      let v;
      const btn = ExtendIcon(
        translate({
          id: "lpp.tooltip.button.help.more",
          default: "Show detail.",
          description: "Show detail button."
        }),
        translate({
          id: "lpp.tooltip.button.help.less",
          default: "Hide detail.",
          description: "Hide detail button."
        }),
        () => {
          if (!v)
            span.appendChild(v = objView(value));
          else
            v.style.display = "block";
        },
        () => {
          if (v)
            v.style.display = "none";
        }
      );
      const span = document.createElement("span");
      span.style.lineHeight = "80%";
      let code;
      if (value instanceof LppArray) {
        code = dialog_exports.Text(value.value.length === 0 ? "[]" : "[...]", "lpp-code");
      } else if (value instanceof LppFunction) {
        code = dialog_exports.Text(
          `f (${hasMetadata(value) && value.metadata instanceof TypeMetadata ? value.metadata.signature.join(", ") : ""})`,
          "lpp-code"
        );
        code.style.fontStyle = "italic";
      } else if (value instanceof LppObject) {
        code = dialog_exports.Text(value.value.size === 0 ? "{}" : "{...}", "lpp-code");
      } else {
        code = dialog_exports.Text(value.value.length === 0 ? "()" : "(...)", "lpp-code");
      }
      if (Blockly && (value instanceof LppFunction || value instanceof LppObject) && hasMetadata(value) && value.metadata instanceof ScratchMetadata && value.metadata.sprite && vm.runtime.getTargetById(value.metadata.sprite)) {
        const workspace = Blockly.getMainWorkspace();
        const { sprite, blocks } = value.metadata;
        code.title = translate({
          id: "lpp.tooltip.button.scrollToBlockEnabled",
          default: "Scroll to this block.",
          description: "Scroll button text."
        });
        code.classList.add("lpp-traceback-stack-enabled");
        code.addEventListener("click", () => {
          const box = Blockly.DropDownDiv.getContentDiv().getElementsByClassName(
            "valueReportBox"
          )[0];
          vm.setEditingTarget(sprite);
          workspace.centerOnBlock(blocks[1], true);
          if (box) {
            Blockly.DropDownDiv.hideWithoutAnimation();
            Blockly.DropDownDiv.clearContent();
            Blockly.DropDownDiv.getContentDiv().append(box);
            Blockly.DropDownDiv.showPositionedByBlock(
              workspace,
              workspace.getBlockById(blocks[1])
            );
          }
        });
      } else {
        code.addEventListener("click", () => {
          btn.click();
        });
      }
      span.append(btn, dialog_exports.Text(" "), code);
      return span;
    }
    throw new Error("lpp: unknown value");
  }
  if (dialog_exports.globalStyle) {
    dialog_exports.globalStyle.textContent += `
.lpp-inspector-null {
  color: gray;
  user-select: text;
}
.lpp-inspector-key {
  font-weight: bold;
  user-select: text;
}
.lpp-inspector-key-prototype {
  font-weight: bold;
  color: gray;
  user-select: text;
}
.lpp-inspector-key-constructor {
  color: gray;
  user-select: text;
}
.lpp-inspector-number {
  color: blue;
  user-select: text;
}
.lpp-inspector-string {
  color: green;
  user-select: text;
}
`;
  }

  // src/impl/traceback/index.ts
  var lastNotification;
  function notificationAlert({
    title,
    body,
    tag,
    silent
  }) {
    Notification.requestPermission().then((value) => {
      if (value === "granted") {
        if (lastNotification) {
          lastNotification.close();
          lastNotification = void 0;
          setTimeout(() => notificationAlert({ title, body, tag, silent }));
        } else {
          lastNotification = new Notification(title, {
            body,
            tag,
            silent
          });
          lastNotification.addEventListener("close", () => {
            lastNotification = void 0;
          });
        }
      }
    });
  }
  function showTraceback(svgRoot) {
    let container = document.getElementById("tmpSVGContainer");
    const temp = svgRoot.outerHTML.replace(/&nbsp;/g, " ");
    if (!container) {
      container = document.createElement("div");
      container.id = "tmpSVGContainer";
      container.innerHTML = '<svg id="tmpSVG" xmlns="http://www.w3.org/2000/svg" xmlns:html="http://www.w3.org/1999/xhtml" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" class="blocklySvg"><style type="text/css" ><![CDATA[.blocklyDraggable{font-family: "Helvetica Neue", Helvetica, sans-serif;font-size: 12pt;font-weight: 500;}.blocklyText {fill: #fff;box-sizing: border-box;}.blocklyEditableText .blocklyText{fill: #000;}.blocklyDropdownText.blocklyText{fill: #fff;}]]></style><g id="tmpSVGContent"></g></svg>';
      document.body.appendChild(container);
    }
    const content = document.getElementById("tmpSVGContent");
    if (content && content instanceof SVGGElement) {
      content.innerHTML = temp;
      content.children[0].setAttribute("transform", "");
      const shape = content.children[0].getAttribute("data-shapes") ?? "", shape_hat = shape.includes("hat"), ishat = "hat" !== shape && shape_hat, bbox = content.getBBox();
      let length = shape_hat ? 18 : 0;
      length = ishat ? 21 : length;
      const width = Math.max(750, bbox.width + 1), height = bbox.height + length, svg = document.getElementById("tmpSVG");
      if (svg) {
        svg.setAttribute("width", width.toString());
        svg.setAttribute("height", height.toString());
        svg.setAttribute(
          "viewBox",
          `-1 ${shape_hat ? -length : 0} ${width} ${height}`
        );
        let html = svg.outerHTML;
        html = (html = (html = (html = (html = html.replace(
          /"[\S]+?dropdown-arrow\.svg"/gm,
          '"data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMi43MSIgaGVpZ2h0PSI4Ljc5IiB2aWV3Qm94PSIwIDAgMTIuNzEgOC43OSI+PHRpdGxlPmRyb3Bkb3duLWFycm93PC90aXRsZT48ZyBvcGFjaXR5PSIwLjEiPjxwYXRoIGQ9Ik0xMi43MSwyLjQ0QTIuNDEsMi40MSwwLDAsMSwxMiw0LjE2TDguMDgsOC4wOGEyLjQ1LDIuNDUsMCwwLDEtMy40NSwwTDAuNzIsNC4xNkEyLjQyLDIuNDIsMCwwLDEsMCwyLjQ0LDIuNDgsMi40OCwwLDAsMSwuNzEuNzFDMSwwLjQ3LDEuNDMsMCw2LjM2LDBTMTEuNzUsMC40NiwxMiwuNzFBMi40NCwyLjQ0LDAsMCwxLDEyLjcxLDIuNDRaIiBmaWxsPSIjMjMxZjIwIi8+PC9nPjxwYXRoIGQ9Ik02LjM2LDcuNzlhMS40MywxLjQzLDAsMCwxLTEtLjQyTDEuNDIsMy40NWExLjQ0LDEuNDQsMCwwLDEsMC0yYzAuNTYtLjU2LDkuMzEtMC41Niw5Ljg3LDBhMS40NCwxLjQ0LDAsMCwxLDAsMkw3LjM3LDcuMzdBMS40MywxLjQzLDAsMCwxLDYuMzYsNy43OVoiIGZpbGw9IiNmZmYiLz48L3N2Zz4="'
        )).replace(
          /"[\S]+?green-flag\.svg"/gm,
          '"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIxLjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9ImdyZWVuZmxhZyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiCgkgdmlld0JveD0iMCAwIDI0IDI0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAyNCAyNDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiM0NTk5M0Q7fQoJLnN0MXtmaWxsOiM0Q0JGNTY7fQo8L3N0eWxlPgo8dGl0bGU+Z3JlZW5mbGFnPC90aXRsZT4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTIwLjgsMy43Yy0wLjQtMC4yLTAuOS0wLjEtMS4yLDAuMmMtMiwxLjYtNC44LDEuNi02LjgsMGMtMi4zLTEuOS01LjYtMi4zLTguMy0xVjIuNWMwLTAuNi0wLjUtMS0xLTEKCXMtMSwwLjQtMSwxdjE4LjhjMCwwLjUsMC41LDEsMSwxaDAuMWMwLjUsMCwxLTAuNSwxLTF2LTYuNGMxLTAuNywyLjEtMS4yLDMuNC0xLjNjMS4yLDAsMi40LDAuNCwzLjQsMS4yYzIuOSwyLjMsNywyLjMsOS44LDAKCWMwLjMtMC4yLDAuNC0wLjUsMC40LTAuOVY0LjdDMjEuNiw0LjIsMjEuMywzLjgsMjAuOCwzLjd6IE0yMC41LDEzLjlDMjAuNSwxMy45LDIwLjUsMTMuOSwyMC41LDEzLjlDMTgsMTYsMTQuNCwxNiwxMS45LDE0CgljLTEuMS0wLjktMi41LTEuNC00LTEuNGMtMS4yLDAuMS0yLjMsMC41LTMuNCwxLjFWNEM3LDIuNiwxMCwyLjksMTIuMiw0LjZjMi40LDEuOSw1LjcsMS45LDguMSwwYzAuMSwwLDAuMSwwLDAuMiwwCgljMCwwLDAuMSwwLjEsMC4xLDAuMUwyMC41LDEzLjl6Ii8+CjxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0yMC42LDQuOGwtMC4xLDkuMWMwLDAsMCwwLjEsMCwwLjFjLTIuNSwyLTYuMSwyLTguNiwwYy0xLjEtMC45LTIuNS0xLjQtNC0xLjRjLTEuMiwwLjEtMi4zLDAuNS0zLjQsMS4xVjQKCUM3LDIuNiwxMCwyLjksMTIuMiw0LjZjMi40LDEuOSw1LjcsMS45LDguMSwwYzAuMSwwLDAuMSwwLDAuMiwwQzIwLjUsNC43LDIwLjYsNC43LDIwLjYsNC44eiIvPgo8L3N2Zz4K"'
        )).replace(
          /"[\S]+?repeat\.svg"/gm,
          '"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIxLjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9InJlcGVhdCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiCgkgdmlld0JveD0iMCAwIDI0IDI0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAyNCAyNDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiNDRjhCMTc7fQoJLnN0MXtmaWxsOiNGRkZGRkY7fQo8L3N0eWxlPgo8dGl0bGU+cmVwZWF0PC90aXRsZT4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTIzLjMsMTFjLTAuMywwLjYtMC45LDEtMS41LDFoLTEuNmMtMC4xLDEuMy0wLjUsMi41LTEuMSwzLjZjLTAuOSwxLjctMi4zLDMuMi00LjEsNC4xCgljLTEuNywwLjktMy42LDEuMi01LjUsMC45Yy0xLjgtMC4zLTMuNS0xLjEtNC45LTIuM2MtMC43LTAuNy0wLjctMS45LDAtMi42YzAuNi0wLjYsMS42LTAuNywyLjMtMC4ySDdjMC45LDAuNiwxLjksMC45LDIuOSwwLjkKCXMxLjktMC4zLDIuNy0wLjljMS4xLTAuOCwxLjgtMi4xLDEuOC0zLjVoLTEuNWMtMC45LDAtMS43LTAuNy0xLjctMS43YzAtMC40LDAuMi0wLjksMC41LTEuMmw0LjQtNC40YzAuNy0wLjYsMS43LTAuNiwyLjQsMEwyMyw5LjIKCUMyMy41LDkuNywyMy42LDEwLjQsMjMuMywxMXoiLz4KPHBhdGggY2xhc3M9InN0MSIgZD0iTTIxLjgsMTFoLTIuNmMwLDEuNS0wLjMsMi45LTEsNC4yYy0wLjgsMS42LTIuMSwyLjgtMy43LDMuNmMtMS41LDAuOC0zLjMsMS4xLTQuOSwwLjhjLTEuNi0wLjItMy4yLTEtNC40LTIuMQoJYy0wLjQtMC4zLTAuNC0wLjktMC4xLTEuMmMwLjMtMC40LDAuOS0wLjQsMS4yLTAuMWwwLDBjMSwwLjcsMi4yLDEuMSwzLjQsMS4xczIuMy0wLjMsMy4zLTFjMC45LTAuNiwxLjYtMS41LDItMi42CgljMC4zLTAuOSwwLjQtMS44LDAuMi0yLjhoLTIuNGMtMC40LDAtMC43LTAuMy0wLjctMC43YzAtMC4yLDAuMS0wLjMsMC4yLTAuNGw0LjQtNC40YzAuMy0wLjMsMC43LTAuMywwLjksMEwyMiw5LjgKCWMwLjMsMC4zLDAuNCwwLjYsMC4zLDAuOVMyMiwxMSwyMS44LDExeiIvPgo8L3N2Zz4K"'
        )).replace(
          /"[\S]+?rotate-left\.svg"/gm,
          '"data:image/svg+xml;base64,PHN2ZyBpZD0icm90YXRlLWNsb2Nrd2lzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDojM2Q3OWNjO30uY2xzLTJ7ZmlsbDojZmZmO308L3N0eWxlPjwvZGVmcz48dGl0bGU+cm90YXRlLWNsb2Nrd2lzZTwvdGl0bGU+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMjAuMzQsMTguMjFhMTAuMjQsMTAuMjQsMCwwLDEtOC4xLDQuMjIsMi4yNiwyLjI2LDAsMCwxLS4xNi00LjUyaDBhNS41OCw1LjU4LDAsMCwwLDQuMjUtMi41Myw1LjA2LDUuMDYsMCwwLDAsLjU0LTQuNjJBNC4yNSw0LjI1LDAsMCwwLDE1LjU1LDlhNC4zMSw0LjMxLDAsMCwwLTItLjhBNC44Miw0LjgyLDAsMCwwLDEwLjQsOWwxLjEyLDEuNDFBMS41OSwxLjU5LDAsMCwxLDEwLjM2LDEzSDIuNjdhMS41NiwxLjU2LDAsMCwxLTEuMjYtLjYzQTEuNTQsMS41NCwwLDAsMSwxLjEzLDExTDIuODUsMy41N0ExLjU5LDEuNTksMCwwLDEsNC4zOCwyLjQsMS41NywxLjU3LDAsMCwxLDUuNjIsM0w2LjcsNC4zNWExMC42NiwxMC42NiwwLDAsMSw3LjcyLTEuNjhBOS44OCw5Ljg4LDAsMCwxLDE5LDQuODEsOS42MSw5LjYxLDAsMCwxLDIxLjgzLDksMTAuMDgsMTAuMDgsMCwwLDEsMjAuMzQsMTguMjFaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMTkuNTYsMTcuNjVhOS4yOSw5LjI5LDAsMCwxLTcuMzUsMy44MywxLjMxLDEuMzEsMCwwLDEtLjA4LTIuNjIsNi41Myw2LjUzLDAsMCwwLDUtMi45Miw2LjA1LDYuMDUsMCwwLDAsLjY3LTUuNTEsNS4zMiw1LjMyLDAsMCwwLTEuNjQtMi4xNiw1LjIxLDUuMjEsMCwwLDAtMi40OC0xQTUuODYsNS44NiwwLDAsMCw5LDguODRMMTAuNzQsMTFhLjU5LjU5LDAsMCwxLS40MywxSDIuN2EuNi42LDAsMCwxLS42LS43NUwzLjgxLDMuODNhLjU5LjU5LDAsMCwxLDEtLjIxbDEuNjcsMi4xYTkuNzEsOS43MSwwLDAsMSw3Ljc1LTIuMDcsOC44NCw4Ljg0LDAsMCwxLDQuMTIsMS45Miw4LjY4LDguNjgsMCwwLDEsMi41NCwzLjcyQTkuMTQsOS4xNCwwLDAsMSwxOS41NiwxNy42NVoiLz48L3N2Zz4="'
        )).replace(
          /"[\S]+?rotate-right\.svg"/gm,
          '"data:image/svg+xml;base64,PHN2ZyBpZD0icm90YXRlLWNvdW50ZXItY2xvY2t3aXNlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiMzZDc5Y2M7fS5jbHMtMntmaWxsOiNmZmY7fTwvc3R5bGU+PC9kZWZzPjx0aXRsZT5yb3RhdGUtY291bnRlci1jbG9ja3dpc2U8L3RpdGxlPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTIyLjY4LDEyLjJhMS42LDEuNiwwLDAsMS0xLjI3LjYzSDEzLjcyYTEuNTksMS41OSwwLDAsMS0xLjE2LTIuNThsMS4xMi0xLjQxYTQuODIsNC44MiwwLDAsMC0zLjE0LS43Nyw0LjMxLDQuMzEsMCwwLDAtMiwuOCw0LjI1LDQuMjUsMCwwLDAtMS4zNCwxLjczLDUuMDYsNS4wNiwwLDAsMCwuNTQsNC42MkE1LjU4LDUuNTgsMCwwLDAsMTIsMTcuNzRoMGEyLjI2LDIuMjYsMCwwLDEtLjE2LDQuNTJBMTAuMjUsMTAuMjUsMCwwLDEsMy43NCwxOCwxMC4xNCwxMC4xNCwwLDAsMSwyLjI1LDguNzgsOS43LDkuNywwLDAsMSw1LjA4LDQuNjQsOS45Miw5LjkyLDAsMCwxLDkuNjYsMi41YTEwLjY2LDEwLjY2LDAsMCwxLDcuNzIsMS42OGwxLjA4LTEuMzVhMS41NywxLjU3LDAsMCwxLDEuMjQtLjYsMS42LDEuNiwwLDAsMSwxLjU0LDEuMjFsMS43LDcuMzdBMS41NywxLjU3LDAsMCwxLDIyLjY4LDEyLjJaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMjEuMzgsMTEuODNIMTMuNzdhLjU5LjU5LDAsMCwxLS40My0xbDEuNzUtMi4xOWE1LjksNS45LDAsMCwwLTQuNy0xLjU4LDUuMDcsNS4wNywwLDAsMC00LjExLDMuMTdBNiw2LDAsMCwwLDcsMTUuNzdhNi41MSw2LjUxLDAsMCwwLDUsMi45MiwxLjMxLDEuMzEsMCwwLDEtLjA4LDIuNjIsOS4zLDkuMywwLDAsMS03LjM1LTMuODJBOS4xNiw5LjE2LDAsMCwxLDMuMTcsOS4xMiw4LjUxLDguNTEsMCwwLDEsNS43MSw1LjQsOC43Niw4Ljc2LDAsMCwxLDkuODIsMy40OGE5LjcxLDkuNzEsMCwwLDEsNy43NSwyLjA3bDEuNjctMi4xYS41OS41OSwwLDAsMSwxLC4yMUwyMiwxMS4wOEEuNTkuNTksMCwwLDEsMjEuMzgsMTEuODNaIi8+PC9zdmc+"'
        );
        const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
          html
        )}`;
        document.body.removeChild(container);
        console.log(
          "%c ",
          `font-size: 1px; padding-right: ${width}px; padding-bottom: ${height}px; background-image: url('${svgUrl}'); background-repeat: no-repeat; background-size: contain; color: transparent;`
        );
      }
    }
  }
  function warnError(Blockly, vm, translate, error, id, target) {
    if (Blockly) {
      if (vm.runtime.getEditingTarget()?.id !== target && vm.runtime.getTargetById(target)) {
        vm.setEditingTarget(target);
      }
      const workspace = Blockly.getMainWorkspace();
      workspace.centerOnBlock(id, true);
      let original = "";
      const div = show(
        Blockly,
        id,
        [
          IconGroup([
            HelpIcon(
              translate({
                id: "lpp.tooltip.button.help.more",
                default: "Show detail.",
                description: "Show detail button."
              }),
              translate({
                id: "lpp.tooltip.button.help.less",
                default: "Hide detail.",
                description: "Hide detail button."
              }),
              () => {
                if (div) {
                  const v = div.getElementsByClassName("lpp-hint")[0];
                  if (v) {
                    original = v.textContent ?? "";
                    v.textContent = `\u{1F4A1} ${translate({
                      id: `lpp.error.${error}.detail`,
                      default: `Text [lpp.error.${error}.detail]`,
                      description: "Error detail message."
                    })}`;
                  }
                }
              },
              () => {
                if (div) {
                  const v = div.getElementsByClassName("lpp-hint")[0];
                  if (v) {
                    v.textContent = original;
                  }
                }
              }
            ),
            CloseIcon(
              Blockly,
              translate({
                id: "lpp.tooltip.button.close",
                default: "Close this hint.",
                description: "Close button."
              })
            )
          ]),
          Title(
            `\u2139\uFE0F ${translate({
              id: `lpp.error.${error}.summary`,
              default: `Text [lpp.error.${error}.summary]`,
              description: "Error summary message."
            })}`
          ),
          document.createElement("br"),
          Text(
            `\u{1F50D} ${translate({ id: "lpp.error.hint", default: "For further information please check DevTools Console.", description: "Open DevTools hint." })}`,
            "lpp-hint"
          )
        ],
        "left"
      );
      if (!div) {
        notificationAlert({
          title: `\u274C ${translate({
            id: `lpp.error.${error}.summary`,
            default: `Text [lpp.error.${error}.summary]`,
            description: "Error summary message."
          })}`,
          body: `\u{1F4CC} ${translate({
            id: "lpp.error.position",
            default: "Position:",
            description: "Position indicator."
          })} ${id}
\u{1F50D} ${translate({ id: "lpp.error.hint", default: "For further information please check DevTools Console.", description: "Open DevTools hint." })}`,
          tag: "lppError",
          silent: false
        });
      }
    } else {
      notificationAlert({
        title: `\u274C ${translate({ id: "lpp.error.releaseMode.summary", default: "The code encountered an error while running.", description: "Release mode error message." })}`,
        body: `\u2139\uFE0F ${translate({
          id: "lpp.error.releaseMode.detail",
          default: "The program may not work as intended. Please contact project maintainers with this message for help.",
          description: "Release mode error hint."
        })}
\u{1F50D} ${translate({ id: "lpp.error.hint", default: "For further information please check DevTools Console.", description: "Open DevTools hint." })}`,
        tag: "lppError",
        silent: true
      });
    }
    console.groupCollapsed(
      `\u274C ${translate({
        id: `lpp.error.${error}.summary`,
        default: `Text [lpp.error.${error}.summary]`,
        description: "Error summary message."
      })}`
    );
    if (Blockly) {
      console.log(
        `\u{1F4A1} ${translate({
          id: `lpp.error.${error}.detail`,
          default: `Text [lpp.error.${error}.detail]`,
          description: "Error detail message."
        })}`
      );
      const block = Blockly.getMainWorkspace()?.getBlockById(id);
      const svgRoot = block?.getSvgRoot();
      console.groupCollapsed(
        `\u{1F4CC} ${translate({
          id: "lpp.error.position",
          default: "Position:",
          description: "Position indicator."
        })} ${id}`
      );
      if (svgRoot) {
        showTraceback(svgRoot);
        console.log(svgRoot);
      } else {
        console.log(
          `\u2753 ${translate({ id: "lpp.error.blockNotFound", default: "Unable to find the block in Blockly workspace. The block might not belong to the target that you are currently editing.", description: "Block not found hint." })}`
        );
      }
      console.groupEnd();
    } else {
      console.log(
        `\u2139\uFE0F ${translate({
          id: "lpp.error.releaseMode.detail",
          default: "The program may not work as intended. Please contact project maintainers with this message for help.",
          description: "Release mode error hint."
        })}`
      );
      console.log(
        `\u{1F4CC} ${translate({
          id: "lpp.error.position",
          default: "Position:",
          description: "Position indicator."
        })} ${id}`
      );
    }
    console.groupEnd();
  }
  function warnException(Blockly, vm, translate, exception) {
    if (Blockly) {
      const getTraceback = () => {
        const text = [];
        text.push(
          `\u{1F4A1} ${translate({
            id: "lpp.error.uncaughtException.detail",
            default: "Please use try-catch block to catch exceptions or the code will stop execution.",
            description: "Uncaught exception summary."
          })}`,
          document.createElement("br"),
          document.createElement("br")
        );
        text.push(
          `\u{1F914} ${translate({ id: "lpp.error.uncaughtException.exception", default: "Exception:", description: "Exception hint." })}`,
          document.createElement("br"),
          Inspector(Blockly, vm, translate, exception.value),
          // TODO: Better design
          document.createElement("br")
        );
        text.push(
          `\u{1F47E} ${translate({ id: "lpp.error.uncaughtException.traceback", default: "Traceback:", description: "Traceback hint." })}`
        );
        const list = document.createElement("ul");
        list.classList.add("lpp-list");
        for (const [index, value] of exception.stack.entries()) {
          const li = document.createElement("li");
          const traceback = document.createElement("span");
          traceback.classList.add("lpp-code");
          if (Blockly && value instanceof LppTraceback2.Block) {
            if (vm.runtime.getTargetById(value.target)) {
              const workspace = Blockly.getMainWorkspace();
              traceback.classList.add("lpp-traceback-stack-enabled");
              traceback.title = translate({
                id: "lpp.tooltip.button.scrollToBlockEnabled",
                default: "Scroll to this block.",
                description: "Scroll button text."
              });
              traceback.addEventListener("click", () => {
                const box = Blockly.DropDownDiv.getContentDiv().getElementsByClassName(
                  "valueReportBox"
                )[0];
                vm.setEditingTarget(value.target);
                workspace.centerOnBlock(value.block, true);
                Blockly.DropDownDiv.hideWithoutAnimation();
                Blockly.DropDownDiv.clearContent();
                Blockly.DropDownDiv.getContentDiv().append(box);
                Blockly.DropDownDiv.showPositionedByBlock(
                  workspace,
                  workspace.getBlockById(value.block)
                );
              });
            } else {
              traceback.classList.add("lpp-traceback-stack-disabled");
              traceback.title = translate({
                id: "lpp.tooltip.button.scrollToBlockDisabled",
                default: "Unable to find this block in project.",
                description: "Block not found (for serialized fn) hint."
              });
            }
          } else if (value instanceof LppTraceback2.NativeFn) {
            traceback.title = translate({
              id: "lpp.tooltip.button.nativeFn",
              default: "This is native function. For further information please check DevTools Console.",
              description: "Native function hint."
            });
          }
          traceback.textContent = value.toString();
          li.append(`\u{1F4CC} ${index} \u27A1\uFE0F `, traceback);
          list.append(li);
        }
        text.push(list);
        return text;
      };
      let flag = false;
      for (const stack of exception.stack.toReversed()) {
        if (stack instanceof LppTraceback2.Block && vm.runtime.getTargetById(stack.target)) {
          vm.setEditingTarget(stack.target);
          const workspace = Blockly.getMainWorkspace();
          workspace.centerOnBlock(stack.block, true);
          let original = "";
          const div = show(
            Blockly,
            stack.block,
            [
              IconGroup([
                HelpIcon(
                  translate({
                    id: "lpp.tooltip.button.help.more",
                    default: "Show detail.",
                    description: "Show detail button."
                  }),
                  translate({
                    id: "lpp.tooltip.button.help.less",
                    default: "Hide detail.",
                    description: "Hide detail button."
                  }),
                  () => {
                    if (div) {
                      const v = div.getElementsByClassName("lpp-hint")[0];
                      if (v) {
                        original = v.textContent ?? "";
                        while (v.firstChild)
                          v.removeChild(v.firstChild);
                        v.append(...getTraceback());
                      }
                    }
                  },
                  () => {
                    if (div) {
                      const v = div.getElementsByClassName("lpp-hint")[0];
                      if (v) {
                        v.textContent = original;
                      }
                    }
                  }
                ),
                CloseIcon(
                  Blockly,
                  translate({
                    id: "lpp.tooltip.button.close",
                    default: "Close this hint.",
                    description: "Close button."
                  })
                )
              ]),
              Title(
                `\u2139\uFE0F ${translate({ id: "lpp.error.uncaughtException.summary", default: "Uncaught exception.", description: "Uncaught exception hint." })}`
              ),
              document.createElement("br"),
              Text(
                `\u{1F50D} ${translate({ id: "lpp.error.hint", default: "For further information please check DevTools Console.", description: "Open DevTools hint." })}`,
                "lpp-hint"
              )
            ],
            "left"
          );
          flag = !!div;
          break;
        }
      }
      if (!flag)
        notificationAlert({
          title: `\u274C ${translate({ id: "lpp.error.uncaughtException.summary", default: "Uncaught exception.", description: "Uncaught exception hint." })}`,
          body: `\u{1F4A1} ${translate({
            id: "lpp.error.uncaughtException.detail",
            default: "Please use try-catch block to catch exceptions or the code will stop execution.",
            description: "Uncaught exception summary."
          })}
\u{1F50D} ${translate({ id: "lpp.error.hint", default: "For further information please check DevTools Console.", description: "Open DevTools hint." })}`,
          tag: "lppError",
          silent: false
        });
    } else {
      notificationAlert({
        title: `\u274C ${translate({ id: "lpp.error.releaseMode.summary", default: "The code encountered an error while running.", description: "Release mode error message." })}`,
        body: `\u2139\uFE0F ${translate({
          id: "lpp.error.releaseMode.detail",
          default: "The program may not work as intended. Please contact project maintainers with this message for help.",
          description: "Release mode error hint."
        })}
\u{1F50D} ${translate({ id: "lpp.error.hint", default: "For further information please check DevTools Console.", description: "Open DevTools hint." })}`,
        tag: "lppError",
        silent: true
      });
    }
    console.groupCollapsed(
      `\u274C ${translate({ id: "lpp.error.uncaughtException.summary", default: "Uncaught exception.", description: "Uncaught exception hint." })}`
    );
    if (Blockly)
      console.log(
        `\u{1F4A1} ${translate({
          id: "lpp.error.uncaughtException.detail",
          default: "Please use try-catch block to catch exceptions or the code will stop execution.",
          description: "Uncaught exception summary."
        })}`
      );
    else
      console.log(
        `\u2139\uFE0F ${translate({
          id: "lpp.error.releaseMode.detail",
          default: "The program may not work as intended. Please contact project maintainers with this message for help.",
          description: "Release mode error hint."
        })}`
      );
    console.log(
      `\u{1F914} ${translate({ id: "lpp.error.uncaughtException.exception", default: "Exception:", description: "Exception hint." })}`,
      exception.value
    );
    console.groupCollapsed(
      `\u{1F47E} ${translate({ id: "lpp.error.uncaughtException.traceback", default: "Traceback:", description: "Traceback hint." })}`
    );
    for (const [idx, value] of exception.stack.entries()) {
      if (Blockly) {
        if (value instanceof LppTraceback2.Block) {
          const block = Blockly.getMainWorkspace()?.getBlockById(
            value.block
          );
          const svgRoot = block?.getSvgRoot();
          console.groupCollapsed(`\u{1F4CC} ${idx + 1} \u27A1\uFE0F`, value.block);
          if (svgRoot) {
            showTraceback(svgRoot);
            console.log(svgRoot);
          } else {
            console.log(
              `\u2753 ${translate({ id: "lpp.error.blockNotFound", default: "Unable to find the block in Blockly workspace. The block might not belong to the target that you are currently editing.", description: "Block not found hint." })}`
            );
          }
          if (value.context)
            console.log(
              `\u{1F6E0}\uFE0F ${translate({ id: "lpp.error.context", default: "Context:", description: "Context hint." })}`,
              value.context
            );
          console.groupEnd();
        } else if (value instanceof LppTraceback2.NativeFn) {
          console.groupCollapsed(`\u{1F4CC} ${idx + 1} \u27A1\uFE0F`, value.fn);
          console.log(
            `\u{1F6E0}\uFE0F ${translate({ id: "lpp.error.self", default: "This:", description: "Self object hint." })}`,
            value.self
          );
          console.log(
            `\u{1F6E0}\uFE0F ${translate({ id: "lpp.error.arguments", default: "Arguments:", description: "Arguments hint." })}`,
            value.args
          );
          console.groupEnd();
        } else {
          console.log(`\u{1F4CC} ${idx + 1} \u27A1\uFE0F`, value.toString());
        }
      } else {
        console.log(`\u{1F4CC} ${idx + 1} \u27A1\uFE0F`, value.toString());
      }
    }
    console.groupEnd();
    console.groupEnd();
  }
  if (globalStyle) {
    globalStyle.textContent += `
.lpp-list {
  list-style-type: disc;
  padding: 0;
  margin-left: 19.5px;
  margin-top: 4px;
  margin-bottom: 0;
}
.lpp-list li {
  line-height: 100%;
  margin-top: 0;
  margin-bottom: 4px;
}
.lpp-code {
  font-family: "Source Code Pro", "Fira Code", "DejaVu Sans Mono", "Cascadia Code", "Jetbrains Mono", "Lucida Console", Consolas, monospace;
}
.lpp-traceback-stack-enabled {
  transition: color 0.25s ease-out;
}
.lpp-traceback-stack-disabled {
  transition: color 0.25s ease-out;
}
.lpp-traceback-stack-enabled:hover {
  cursor: pointer;
  color: gray;
  user-select: text;
}
.lpp-traceback-stack-disabled:hover {
  cursor: not-allowed;
  color: red;
  user-select: text;
}
`;
  }

  // src/impl/blockly/extension.ts
  var Button = class {
    /**
     * Construct a button.
     * @param id Button ID.
     * @param lazyText A function that returns button text.
     */
    constructor(id, lazyText) {
      this.id = id;
      this.lazyText = lazyText;
    }
    inject() {
    }
    export() {
      return [
        {
          func: this.id,
          // Turbowarp extension
          blockType: "button",
          text: this.lazyText()
        }
      ];
    }
  };
  var Category = class {
    /**
     * Construct a category.
     * @param lazyLabel A function that returns category label.
     */
    constructor(lazyLabel) {
      this.lazyLabel = lazyLabel;
      this.block = /* @__PURE__ */ new Map();
    }
    block;
    /**
     * Inject blocks to Blockly. Can be called multiple times for mixin.
     * @param Blockly Blockly instance.
     * @param extension Parent extension.
     */
    inject(Blockly, extension) {
      const prepatch = (block) => {
        block.setCategory(extension.id);
        block.setInputsInline(true);
        block.setColour(extension.color);
      };
      for (const [key, value] of this.block.entries()) {
        const map = value.init(Blockly, null);
        const res = {};
        if (typeof map === "function") {
          res.init = function(...args) {
            if (!(this instanceof Blockly.Block)) {
              return;
            }
            prepatch(this);
            const fn = value.init(Blockly, this);
            return fn(...args);
          };
        } else {
          for (const method of Object.keys(map)) {
            res[method] = function(...args) {
              if (!(this instanceof Blockly.Block)) {
                return;
              }
              if (method === "init") {
                prepatch(this);
              }
              const map2 = value.init(Blockly, this);
              return map2[method].apply(window, args);
            };
          }
        }
        Reflect.defineProperty(Blockly.Blocks, `${extension.id}_${key}`, {
          get() {
            return res;
          },
          set() {
          },
          configurable: true
        });
      }
    }
    /**
     * Register a block under a category.
     * @param name Block name (ID).
     * @param block Block descriptor.
     * @returns This for chaining.
     */
    register(name, block) {
      this.block.set(name, block);
      return this;
    }
    /**
     * Export blocks as Scratch metadata.
     * @returns Scratch metadata.
     */
    export() {
      return [
        {
          blockType: "label",
          text: this.lazyLabel()
        }
      ].concat(
        Array.from(this.block.entries()).map(([opcode, value]) => ({
          blockType: value.type,
          opcode,
          text: "",
          arguments: {}
        }))
      );
    }
  };
  var Extension = class {
    /**
     * Construct an extension.
     * @param id Extension id.
     * @param color Block color (experimental).
     */
    constructor(id, color) {
      this.id = id;
      this.color = color;
    }
    blocks = [];
    /**
     * Register an button, category, etc.
     * @param block Object to register.
     * @returns This for chaining.
     */
    register(block) {
      this.blocks.push(block);
      return this;
    }
    /**
     * Inject blocks to Blockly. Can be called multiple times for mixin.
     * @param Blockly
     */
    inject(Blockly) {
      for (const v of this.blocks) {
        v.inject(Blockly, this);
      }
    }
    /**
     * Export blocks as Scratch metadata.
     * @returns Scratch metadata.
     */
    export() {
      return this.blocks.map((v) => v.export()).flat(1);
    }
  };

  // src/impl/blockly/middleware.ts
  function _ReporterBase(fn, type) {
    const prepatch = (Blockly, block) => {
      block.setOutput(true, "String");
      block.setOutputShape(
        type === "square" ? Blockly.OUTPUT_SHAPE_SQUARE : Blockly.OUTPUT_SHAPE_ROUND
      );
    };
    return {
      init(Blockly, block) {
        const map = fn(Blockly, block);
        if (typeof map === "function") {
          return (...args) => {
            prepatch(Blockly, block);
            return map(...args);
          };
        } else if (map.init) {
          const _init = map.init;
          map.init = (...args) => {
            prepatch(Blockly, block);
            return _init(...args);
          };
        }
        return map;
      },
      type: "reporter"
    };
  }
  function Command(fn, isTerminal = false) {
    const prepatch = (Blockly, block) => {
      block.setNextStatement(!isTerminal);
      block.setPreviousStatement(true);
      block.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE);
    };
    return {
      init(Blockly, block) {
        const map = fn(Blockly, block);
        if (typeof map === "function") {
          return (...args) => {
            prepatch(Blockly, block);
            return map(...args);
          };
        } else if (map.init) {
          const _init = map.init;
          map.init = (...args) => {
            prepatch(Blockly, block);
            return _init(...args);
          };
        }
        return map;
      },
      type: "command"
    };
  }
  var Reporter;
  ((Reporter2) => {
    function Square(fn) {
      return _ReporterBase(fn, "square");
    }
    Reporter2.Square = Square;
    function Round(fn) {
      return _ReporterBase(fn, "round");
    }
    Reporter2.Round = Round;
  })(Reporter || (Reporter = {}));

  // src/impl/blockly/input.ts
  var input_exports = {};
  __export(input_exports, {
    Any: () => Any,
    Statement: () => Statement,
    String: () => String2,
    Text: () => Text2
  });
  function addShadow(field, value) {
    const elem = document.createElement("shadow");
    const child = document.createElement("field");
    elem.setAttribute("type", "text");
    child.setAttribute("name", "TEXT");
    child.textContent = value;
    elem.appendChild(child);
    field.connection.setShadowDom(elem);
    field.connection.respawnShadow_();
    return field;
  }
  function addNullShadow(field) {
    field.connection.setShadowDom(null);
    field.connection.respawnShadow_();
    return field;
  }
  function String2(block, name, value) {
    const field = block.appendValueInput(name);
    const workspace = block.workspace;
    if (block.isInsertionMarker() || workspace.currentGesture_?.isDraggingBlock_ && workspace.currentGesture_?.targetBlock_?.type === block.type)
      return field;
    return addShadow(field, value);
  }
  function Any(block, name) {
    const field = block.appendValueInput(name);
    const workspace = block.workspace;
    if (block.isInsertionMarker() || workspace.currentGesture_?.isDraggingBlock_ && workspace.currentGesture_?.targetBlock_?.type === block.type)
      return field;
    return addNullShadow(field);
  }
  function Text2(block, name, value) {
    if (typeof value === "string")
      return Text2(block, name, [value]);
    const input = block.appendDummyInput(name);
    value.forEach((value2) => input.appendField(value2));
    return input;
  }
  function Statement(block, name) {
    return block.appendStatementInput(name);
  }

  // src/impl/block.ts
  function isMutableBlock(block) {
    const v = block;
    return typeof v.length === "number";
  }
  var initalizeField = /* @__PURE__ */ (() => {
    let cache;
    return function initalizeField2(Blockly) {
      const scratchBlocks = Blockly;
      const v = Blockly.FieldImage;
      return cache ?? (cache = class FieldImageButton extends v {
        /**
         * Construct a FieldImageButton field.
         * @param src Image source URL.
         * @param width Image width.
         * @param height Image height.
         * @param callback Click callback.
         * @param opt_alt Alternative text of the image.
         * @param flip_rtl Whether to filp the image horizontally when in RTL mode.
         * @param padding Whether the field has padding.
         */
        constructor(src, width, height, callback, opt_alt, flip_rtl, padding) {
          super(src, width, height, opt_alt, flip_rtl);
          this.callback = callback;
          this.padding = padding;
        }
        /**
         * Initalize the field.
         */
        init() {
          if (this.fieldGroup_) {
            return;
          }
          super.init();
          this.mouseDownWrapper_ = scratchBlocks.bindEventWithChecks_(
            this.getSvgRoot(),
            "mousedown",
            this,
            this.onMouseDown_
          );
          const svgRoot = this.getSvgRoot();
          if (svgRoot) {
            svgRoot.style.cursor = "pointer";
          }
        }
        /**
         * Click handler.
         */
        showEditor_() {
          if (this.callback) {
            this.callback();
          }
        }
        /**
         * Calculates the size of the field.
         * @returns Size of the field.
         */
        getSize() {
          if (!this.size_.width) {
            this.render_();
          }
          if (this.padding)
            return this.size_;
          return new this.size_.constructor(
            Math.max(1, this.size_.width - scratchBlocks.BlockSvg.SEP_SPACE_X),
            this.size_.height
          );
        }
        EDITABLE = true;
      });
    };
  })();
  var plusImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMTggMTBoLTR2LTRjMC0xLjEwNC0uODk2LTItMi0ycy0yIC44OTYtMiAybC4wNzEgNGgtNC4wNzFjLTEuMTA0IDAtMiAuODk2LTIgMnMuODk2IDIgMiAybDQuMDcxLS4wNzEtLjA3MSA0LjA3MWMwIDEuMTA0Ljg5NiAyIDIgMnMyLS44OTYgMi0ydi00LjA3MWw0IC4wNzFjMS4xMDQgMCAyLS44OTYgMi0ycy0uODk2LTItMi0yeiIgZmlsbD0id2hpdGUiIC8+PC9zdmc+Cg==";
  var minusImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMTggMTFoLTEyYy0xLjEwNCAwLTIgLjg5Ni0yIDJzLjg5NiAyIDIgMmgxMmMxLjEwNCAwIDItLjg5NiAyLTJzLS44OTYtMi0yLTJ6IiBmaWxsPSJ3aGl0ZSIgLz48L3N2Zz4K";
  function defineExtension(id, color, runtime, translate) {
    const Plus = (Blockly, block) => {
      const FieldImageButton = initalizeField(Blockly);
      return new FieldImageButton(
        plusImage,
        15,
        15,
        () => {
          Blockly.Events.setGroup(true);
          if (block.mutationToDom && block.domToMutation) {
            const state = block.mutationToDom();
            const oldExtraState = Blockly.Xml.domToText(state);
            const length = state.getAttribute("length");
            if (length !== null) {
              state.setAttribute("length", String(parseInt(length, 10) + 1));
            }
            block.domToMutation(state);
            block.initSvg();
            block.render();
            Blockly.Events.fire(
              new Blockly.Events.BlockChange(
                block,
                "mutation",
                "length",
                oldExtraState,
                Blockly.Xml.domToText(block.mutationToDom())
              )
            );
          }
          Blockly.Events.setGroup(false);
        },
        "+",
        false,
        true
      );
    };
    const Minus = (Blockly, block) => {
      const FieldImageButton = initalizeField(Blockly);
      return new FieldImageButton(
        minusImage,
        15,
        15,
        () => {
          Blockly.Events.setGroup(true);
          if (block.mutationToDom && block.domToMutation) {
            const state = block.mutationToDom();
            const oldExtraState = Blockly.Xml.domToText(state);
            const length = state.getAttribute("length");
            if (length !== null) {
              state.setAttribute(
                "length",
                String(Math.max(0, parseInt(length, 10) - 1))
              );
            }
            block.domToMutation(state);
            block.initSvg();
            block.render();
            Blockly.Events.fire(
              new Blockly.Events.BlockChange(
                block,
                "mutation",
                "length",
                oldExtraState,
                Blockly.Xml.domToText(block.mutationToDom())
              )
            );
          }
          Blockly.Events.setGroup(false);
        },
        "-",
        false,
        true
      );
    };
    const updateButton = (Blockly, block, minValue = 0, maxValue = Infinity) => {
      if (block.length !== void 0) {
        block.removeInput("MINUS", true);
        block.removeInput("PLUS", true);
        const start = block.inputList[0]?.name;
        if (block.length < maxValue) {
          block.appendDummyInput("PLUS").appendField(Plus(Blockly, block));
          if (start)
            block.moveInputBefore("PLUS", start);
        }
        if (block.length > minValue) {
          block.appendDummyInput("MINUS").appendField(Minus(Blockly, block));
          if (start)
            block.moveInputBefore("MINUS", start);
        }
      }
    };
    function cleanInputs(id2, targetInput) {
      const target = runtime.getEditingTarget();
      if (!target)
        return;
      const block = target.blocks.getBlock(id2);
      if (!block)
        return;
      const inputs = block.inputs;
      for (const name of Object.keys(inputs)) {
        const input = inputs[name];
        if (targetInput.includes(name)) {
          const blocks = target.blocks;
          blocks.deleteBlock(input.block);
          blocks.deleteBlock(input.shadow);
          delete inputs[name];
        }
      }
    }
    return new Extension(id, color).register(
      /// Documentation
      new Button(
        "documentation",
        () => `\u{1F4C4} ${translate({ id: "lpp.documentation", default: "Open documentation", description: "Documentation button." })}`
      )
    ).register(
      /// Builtin
      new Category(
        () => `#\uFE0F\u20E3 ${translate({ id: "lpp.category.builtin", default: "Builtin", description: "Builtin category." })}`
      ).register(
        "builtinType",
        Reporter.Round((Blockly, block) => () => {
          block.setTooltip(
            translate({
              id: "lpp.tooltip.builtin.type",
              default: "Predefined builtin data types. Includes everything which language feature requires.",
              description: "Builtin types tooltip."
            })
          );
          block.appendDummyInput().appendField(
            new Blockly.FieldDropdown([
              ["Boolean", "Boolean"],
              ["Number", "Number"],
              ["String", "String"],
              ["Array", "Array"],
              ["Object", "Object"],
              ["Function", "Function"],
              ["Promise", "Promise"]
            ]),
            "value"
          );
        })
      ).register(
        "builtinError",
        Reporter.Round((Blockly, block) => () => {
          block.setTooltip(
            translate({
              id: "lpp.tooltip.builtin.error",
              default: "Predefined builtin error types. Includes all errors which builtin classes throw.",
              description: "Builtin errors tooltip."
            })
          );
          block.appendDummyInput().appendField(
            new Blockly.FieldDropdown([
              ["Error", "Error"],
              ["IllegalInvocationError", "IllegalInvocationError"],
              ["SyntaxError", "SyntaxError"]
            ]),
            "value"
          );
        })
      ).register(
        "builtinUtility",
        Reporter.Round((Blockly, block) => () => {
          block.setTooltip(
            translate({
              id: "lpp.tooltip.builtin.utility",
              default: "Predefined builtin utility types. Includes methods to process data.",
              description: "Builtin utilities tooltip."
            })
          );
          block.appendDummyInput().appendField(
            new Blockly.FieldDropdown([
              ["JSON", "JSON"],
              ["Math", "Math"]
            ]),
            "value"
          );
        })
      )
    ).register(
      /// Construct
      new Category(
        () => `\u{1F6A7} ${translate({ id: "lpp.category.construct", default: "Construction", description: "Construction category." })}`
      ).register(
        "constructLiteral",
        Reporter.Round((Blockly, block) => () => {
          block.setTooltip(
            translate({
              id: "lpp.tooltip.construct.literal",
              default: "Construct special literals in lpp.",
              description: "Literal tooltip."
            })
          );
          block.appendDummyInput().appendField(
            new Blockly.FieldDropdown([
              ["null", "null"],
              ["true", "true"],
              ["false", "false"],
              ["NaN", "NaN"],
              ["Infinity", "Infinity"]
            ]),
            "value"
          );
        })
      ).register(
        "constructNumber",
        Reporter.Square((_, block) => () => {
          block.setTooltip(
            translate({
              id: "lpp.tooltip.construct.Number",
              default: "Construct a Number object by Scratch literal.",
              description: "Number constructor tooltip."
            })
          );
          input_exports.Text(block, "BEGIN", [
            translate({
              id: "lpp.block.construct.Number",
              default: "Number",
              description: "Number constructor block."
            }),
            "("
          ]);
          input_exports.String(block, "value", "10");
          input_exports.Text(block, "END", `)`);
        })
      ).register(
        "constructString",
        Reporter.Square((_, block) => () => {
          block.setTooltip(
            translate({
              id: "lpp.tooltip.construct.String",
              default: "Construct a String object by Scratch literal.",
              description: "String constructor tooltip."
            })
          );
          input_exports.Text(block, "BEGIN", [
            translate({
              id: "lpp.block.construct.String",
              default: "String",
              description: "String constructor block."
            }),
            "("
          ]);
          input_exports.String(block, "value", "\u{1F31F}");
          input_exports.Text(block, "END", `)`);
        })
      ).register(
        "constructArray",
        Reporter.Square((Blockly, block) => ({
          init() {
            block.setTooltip(
              translate({
                id: "lpp.tooltip.construct.Array",
                default: 'Construct an Array object with specified structure. Use "+" to add or "-" to remove an element.',
                description: "Array constructor tooltip."
              })
            );
            const property = block;
            input_exports.Text(block, "BEGIN", "[");
            input_exports.Text(block, "END", "]");
            property.length = 0;
            updateButton(Blockly, property);
          },
          mutationToDom() {
            const elem = document.createElement("mutation");
            if (isMutableBlock(block)) {
              elem.setAttribute("length", String(block.length));
            }
            return elem;
          },
          domToMutation(mutation) {
            const length = parseInt(
              mutation.getAttribute("length") ?? "0",
              10
            );
            if (isMutableBlock(block)) {
              if (length > block.length) {
                for (let i = block.length; i < length; i++) {
                  if (i > 0) {
                    block.appendDummyInput(`COMMA_${i}`).appendField(",");
                    block.moveInputBefore(`COMMA_${i}`, "END");
                  }
                  input_exports.Any(block, `ARG_${i}`);
                  block.moveInputBefore(`ARG_${i}`, "END");
                }
              } else {
                const removeList = [];
                for (let i = length; i < block.length; i++) {
                  block.removeInput(`ARG_${i}`, true);
                  block.removeInput(`COMMA_${i}`, true);
                  removeList.push(`ARG_${i}`, `COMMA_${i}`);
                }
                cleanInputs(block.id, removeList);
              }
              block.length = length;
              updateButton(Blockly, block);
            }
          }
        }))
      ).register(
        "constructObject",
        Reporter.Square((Blockly, block) => ({
          init() {
            block.setTooltip(
              translate({
                id: "lpp.tooltip.construct.Object",
                default: 'Construct an Object object with specified structure. Use "+" to add or "-" to remove an element.',
                description: "Object constructor tooltip."
              })
            );
            const property = block;
            input_exports.Text(block, "BEGIN", "{");
            input_exports.Text(block, "END", "}");
            property.length = 0;
            updateButton(Blockly, property);
          },
          mutationToDom() {
            const elem = document.createElement("mutation");
            if (isMutableBlock(block)) {
              elem.setAttribute("length", String(block.length));
            }
            return elem;
          },
          domToMutation(mutation) {
            const length = parseInt(
              mutation.getAttribute("length") ?? "0",
              10
            );
            if (isMutableBlock(block)) {
              if (length > block.length) {
                for (let i = block.length; i < length; i++) {
                  if (i > 0) {
                    block.appendDummyInput(`COMMA_${i}`).appendField(",");
                    block.moveInputBefore(`COMMA_${i}`, "END");
                  }
                  input_exports.String(block, `KEY_${i}`, "");
                  input_exports.Text(block, `COLON_${i}`, ":");
                  input_exports.Any(block, `VALUE_${i}`);
                  block.moveInputBefore(`VALUE_${i}`, "END");
                  block.moveInputBefore(`COLON_${i}`, `VALUE_${i}`);
                  block.moveInputBefore(`KEY_${i}`, `COLON_${i}`);
                }
              } else {
                const removeList = [];
                for (let i = length; i < block.length; i++) {
                  block.removeInput(`KEY_${i}`, true);
                  block.removeInput(`COLON_${i}`, true);
                  block.removeInput(`VALUE_${i}`, true);
                  block.removeInput(`COMMA_${i}`, true);
                  removeList.push(
                    `KEY_${i}`,
                    `COLON_${i}`,
                    `VALUE_${i}`,
                    `COMMA_${i}`
                  );
                }
                cleanInputs(block.id, removeList);
              }
              block.length = length;
              updateButton(Blockly, block);
            }
          }
        }))
      ).register(
        "constructFunction",
        Reporter.Square((Blockly, block) => ({
          init() {
            block.setTooltip(
              translate({
                id: "lpp.tooltip.construct.Function",
                default: 'Construct an Function object. Use "+" to add or "-" to remove an argument.',
                description: "Function constructor tooltip."
              })
            );
            const property = block;
            input_exports.Text(block, "BEGIN", [
              translate({
                id: "lpp.block.construct.Function",
                default: "function",
                description: "Function constructor block."
              }),
              "("
            ]);
            input_exports.Text(block, "END", ")");
            input_exports.Statement(block, "SUBSTACK");
            property.length = 0;
            updateButton(Blockly, property);
          },
          mutationToDom() {
            const elem = document.createElement("mutation");
            if (isMutableBlock(block)) {
              elem.setAttribute("length", String(block.length));
            }
            return elem;
          },
          domToMutation(mutation) {
            const length = parseInt(
              mutation.getAttribute("length") ?? "0",
              10
            );
            if (isMutableBlock(block)) {
              if (length > block.length) {
                for (let i = block.length; i < length; i++) {
                  if (i > 0) {
                    block.appendDummyInput(`COMMA_${i}`).appendField(",");
                    block.moveInputBefore(`COMMA_${i}`, "END");
                  }
                  input_exports.String(block, `ARG_${i}`, "");
                  block.moveInputBefore(`ARG_${i}`, "END");
                }
              } else {
                const removeList = [];
                for (let i = length; i < block.length; i++) {
                  block.removeInput(`ARG_${i}`, true);
                  block.removeInput(`COMMA_${i}`, true);
                  removeList.push(`ARG_${i}`, `COMMA_${i}`);
                }
                cleanInputs(block.id, removeList);
              }
              block.length = length;
              updateButton(Blockly, block);
            }
          }
        }))
      ).register(
        "constructAsyncFunction",
        Reporter.Square((Blockly, block) => ({
          init() {
            block.setTooltip(
              translate({
                id: "lpp.tooltip.construct.AsyncFunction",
                default: 'Construct an asynchronous Function object. Use "+" to add or "-" to remove an argument.',
                description: "Asynchronous function constructor tooltip."
              })
            );
            const property = block;
            input_exports.Text(block, "BEGIN", [
              translate({
                id: "lpp.block.construct.AsyncFunction",
                default: "async function",
                description: "Asynchronous function constructor block."
              }),
              "("
            ]);
            input_exports.Text(block, "END", ")");
            input_exports.Statement(block, "SUBSTACK");
            property.length = 0;
            updateButton(Blockly, property);
          },
          mutationToDom() {
            const elem = document.createElement("mutation");
            if (isMutableBlock(block)) {
              elem.setAttribute("length", String(block.length));
            }
            return elem;
          },
          domToMutation(mutation) {
            const length = parseInt(
              mutation.getAttribute("length") ?? "0",
              10
            );
            if (isMutableBlock(block)) {
              if (length > block.length) {
                for (let i = block.length; i < length; i++) {
                  if (i > 0) {
                    block.appendDummyInput(`COMMA_${i}`).appendField(",");
                    block.moveInputBefore(`COMMA_${i}`, "END");
                  }
                  input_exports.String(block, `ARG_${i}`, "");
                  block.moveInputBefore(`ARG_${i}`, "END");
                }
              } else {
                const removeList = [];
                for (let i = length; i < block.length; i++) {
                  block.removeInput(`ARG_${i}`, true);
                  block.removeInput(`COMMA_${i}`, true);
                  removeList.push(`ARG_${i}`, `COMMA_${i}`);
                }
                cleanInputs(block.id, removeList);
              }
              block.length = length;
              updateButton(Blockly, block);
            }
          }
        }))
      )
    ).register(
      new Category(
        () => `\u{1F522} ${translate({ id: "lpp.category.operator", default: "Operator", description: "Operator category." })}`
      ).register(
        "binaryOp",
        Reporter.Square((Blockly, block) => ({
          init() {
            block.setTooltip(
              translate({
                id: "lpp.tooltip.operator.binaryOp",
                default: "Do binary operations.",
                description: "Binary operations tooltip."
              })
            );
            block.appendDummyInput("END");
            const property = block;
            property.length = 0;
            if (block.domToMutation && block.mutationToDom)
              block.domToMutation(block.mutationToDom());
            updateButton(Blockly, property, 2);
          },
          mutationToDom() {
            const elem = document.createElement("mutation");
            if (isMutableBlock(block)) {
              elem.setAttribute("length", String(block.length));
            }
            return elem;
          },
          domToMutation(mutation) {
            const length = Math.max(
              2,
              parseInt(mutation.getAttribute("length") ?? "0", 10)
            );
            if (isMutableBlock(block)) {
              if (length > block.length) {
                for (let i = block.length; i < length; i++) {
                  if (i > 0) {
                    block.appendDummyInput(`OP_${i}`).appendField(
                      new Blockly.FieldDropdown([
                        [".", "."],
                        ["?.", "?."],
                        ["**", "**"],
                        ["*", "*"],
                        ["/", "/"],
                        ["+", "+"],
                        ["%", "%"],
                        ["-", "-"],
                        ["<<", "<<"],
                        [">>", ">>"],
                        [">>>", ">>>"],
                        ["<", "<"],
                        ["<=", "<="],
                        [">", ">"],
                        [">=", ">="],
                        ["in", "in"],
                        ["instanceof", "instanceof"],
                        ["==", "=="],
                        ["!=", "!="],
                        ["&", "&"],
                        ["^", "^"],
                        ["|", "|"],
                        ["&&", "&&"],
                        ["||", "||"],
                        ["=", "="],
                        [",", ","]
                      ]),
                      `OP_${i}`
                    );
                    const fields = runtime.getEditingTarget()?.blocks.getBlock(block.id)?.fields;
                    if (fields)
                      fields[`OP_${i}`] = {
                        id: null,
                        name: `OP_${i}`,
                        value: "."
                      };
                    block.moveInputBefore(`OP_${i}`, "END");
                  }
                  input_exports.String(block, `ARG_${i}`, "");
                  block.moveInputBefore(`ARG_${i}`, "END");
                }
              } else {
                const removeList = [];
                for (let i = length; i < block.length; i++) {
                  block.removeInput(`ARG_${i}`, true);
                  block.removeInput(`OP_${i}`, true);
                  const fields = runtime.getEditingTarget()?.blocks.getBlock(block.id)?.fields;
                  if (fields)
                    delete fields[`OP_${i}`];
                  removeList.push(`ARG_${i}`);
                }
                cleanInputs(block.id, removeList);
              }
              block.length = length;
              updateButton(Blockly, block, 2);
            }
          }
        }))
      ).register(
        "unaryOp",
        Reporter.Square((Blockly, block) => () => {
          block.setTooltip(
            translate({
              id: "lpp.tooltip.operator.unaryOp",
              default: "Do unary operations.",
              description: "Unary operations tooltip."
            })
          );
          block.appendDummyInput().appendField(
            new Blockly.FieldDropdown([
              ["+", "+"],
              ["-", "-"],
              ["!", "!"],
              ["~", "~"],
              ["...", "..."],
              ["delete", "delete"],
              ["await", "await"],
              ["yield", "yield"],
              ["yield*", "yield*"]
            ]),
            "op"
          );
          input_exports.Any(block, "value");
        })
      ).register(
        "new",
        Reporter.Square((Blockly, block) => ({
          init() {
            block.setTooltip(
              translate({
                id: "lpp.tooltip.operator.new",
                default: 'Construct an instance with given constructor and arguments. Use "+" to add or "-" to remove an argument.',
                description: "New operator tooltip."
              })
            );
            const property = block;
            input_exports.Text(block, "LABEL", "new");
            input_exports.Any(block, "fn");
            input_exports.Text(block, "BEGIN", "(");
            input_exports.Text(block, "END", ")");
            property.length = 0;
            updateButton(Blockly, property);
          },
          mutationToDom() {
            const elem = document.createElement("mutation");
            if (isMutableBlock(block)) {
              elem.setAttribute("length", String(block.length));
            }
            return elem;
          },
          domToMutation(mutation) {
            const length = parseInt(
              mutation.getAttribute("length") ?? "0",
              10
            );
            if (isMutableBlock(block)) {
              if (length > block.length) {
                for (let i = block.length; i < length; i++) {
                  if (i > 0) {
                    block.appendDummyInput(`COMMA_${i}`).appendField(",");
                    block.moveInputBefore(`COMMA_${i}`, "END");
                  }
                  input_exports.Any(block, `ARG_${i}`);
                  block.moveInputBefore(`ARG_${i}`, "END");
                }
              } else {
                const removeList = [];
                for (let i = length; i < block.length; i++) {
                  block.removeInput(`ARG_${i}`, true);
                  block.removeInput(`COMMA_${i}`, true);
                  removeList.push(`ARG_${i}`, `COMMA_${i}`);
                }
                cleanInputs(block.id, removeList);
              }
              block.length = length;
              updateButton(Blockly, block);
            }
          }
        }))
      ).register(
        "call",
        Reporter.Square((Blockly, block) => ({
          init() {
            block.setTooltip(
              translate({
                id: "lpp.tooltip.operator.call",
                default: 'Call function with given arguments. Use "+" to add or "-" to remove an argument.',
                description: "Call operator tooltip."
              })
            );
            const property = block;
            input_exports.Any(block, "fn");
            input_exports.Text(block, "BEGIN", "(");
            input_exports.Text(block, "END", ")");
            property.length = 0;
            updateButton(Blockly, property);
          },
          mutationToDom() {
            const elem = document.createElement("mutation");
            if (isMutableBlock(block)) {
              elem.setAttribute("length", String(block.length));
            }
            return elem;
          },
          domToMutation(mutation) {
            const length = parseInt(
              mutation.getAttribute("length") ?? "0",
              10
            );
            if (isMutableBlock(block)) {
              if (length > block.length) {
                for (let i = block.length; i < length; i++) {
                  if (i > 0) {
                    block.appendDummyInput(`COMMA_${i}`).appendField(",");
                    block.moveInputBefore(`COMMA_${i}`, "END");
                  }
                  input_exports.Any(block, `ARG_${i}`);
                  block.moveInputBefore(`ARG_${i}`, "END");
                }
              } else {
                const removeList = [];
                for (let i = length; i < block.length; i++) {
                  block.removeInput(`ARG_${i}`, true);
                  block.removeInput(`COMMA_${i}`, true);
                  removeList.push(`ARG_${i}`, `COMMA_${i}`);
                }
                cleanInputs(block.id, removeList);
              }
              block.length = length;
              updateButton(Blockly, block);
            }
          }
        }))
      ).register(
        "self",
        Reporter.Round((_, block) => () => {
          block.setTooltip(
            translate({
              id: "lpp.tooltip.operator.self",
              default: "Get the reference of self object in function context.",
              description: "Self (aka this) tooltip."
            })
          );
          block.setCheckboxInFlyout(false);
          input_exports.Text(block, "LABEL", "this");
        })
      ).register(
        "var",
        Reporter.Round((_, block) => () => {
          block.setTooltip(
            translate({
              id: "lpp.tooltip.operator.var",
              default: "Get the reference of a specified local variable or an argument.",
              description: "Variable operator tooltip."
            })
          );
          input_exports.Text(
            block,
            "LABEL",
            translate({
              id: "lpp.block.operator.var",
              default: "var",
              description: "Var operator block."
            })
          );
          input_exports.String(block, "name", "\u{1F43A}");
        })
      )
    ).register(
      new Category(
        () => `\u{1F916} ${translate({ id: "lpp.category.statement", default: "Statement", description: "Statement category." })}`
      ).register(
        "return",
        Command(
          (_, block) => () => {
            block.setTooltip(
              translate({
                id: "lpp.tooltip.statement.return",
                default: "Return a value from the function.",
                description: "Return statement tooltip."
              })
            );
            input_exports.Text(block, "LABEL", "return");
            input_exports.Any(block, "value");
          },
          true
        )
      ).register(
        "throw",
        Command(
          (_, block) => () => {
            block.setTooltip(
              translate({
                id: "lpp.tooltip.statement.throw",
                default: "Throw a value. It will interrupt current control flow immediately.",
                description: "Throw statement tooltip."
              })
            );
            input_exports.Text(block, "LABEL", "throw");
            input_exports.Any(block, "value");
          },
          true
        )
      ).register(
        "scope",
        Command((_, block) => () => {
          block.setTooltip(
            translate({
              id: "lpp.tooltip.statement.scope",
              default: "Create a lpp scope and execute the code in it.",
              description: "Scope statement tooltip."
            })
          );
          input_exports.Text(
            block,
            "LABEL",
            translate({
              id: "lpp.block.statement.scope",
              default: "scope",
              description: "Scope statement block."
            })
          );
          input_exports.Statement(block, "SUBSTACK");
        })
      ).register(
        "try",
        Command((_, block) => () => {
          block.setTooltip(
            translate({
              id: "lpp.tooltip.statement.try",
              default: "Try capturing exceptions in specified statements. If an exception is thrown, set the specified reference to error object, then execute exception handling code.",
              description: "Try-catch statement tooltip."
            })
          );
          input_exports.Text(block, "TRY", "try");
          input_exports.Statement(block, "SUBSTACK");
          input_exports.Text(block, "CATCH", "catch");
          input_exports.Any(block, "var");
          input_exports.Statement(block, "SUBSTACK_2");
        })
      ).register(
        "nop",
        Command((_, block) => () => {
          block.setTooltip(
            translate({
              id: "lpp.tooltip.statement.nop",
              default: "Does nothing. It is used to convert a Scratch reporter into a statement.",
              description: "No-op block tooltip."
            })
          );
          input_exports.Any(block, "value");
        })
      )
    );
  }

  // src/impl/wrapper.ts
  var Wrapper = class _Wrapper extends String {
    /**
     * Construct a wrapped value.
     * @param value Value to wrap.
     */
    constructor(value) {
      super(value);
      this.value = value;
    }
    /**
     * Unwraps a wrapped object.
     * @param value Wrapped object.
     * @returns Unwrapped object.
     */
    static unwrap(value) {
      return value instanceof _Wrapper ? value.value : value;
    }
    /**
     * toString method for Scratch monitors.
     * @returns String display.
     */
    toString() {
      return String(this.value);
    }
  };

  // src/impl/typehint.ts
  function attachType() {
    function attachType2(fn, signature) {
      const v = asValue(fn);
      if (v instanceof LppFunction)
        attach(v, new TypeMetadata(signature));
    }
    attachType2(Global.Number, ["value?"]);
    attachType2(Global.Boolean, ["value?"]);
    attachType2(Global.String, ["value?"]);
    attachType2(Global.Array, ["value?"]);
    attachType2(Global.Object, ["value?"]);
    attachType2(Global.Function, ["value?"]);
    attachType2(Global.Array.get("prototype").get("map"), ["predict"]);
    attachType2(Global.Array.get("prototype").get("every"), ["predict"]);
    attachType2(Global.Array.get("prototype").get("any"), ["predict"]);
    attachType2(Global.Array.get("prototype").get("slice"), ["start?", "end?"]);
    attachType2(Global.Function.get("prototype").get("bind"), ["self"]);
    attachType2(Global.Function.get("deserialize"), ["obj"]);
    attachType2(Global.Function.get("serialize"), ["fn"]);
    attachType2(Global.Promise, ["executor"]);
    attachType2(Global.Promise.get("prototype").get("then"), [
      "onfulfilled?",
      "onrejected?"
    ]);
    attachType2(Global.Promise.get("resolve"), ["value?"]);
    attachType2(Global.Promise.get("reject"), ["reason?"]);
    attachType2(Global.Promise.get("prototype").get("catch"), ["onrejected"]);
    attachType2(Global.JSON.get("parse"), ["json"]);
    attachType2(Global.JSON.get("stringify"), ["value"]);
    attachType2(Global.Math.get("sin"), ["x"]);
    attachType2(Global.Math.get("sinh"), ["x"]);
    attachType2(Global.Math.get("asin"), ["x"]);
    attachType2(Global.Math.get("asinh"), ["x"]);
    attachType2(Global.Math.get("cos"), ["x"]);
    attachType2(Global.Math.get("cosh"), ["x"]);
    attachType2(Global.Math.get("acos"), ["x"]);
    attachType2(Global.Math.get("acosh"), ["x"]);
    attachType2(Global.Math.get("tan"), ["x"]);
    attachType2(Global.Math.get("tanh"), ["x"]);
    attachType2(Global.Math.get("atan"), ["x"]);
    attachType2(Global.Math.get("atanh"), ["x"]);
    attachType2(Global.Math.get("atan2"), ["x", "y"]);
  }

  // src/impl/promise.ts
  var Resolved = class {
    constructor(value) {
      this.value = value;
    }
  };
  var Rejected = class {
    constructor(reason) {
      this.reason = reason;
    }
    handled = false;
  };
  var PromiseResult = Symbol("PromiseResult");
  var PromiseCallback = Symbol("PromiseCallback");
  var ImmediatePromise = class _ImmediatePromise {
    get [Symbol.toStringTag]() {
      return "ImmediatePromise";
    }
    [PromiseCallback] = [];
    [PromiseResult];
    /**
     * Creates a new Promise.
     * @param executor A callback used to initialize the promise. This callback is passed two arguments:
     * a resolve callback used to resolve the promise with a value or the result of another promise,
     * and a reject callback used to reject the promise with a provided reason or error.
     * @version es5
     */
    constructor(executor) {
      const resolve = (result) => {
        const processResolve = (result2) => {
          if (!this[PromiseResult]) {
            this[PromiseResult] = new Resolved(result2);
            this[PromiseCallback].forEach((callback) => callback());
            this[PromiseCallback] = [];
          }
        };
        if (isPromise(result)) {
          result.then(
            (result2) => {
              processResolve(result2);
            },
            (reason) => {
              reject(reason);
            }
          );
        } else {
          processResolve(result);
        }
      };
      const reject = (reason) => {
        if (!this[PromiseResult]) {
          const res = new Rejected(reason);
          this[PromiseResult] = res;
          this[PromiseCallback].forEach((callback) => callback());
          this[PromiseCallback] = [];
          setTimeout(() => {
            if (!res.handled)
              throw res.reason;
          });
        }
      };
      if (typeof executor !== "function")
        throw new TypeError(`Promise resolver ${executor} is not a function`);
      try {
        executor(resolve, reject);
      } catch (err) {
        reject(err);
      }
    }
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     * @version es5
     */
    then(onfulfilled, onrejected) {
      return new _ImmediatePromise((resolve, reject) => {
        if (this[PromiseResult]) {
          if (this[PromiseResult] instanceof Resolved) {
            return onfulfilled ? resolve(onfulfilled(this[PromiseResult].value)) : resolve(this[PromiseResult].value);
          }
          this[PromiseResult].handled = true;
          return onrejected ? resolve(onrejected(this[PromiseResult].reason)) : reject(this[PromiseResult].reason);
        }
        return void this[PromiseCallback].push(() => {
          try {
            if (this[PromiseResult] instanceof Resolved) {
              if (onfulfilled) {
                resolve(onfulfilled(this[PromiseResult].value));
              } else
                resolve(this[PromiseResult].value);
            } else if (this[PromiseResult] instanceof Rejected) {
              this[PromiseResult].handled = true;
              if (onrejected) {
                resolve(onrejected(this[PromiseResult].reason));
              } else
                reject(this[PromiseResult].reason);
            }
          } catch (e) {
            reject(e);
          }
        });
      });
    }
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     * @version es5
     */
    catch(onrejected) {
      return this.then(void 0, onrejected);
    }
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     * @version es2018
     */
    finally(onfinally) {
      if (!onfinally)
        return this;
      return new _ImmediatePromise((resolve, reject) => {
        if (this[PromiseResult]) {
          const res = onfinally();
          if (isPromise(res)) {
            return void res.then(
              () => {
                return this[PromiseResult] && (this[PromiseResult] instanceof Resolved ? resolve(this[PromiseResult].value) : reject(this[PromiseResult].reason));
              },
              (reason) => {
                return reject(reason);
              }
            );
          }
          return this[PromiseResult] instanceof Resolved ? resolve(this[PromiseResult].value) : reject(this[PromiseResult].reason);
        }
        return void this[PromiseCallback].push(() => {
          if (this[PromiseResult]) {
            try {
              const res = onfinally();
              if (isPromise(res)) {
                return void res.then(
                  () => {
                    return this[PromiseResult] && (this[PromiseResult] instanceof Resolved ? resolve(this[PromiseResult].value) : reject(this[PromiseResult].reason));
                  },
                  (reason) => {
                    return reject(reason);
                  }
                );
              }
              return this[PromiseResult] instanceof Resolved ? resolve(this[PromiseResult].value) : reject(this[PromiseResult].reason);
            } catch (e) {
              reject(e);
            }
          }
        });
      });
    }
    static all(values) {
      return new _ImmediatePromise((resolve, reject) => {
        let index = 0;
        let completed = 0;
        const result = {};
        let performCheck = false;
        for (const v of values) {
          const current = index++;
          _ImmediatePromise.resolve(v).then((v2) => {
            result[current] = v2;
            completed++;
            if (performCheck && completed === index) {
              resolve(result);
            }
          }, reject);
        }
        if (completed === index) {
          return resolve(result);
        }
        performCheck = true;
      });
    }
    /**
     * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
     * or rejected.
     * @param values An iterable of Promises.
     * @returns A new Promise.
     * @version es2015
     */
    static race(values) {
      return new _ImmediatePromise((resolve) => {
        for (const v of values)
          resolve(v);
      });
    }
    /**
     * Creates a new rejected promise for the provided reason.
     * @param reason The reason the promise was rejected.
     * @returns A new rejected Promise.
     */
    static reject(reason) {
      return new _ImmediatePromise((_, reject) => reject(reason));
    }
    static resolve(value) {
      return new _ImmediatePromise(
        (resolve) => resolve(value)
      );
    }
    static allSettled(values) {
      return new _ImmediatePromise((resolve) => {
        let index = 0;
        let completed = 0;
        const result = {};
        let performCheck = false;
        for (const v of values) {
          const current = index++;
          _ImmediatePromise.resolve(v).then(
            (v2) => {
              result[current] = {
                status: "fulfilled",
                value: v2
              };
              completed++;
              if (performCheck && completed === index) {
                resolve(result);
              }
            },
            (err) => {
              result[current] = {
                status: "rejected",
                reason: err
              };
              completed++;
              if (performCheck && completed === index) {
                resolve(result);
              }
            }
          );
        }
        if (completed === index) {
          return resolve(result);
        }
        performCheck = true;
      });
    }
    static any(values) {
      return new _ImmediatePromise((resolve, reject) => {
        let index = 0;
        let failed = 0;
        const result = [];
        let performCheck = false;
        for (const v of values) {
          const current = index++;
          _ImmediatePromise.resolve(v).then(
            (v2) => resolve(v2),
            (v2) => {
              result[current] = v2;
              failed++;
              if (performCheck && failed === index) {
                reject(new AggregateError(result, "All promises were rejected"));
              }
            }
          );
        }
        if (failed === index) {
          return reject(new AggregateError(result, "All promises were rejected"));
        }
        performCheck = true;
      });
    }
    /**
     * Make a PromiseLike object synchronous.
     * @param v PromiseLike object.
     * @returns Value or PromiseLike object.
     * @warning Non-standard.
     */
    static sync(v) {
      let result = void 0;
      v.then(
        (v2) => {
          result = new Resolved(v2);
        },
        (v2) => {
          result = new Rejected(v2);
        }
      );
      if (result) {
        const v2 = result;
        if (v2 instanceof Resolved) {
          return v2.value;
        } else {
          throw v2.reason;
        }
      }
      return v;
    }
    /**
     * Creates a new Promise and returns it in an object, along with its resolve and reject functions.
     * @returns An object with the properties `promise`, `resolve`, and `reject`.
     *
     * ```ts
     * const { promise, resolve, reject } = Promise.withResolvers<T>();
     * ```
     *
     * @version es2023
     */
    withResolvers() {
      let resolveFn;
      let rejectFn;
      resolveFn = rejectFn = () => {
        throw new Error("not implemented");
      };
      const promise = new _ImmediatePromise((resolve, reject) => {
        resolveFn = resolve;
        rejectFn = reject;
      });
      return { promise, reject: rejectFn, resolve: resolveFn };
    }
  };
  var PromiseProxy = class {
    constructor(promise, afterResolved, afterRejected) {
      this.promise = promise;
      this.afterResolved = afterResolved;
      this.afterRejected = afterRejected;
    }
    afterFulfilledCalled = false;
    afterRejectedCalled = false;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then(onfulfilled, onrejected) {
      return this.promise.then(
        onfulfilled ? (value) => {
          const res = onfulfilled(value);
          if (!this.afterFulfilledCalled) {
            if (this.afterResolved)
              this.afterResolved();
            this.afterFulfilledCalled = true;
          }
          return res;
        } : void 0,
        onrejected ? (reason) => {
          const res = onrejected(reason);
          if (!this.afterRejectedCalled) {
            if (this.afterRejected)
              this.afterRejected();
            this.afterRejectedCalled = true;
          }
          return res;
        } : void 0
      );
    }
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch(onrejected) {
      return this.promise.then(void 0, onrejected);
    }
  };

  // src/impl/thread/helper.ts
  function bindThread(thread, fn) {
    let status = thread.status;
    let alreadyCalled = false;
    const threadConstructor = thread.constructor;
    Reflect.defineProperty(thread, "status", {
      get: () => {
        return status;
      },
      set: (newStatus) => {
        status = newStatus;
        if (status === threadConstructor.STATUS_DONE) {
          if (!alreadyCalled) {
            alreadyCalled = true;
            fn();
          }
        }
      }
    });
  }
  function stepThread(runtime, util, thread) {
    const callerThread = util.thread;
    runtime.sequencer.stepThread(thread);
    if (thread.isCompiled && callerThread && callerThread.isCompiled && callerThread.generator) {
      const orig = callerThread.generator;
      callerThread.generator = {
        next: () => {
        }
      };
      runtime.sequencer.stepThread(callerThread);
      callerThread.generator = orig;
    }
    util.thread = callerThread;
  }

  // src/impl/thread/index.ts
  var ThreadController = class _ThreadController {
    constructor(runtime, util) {
      this.runtime = runtime;
      this.util = util;
    }
    static waitingThread = /* @__PURE__ */ new WeakMap();
    create(topBlockId, target, options) {
      return this.runtime._pushThread(topBlockId, target, options);
    }
    wait(thread) {
      const cache = _ThreadController.waitingThread.get(thread);
      if (cache) {
        return cache;
      }
      const v = new ImmediatePromise((resolve) => {
        bindThread(thread, resolve);
        stepThread(this.runtime, this.util, thread);
      });
      _ThreadController.waitingThread.set(thread, v);
      return v;
    }
    step(thread) {
      stepThread(this.runtime, this.util, thread);
    }
  };

  // src/index.ts
  (function(Scratch2) {
    const color = "#808080";
    if (Scratch2.extensions.unsandboxed === false) {
      throw new Error("lpp must be loaded in unsandboxed mode.");
    }
    function hijack(fn) {
      const _orig = Function.prototype.apply;
      Function.prototype.apply = function(thisArg) {
        return thisArg;
      };
      const result = fn();
      Function.prototype.apply = _orig;
      return result;
    }
    function getVM(runtime) {
      let virtualMachine;
      if (runtime._events["QUESTION"] instanceof Array) {
        for (const value of runtime._events["QUESTION"]) {
          const v = hijack(value);
          if (v?.props?.vm) {
            virtualMachine = v?.props?.vm;
            break;
          }
        }
      } else if (runtime._events["QUESTION"]) {
        virtualMachine = hijack(runtime._events["QUESTION"])?.props?.vm;
      }
      if (!virtualMachine)
        throw new Error("lpp cannot get Virtual Machine instance.");
      return virtualMachine;
    }
    function getBlockly(vm) {
      let Blockly;
      if (vm._events["EXTENSION_ADDED"] instanceof Array) {
        for (const value of vm._events["EXTENSION_ADDED"]) {
          const v = hijack(value);
          if (v?.ScratchBlocks) {
            Blockly = v?.ScratchBlocks;
            break;
          }
        }
      } else if (vm._events["EXTENSION_ADDED"]) {
        Blockly = hijack(vm._events["EXTENSION_ADDED"])?.ScratchBlocks;
      }
      return Blockly;
    }
    class LppExtension {
      /**
       * Extension ID.
       */
      static id = "lpp";
      /**
       * Virtual machine instance.
       */
      vm;
      /**
       * ScratchBlocks instance.
       */
      Blockly;
      /**
       * Blockly extension.
       */
      extension;
      /**
       * Scratch util.
       */
      util;
      /**
       * Construct a new instance of lpp.
       * @param originalRuntime Scratch runtime.
       */
      constructor(originalRuntime) {
        function patchBlockly(Blockly, extension) {
          const Events = Blockly.Events;
          const _Change = Events.Change.prototype.run;
          Events.Change.prototype.run = function(_forward) {
            _Change.call(this, _forward);
            const self = this;
            const block = this.getEventWorkspace_().getBlockById(
              self.blockId
            );
            if (block instanceof Blockly.BlockSvg) {
              block.initSvg();
              block.render();
            }
          };
          const _Move = Events.Move.prototype.run;
          Events.Move.prototype.run = function(_forward) {
            const self = this;
            const block = this.getEventWorkspace_().getBlockById(
              self.blockId
            );
            if (block)
              _Move.call(this, _forward);
          };
          const _Create = Events.Create.prototype.run;
          Events.Create.prototype.run = function(_forward) {
            const self = this;
            const res = [];
            const workspace = this.getEventWorkspace_();
            for (const id of self.ids) {
              if (workspace.getBlockById(id))
                res.push(id);
            }
            self.ids = res;
            _Create.call(this, _forward);
          };
          extension.inject(Blockly);
        }
        const runtime = originalRuntime;
        this.Blockly = void 0;
        this.vm = getVM(runtime);
        this.extension = defineExtension(
          LppExtension.id,
          color,
          this.vm.runtime,
          Scratch2.translate
        );
        this.Blockly = getBlockly(this.vm);
        if (this.Blockly)
          patchBlockly(this.Blockly, this.extension);
        else
          this.vm.once("workspaceUpdate", () => {
            const newBlockly = getBlockly(this.vm);
            if (newBlockly && newBlockly !== this.Blockly) {
              this.Blockly = newBlockly;
              patchBlockly(newBlockly, this.extension);
            }
          });
        const _emit = runtime.emit;
        runtime.emit = (event, ...args) => {
          const blacklist = ["SAY", "QUESTION"];
          if (blacklist.includes(event) && args.length >= 1 && typeof args[0] === "object" && args[0] !== null && Reflect.get(args[0], "id") === "") {
            this.handleError(new LppError("useAfterDispose"));
          }
          return _emit.call(runtime, event, ...args);
        };
        const _visualReport = runtime.visualReport;
        runtime.visualReport = (blockId, value) => {
          const unwrappedValue = Wrapper.unwrap(value);
          if ((unwrappedValue instanceof LppValue || unwrappedValue instanceof LppReference || unwrappedValue instanceof LppBoundArg) && this.Blockly) {
            const actualValue = unwrappedValue instanceof LppBoundArg ? unwrappedValue : asValue(unwrappedValue);
            dialog_exports.show(
              this.Blockly,
              blockId,
              [Inspector(this.Blockly, this.vm, Scratch2.translate, actualValue)],
              actualValue instanceof LppConstant ? "center" : "left"
            );
          } else {
            return _visualReport.call(runtime, blockId, value);
          }
        };
        const _requestUpdateMonitor = runtime.requestUpdateMonitor;
        if (_requestUpdateMonitor) {
          const patchMonitorValue = (element, value) => {
            const valueElement = element.querySelector('[class*="value"]');
            if (valueElement instanceof HTMLElement) {
              const internalInstance = Object.values(valueElement).find(
                (v) => typeof v === "object" && v !== null && Reflect.has(v, "stateNode")
              );
              if (value instanceof LppValue) {
                const inspector = Inspector(
                  this.Blockly,
                  this.vm,
                  Scratch2.translate,
                  value
                );
                valueElement.style.textAlign = "left";
                valueElement.style.backgroundColor = "rgb(30, 30, 30)";
                valueElement.style.color = "#eeeeee";
                while (valueElement.firstChild)
                  valueElement.removeChild(valueElement.firstChild);
                valueElement.append(inspector);
              } else {
                if (internalInstance) {
                  valueElement.style.textAlign = "";
                  valueElement.style.backgroundColor = internalInstance.memoizedProps?.style?.background ?? "";
                  valueElement.style.color = internalInstance.memoizedProps?.style?.color ?? "";
                  while (valueElement.firstChild)
                    valueElement.removeChild(valueElement.firstChild);
                  valueElement.append(String(value));
                }
              }
            }
          };
          const getMonitorById = (id) => {
            const elements = document.querySelectorAll(
              `[class*="monitor_monitor-container"]`
            );
            for (const element of Object.values(elements)) {
              const internalInstance = Object.values(element).find(
                (v) => typeof v === "object" && v !== null && Reflect.has(v, "children")
              );
              if (internalInstance) {
                const props = internalInstance?.children?.props;
                if (id === props?.id)
                  return element;
              }
            }
            return null;
          };
          const monitorMap = /* @__PURE__ */ new Map();
          runtime.requestUpdateMonitor = (state) => {
            const id = state.get("id");
            if (typeof id === "string") {
              const monitorValue = state.get("value");
              const monitorMode = state.get("mode");
              const monitorVisible = state.get("visible");
              const cache = monitorMap.get(id);
              if (typeof monitorMode === "string" && cache) {
                cache.mode = monitorMode;
                cache.value = void 0;
              } else if (monitorValue !== void 0) {
                const unwrappedValue = Wrapper.unwrap(monitorValue);
                if (unwrappedValue instanceof LppValue || unwrappedValue instanceof LppReference || unwrappedValue instanceof LppBoundArg) {
                  const actualValue = unwrappedValue instanceof LppBoundArg ? unwrappedValue : asValue(unwrappedValue);
                  if (!cache || cache.value !== actualValue) {
                    requestAnimationFrame(() => {
                      const monitor = getMonitorById(id);
                      if (monitor) {
                        patchMonitorValue(monitor, actualValue);
                      }
                    });
                    if (!cache) {
                      monitorMap.set(id, {
                        value: actualValue,
                        mode: (() => {
                          if (runtime.getMonitorState) {
                            const monitorCached = runtime.getMonitorState().get(id);
                            if (monitorCached) {
                              const mode = monitorCached.get("mode");
                              return typeof mode === "string" ? mode : "normal";
                            }
                          }
                          return "normal";
                        })()
                      });
                    } else
                      cache.value = actualValue;
                  }
                  return true;
                } else {
                  if (monitorMap.has(id)) {
                    const monitor = getMonitorById(id);
                    if (monitor) {
                      patchMonitorValue(monitor, monitorValue);
                    }
                    monitorMap.delete(id);
                  }
                }
              } else if (monitorVisible !== void 0) {
                if (!monitorVisible)
                  monitorMap.delete(id);
              }
            }
            return _requestUpdateMonitor.call(runtime, state);
          };
        }
        Global.Function.set(
          "serialize",
          LppFunction.native(({ args }) => {
            const fn = args[0];
            if (!fn || !(fn instanceof LppFunction) || !hasMetadata(fn) || !(fn.metadata instanceof ScratchMetadata)) {
              return async(function* () {
                return raise(
                  yield Global.IllegalInvocationError.construct(
                    []
                  )
                );
              });
            }
            const v = fn.metadata.blocks[0]?.getBlock(fn.metadata.blocks[1]);
            if (!v)
              throw new Error("lpp: serialize blockId invalid");
            return new LppReturn(
              LppExtension.serializeFunction(
                v,
                fn.metadata.blocks[0],
                fn.metadata.signature
              )
            );
          })
        );
        Global.Function.set(
          "deserialize",
          LppFunction.native(({ args }) => {
            const val = ffi_exports.toObject(args[0] ?? new LppConstant(null));
            if (Validator.isInfo(val)) {
              const Blocks = runtime.flyoutBlocks.constructor;
              const blocks = new Blocks(runtime, true);
              deserializeBlock(blocks, val.script);
              const blockId = val.script[val.block]?.id;
              const Target = runtime.getTargetForStage()?.constructor;
              if (!Target)
                throw new Error("lpp: project is disposed");
              return new LppReturn(
                attach(
                  new LppFunction(
                    (blockId === "constructAsyncFunction" ? this.executeScratchAsync : this.executeScratch).bind(this, Target)
                  ),
                  new ScratchMetadata(
                    val.signature,
                    [blocks, val.block],
                    void 0,
                    void 0,
                    void 0
                  )
                )
              );
            }
            return async(function* () {
              return raise(
                yield Global.SyntaxError.construct([
                  new LppConstant("Invalid value")
                ])
              );
            });
          })
        );
        attachType();
        runtime.lpp = {
          Core: core_exports,
          Metadata: metadata_exports,
          Wrapper,
          version
        };
        console.groupCollapsed("\u{1F4AB} lpp", version);
        console.log(
          "\u{1F31F}",
          Scratch2.translate({
            id: "lpp.about.summary",
            default: "lpp is a high-level programming language developed by @FurryR.",
            description: "Extension summary."
          })
        );
        console.log(
          "\u{1F916}",
          Scratch2.translate({
            id: "lpp.about.github",
            default: "GitHub repository",
            description: "GitHub repository hint."
          }),
          "-> https://github.com/FurryR/lpp-scratch"
        );
        console.log(
          "\u{1F49E}",
          Scratch2.translate({
            id: "lpp.about.afdian",
            default: "Sponsor",
            description: "Sponsor hint."
          }),
          "-> https://afdian.net/a/FurryR"
        );
        console.group(
          "\u{1F47E}",
          Scratch2.translate({
            id: "lpp.about.staff.1",
            default: "lpp developers staff",
            description: "Staff list."
          })
        );
        for (const v of developers) {
          console.log(v);
        }
        console.log(
          "\u{1F970}",
          Scratch2.translate({
            id: "lpp.about.staff.2",
            default: "lpp won't be created without their effort.",
            description: "Staff list ending."
          })
        );
        console.groupEnd();
        console.groupEnd();
      }
      /**
       * Get extension info.
       * @returns Extension info.
       */
      getInfo() {
        return {
          id: LppExtension.id,
          name: Scratch2.translate({
            id: "lpp.name",
            default: "lpp",
            description: "Extension name."
          }),
          color1: color,
          blocks: this.extension.export()
        };
      }
      /**
       * Opens documentation.
       */
      documentation() {
        window.open(
          Scratch2.translate({
            id: "lpp.documentation.url",
            default: "https://github.com/FurryR/lpp-scratch/blob/main/README.md",
            description: "Documentation URL."
          })
        );
      }
      /**
       * Builtin types.
       * @param args Function name.
       * @returns Class.
       */
      builtinType(args, util) {
        this.util = util;
        const instance = Global[args.value];
        if (instance) {
          return new Wrapper(instance);
        }
        throw new Error("lpp: not implemented");
      }
      /**
       * Same as builtinType.
       * @param args Function name.
       * @param util Scratch util.
       * @returns Class.
       */
      builtinError(args, util) {
        return this.builtinType(args, util);
      }
      /**
       * Same as builtinType.
       * @param args Function name.
       * @param util Scratch util.
       * @returns Class.
       */
      builtinUtility(args, util) {
        return this.builtinType(args, util);
      }
      /**
       * Get literal value.
       * @param param0 Arguments.
       * @param util Scratch util.
       * @returns Constant value.
       */
      constructLiteral(args, util) {
        this.util = util;
        const res = (() => {
          switch (args.value) {
            case "null":
              return new LppConstant(null);
            case "true":
              return new LppConstant(true);
            case "false":
              return new LppConstant(false);
            case "NaN":
              return new LppConstant(NaN);
            case "Infinity":
              return new LppConstant(Infinity);
          }
          throw new Error("lpp: unknown literal");
        })();
        return new Wrapper(res);
      }
      /**
       * Make binary calculations.
       * @param param0 Arguments.
       * @param util Scratch util.
       * @returns Result.
       */
      binaryOp(args, util) {
        const { thread } = util;
        this.util = util;
        class Operator {
          constructor(value) {
            this.value = value;
          }
          get priority() {
            return (/* @__PURE__ */ new Map([
              [".", 18],
              ["?.", 18],
              ["**", 14],
              ["*", 13],
              ["/", 13],
              ["%", 13],
              ["+", 12],
              ["-", 12],
              ["<<", 11],
              [">>", 11],
              [">>>", 11],
              ["<", 10],
              ["<=", 10],
              [">", 10],
              [">=", 10],
              ["in", 10],
              ["instanceof", 10],
              ["==", 9],
              ["!=", 9],
              ["&", 8],
              ["^", 7],
              ["|", 6],
              ["&&", 5],
              ["||", 4],
              ["=", 2],
              [",", 1]
            ])).get(this.value) ?? -1;
          }
        }
        function intoRPN(input) {
          const stack = [];
          const result = [];
          for (const value of input) {
            if (!(value instanceof Operator)) {
              result.push(value);
            } else {
              let op2;
              while ((op2 = stack[stack.length - 1]) && op2.priority >= value.priority) {
                result.push(op2);
                stack.pop();
              }
              stack.push(value);
            }
          }
          let op;
          while (op = stack.pop()) {
            result.push(op);
          }
          return result;
        }
        function evaluate(expr) {
          function evaluateInternal(op, lhs, rhs) {
            if (op === "." || op === "?.") {
              if (lhs instanceof LppValue || lhs instanceof LppReference) {
                if (lhs instanceof LppConstant && lhs.value === null && op === "?.")
                  return new LppConstant(null);
                if (typeof rhs === "string" || typeof rhs === "number") {
                  const res2 = lhs.get(`${rhs}`);
                  return op === "?." ? asValue(res2) : res2;
                } else if (rhs instanceof LppValue || rhs instanceof LppReference) {
                  const res2 = lhs.get(String(asValue(rhs)));
                  return op === "?." ? asValue(res2) : res2;
                }
                throw new LppError("invalidIndex");
              }
              throw new LppError("syntaxError");
            } else if ((lhs instanceof LppValue || lhs instanceof LppReference) && (rhs instanceof LppValue || rhs instanceof LppReference)) {
              switch (op) {
                case "=":
                case "+":
                case "*":
                case "**":
                case "==":
                case "!=":
                case ">":
                case "<":
                case ">=":
                case "<=":
                case "&&":
                case "||":
                case "-":
                case "/":
                case "%":
                case "<<":
                case ">>":
                case ">>>":
                case "&":
                case "|":
                case "^":
                case "instanceof": {
                  return lhs.calc(op, asValue(rhs));
                }
                case "in": {
                  const left = asValue(lhs);
                  const right = asValue(rhs);
                  if (!(left instanceof LppConstant && left.value !== null))
                    throw new LppError("invalidIndex");
                  return new LppConstant(right.has(left.toString()));
                }
                default:
                  throw new Error("lpp: unknown operand");
              }
            }
            throw new LppError("syntaxError");
          }
          const stack = [];
          for (const value of expr) {
            if (value instanceof Operator) {
              const rhs = stack.pop();
              const lhs = stack.pop();
              if (lhs !== void 0 && rhs !== void 0) {
                stack.push(evaluateInternal(value.value, lhs, rhs));
              } else
                throw new Error("lpp: invalid expression");
            } else
              stack.push(value);
          }
          const res = stack.pop();
          if (res === void 0)
            throw new Error("lpp: invalid expression");
          return res;
        }
        try {
          const token = [];
          const block = this.getActiveBlockInstance(args, thread);
          const len = parseInt(this.getMutation(block)?.length ?? "0", 10);
          for (let i = 0; i < len; i++) {
            const op = args[`OP_${i}`];
            const value = Wrapper.unwrap(args[`ARG_${i}`]);
            if (typeof op === "string") {
              token.push(new Operator(op));
            }
            token.push(
              value instanceof LppValue || value instanceof LppReference || typeof value === "string" ? value : String(value)
            );
          }
          const res = evaluate(intoRPN(token));
          if (typeof res === "string")
            throw new Error("lpp: invalid expression");
          return new Wrapper(res);
        } catch (e) {
          this.handleError(e);
        }
      }
      /**
       * Do unary calculations.
       * @param param0 Arguments.
       * @param util Scratch util.
       * @returns Result.
       */
      unaryOp(args, util) {
        this.util = util;
        try {
          const value = Wrapper.unwrap(args.value);
          if (!(value instanceof LppValue || value instanceof LppReference))
            throw new LppError("syntaxError");
          const res = (() => {
            switch (args.op) {
              case "+":
              case "-":
              case "!":
              case "~":
              case "delete": {
                return value.calc(args.op);
              }
              case "...": {
                if (!(value instanceof LppArray)) {
                  throw new LppError("syntaxError");
                }
                return new LppBoundArg(value.value);
              }
              case "await": {
                const thread = util.thread;
                if (!thread.lpp)
                  throw new LppError("useOutsideAsyncFunction");
                const lpp = thread.lpp.unwind();
                if (!(lpp instanceof LppAsyncFunctionContext))
                  throw new LppError("useOutsideAsyncFunction");
                const v = asValue(value);
                const then = v.get("then");
                let thenFn;
                let thenSelf;
                if (then instanceof LppReference) {
                  if (!(then.value instanceof LppFunction))
                    return v;
                  thenFn = then.value;
                  thenSelf = then.parent.deref() ?? new LppConstant(null);
                } else {
                  if (!(then instanceof LppFunction))
                    return v;
                  thenFn = then;
                  thenSelf = new LppConstant(null);
                }
                lpp.detach();
                return ImmediatePromise.sync(
                  new ImmediatePromise((resolve) => {
                    thenFn.apply(thenSelf, [
                      new LppFunction((ctx) => {
                        resolve(ctx.args[0] ?? new LppConstant(null));
                        return new LppReturn(new LppConstant(null));
                      }),
                      new LppFunction((ctx) => {
                        thread.lpp?.resolve(
                          new LppException(ctx.args[0] ?? new LppConstant(null))
                        );
                        thread.stopThisScript();
                        resolve(new LppConstant(null));
                        return new LppReturn(new LppConstant(null));
                      })
                    ]);
                  })
                );
              }
              default:
                throw new Error("lpp: unknown operand");
            }
          })();
          if (isPromise(res)) {
            return this.asap(
              res.then((val) => {
                return new Wrapper(val);
              }),
              util.thread
            );
          }
          return new Wrapper(res);
        } catch (e) {
          this.handleError(e);
        }
      }
      /**
       * Call function with arguments.
       * @param args The function and arguments.
       * @param util Scratch util.
       * @returns Function result.
       */
      call(args, util) {
        const { thread } = util;
        this.util = util;
        try {
          let { fn } = args;
          fn = Wrapper.unwrap(fn);
          const actualArgs = [];
          const block = this.getActiveBlockInstance(args, thread);
          const len = parseInt(this.getMutation(block)?.length ?? "0", 10);
          for (let i = 0; i < len; i++) {
            const value = Wrapper.unwrap(args[`ARG_${i}`]);
            if (value instanceof LppBoundArg)
              actualArgs.push(
                ...value.value.map((val) => val ?? new LppConstant(null))
              );
            else if (value instanceof LppValue || value instanceof LppReference)
              actualArgs.push(asValue(value));
            else
              throw new LppError("syntaxError");
          }
          if (!(fn instanceof LppValue || fn instanceof LppReference))
            throw new LppError("syntaxError");
          const func = asValue(fn);
          const lppThread = thread;
          if (!(func instanceof LppFunction))
            throw new LppError("notCallable");
          return this.asap(
            async(function* () {
              return new Wrapper(
                this.processApplyValue(
                  yield func.apply(
                    fn instanceof LppReference ? fn.parent.deref() ?? new LppConstant(null) : lppThread.lpp?.unwind()?.self ?? new LppConstant(null),
                    actualArgs
                  ),
                  thread
                )
              );
            }.bind(this)),
            thread
          );
        } catch (e) {
          this.handleError(e);
        }
      }
      /**
       * Generate a new object by function with arguments.
       * @param args The function and arguments.
       * @param util Scratch util.
       * @returns Result.
       */
      new(args, util) {
        const { thread } = util;
        this.util = util;
        try {
          let { fn } = args;
          fn = Wrapper.unwrap(fn);
          const actualArgs = [];
          const block = this.getActiveBlockInstance(args, thread);
          const len = parseInt(this.getMutation(block)?.length ?? "0", 10);
          for (let i = 0; i < len; i++) {
            const value = Wrapper.unwrap(args[`ARG_${i}`]);
            if (value instanceof LppBoundArg)
              actualArgs.push(
                ...value.value.map((val) => val ?? new LppConstant(null))
              );
            else if (value instanceof LppValue || value instanceof LppReference)
              actualArgs.push(asValue(value));
            else
              throw new LppError("syntaxError");
          }
          if (!(fn instanceof LppValue || fn instanceof LppReference))
            throw new LppError("syntaxError");
          fn = asValue(fn);
          return this.asap(
            async(function* () {
              if (!(fn instanceof LppFunction))
                throw new LppError("notCallable");
              return new Wrapper(
                this.processApplyValue(yield fn.construct(actualArgs), thread)
              );
            }.bind(this)),
            thread
          );
        } catch (e) {
          this.handleError(e);
        }
      }
      /**
       * Return self object.
       * @param _ Unnecessary argument.
       * @param util Scratch util.
       * @returns Result.
       */
      self(_, util) {
        try {
          const { thread } = util;
          this.util = util;
          const lppThread = thread;
          if (lppThread.lpp) {
            const unwind = lppThread.lpp.unwind();
            if (unwind) {
              return new Wrapper(unwind.self);
            }
          }
          throw new LppError("useOutsideFunction");
        } catch (e) {
          this.handleError(e);
        }
      }
      /**
       * Construct a Number.
       * @param param0 Arguments.
       * @returns Result object.
       */
      constructNumber(args, util) {
        const obj = new LppConstant(Number(args.value));
        this.util = util;
        return new Wrapper(obj);
      }
      /**
       * Construct a String.
       * @param param0 Arguments.
       * @returns Result object.
       */
      constructString(args, util) {
        const obj = new LppConstant(String(args.value));
        this.util = util;
        return new Wrapper(obj);
      }
      /**
       * Construct an Array.
       * @param args ID for finding where the array is.
       * @param util Scratch util.
       * @returns An array.
       */
      constructArray(args, util) {
        try {
          const { thread } = util;
          this.util = util;
          const arr = new LppArray();
          const block = this.getActiveBlockInstance(args, thread);
          const len = parseInt(this.getMutation(block)?.length ?? "0", 10);
          for (let i = 0; i < len; i++) {
            const value = Wrapper.unwrap(args[`ARG_${i}`]);
            if (value instanceof LppBoundArg)
              arr.value.push(...value.value);
            else if (value instanceof LppValue || value instanceof LppReference)
              arr.value.push(asValue(value));
            else
              throw new LppError("syntaxError");
          }
          return new Wrapper(arr);
        } catch (e) {
          this.handleError(e);
        }
      }
      /**
       * Construct an Object.
       * @param args ID for finding where the object is.
       * @param util Scratch util.
       * @returns An object.
       */
      constructObject(args, util) {
        try {
          const { thread } = util;
          this.util = util;
          const obj = new LppObject();
          const block = this.getActiveBlockInstance(args, thread);
          const len = parseInt(this.getMutation(block)?.length ?? "0", 10);
          for (let i = 0; i < len; i++) {
            let key = Wrapper.unwrap(args[`KEY_${i}`]);
            const value = Wrapper.unwrap(args[`VALUE_${i}`]);
            if (typeof key === "string" || typeof key === "number") {
              key = `${key}`;
            } else if (key instanceof LppConstant) {
              key = key.toString();
            } else if (key instanceof LppReference && key.value instanceof LppConstant) {
              key = key.value.toString();
            } else
              throw new LppError("invalidIndex");
            if (!(value instanceof LppValue || value instanceof LppReference))
              throw new LppError("syntaxError");
            obj.set(key, asValue(value));
          }
          return new Wrapper(obj);
        } catch (e) {
          this.handleError(e);
        }
      }
      /**
       * Construct a Function.
       * @param args ID for finding where the function is.
       * @param util Scratch util.
       * @returns A function object.
       */
      constructFunction(args, util) {
        try {
          const { thread, target } = util;
          this.util = util;
          const Target = target.constructor;
          const block = this.getActiveBlockInstance(args, thread);
          const signature = [];
          const len = parseInt(
            block?.mutation?.length ?? "0",
            10
          );
          for (let i = 0; i < len; i++) {
            if (typeof args[`ARG_${i}`] !== "object")
              signature[i] = String(args[`ARG_${i}`]);
            else
              throw new LppError("syntaxError");
          }
          const blocks = thread.target.blocks;
          const lppThread = thread;
          return new Wrapper(
            attach(
              new LppFunction(this.executeScratch.bind(this, Target)),
              new ScratchMetadata(
                signature,
                [blocks, block.id],
                target.sprite.clones[0].id,
                target.id,
                lppThread.lpp
              )
            )
          );
        } catch (e) {
          this.handleError(e);
        }
      }
      /**
       * Construct an asynchronous Function.
       * @param args ID for finding where the function is.
       * @param util Scratch util.
       * @returns A function object.
       */
      constructAsyncFunction(args, util) {
        try {
          const { thread, target } = util;
          this.util = util;
          const Target = target.constructor;
          const block = this.getActiveBlockInstance(args, thread);
          const signature = [];
          const len = parseInt(
            block?.mutation?.length ?? "0",
            10
          );
          for (let i = 0; i < len; i++) {
            if (typeof args[`ARG_${i}`] !== "object")
              signature[i] = String(args[`ARG_${i}`]);
            else
              throw new LppError("syntaxError");
          }
          const blocks = thread.target.blocks;
          const lppThread = thread;
          return new Wrapper(
            attach(
              new LppFunction(this.executeScratchAsync.bind(this, Target)),
              new ScratchMetadata(
                signature,
                [blocks, block.id],
                target.sprite.clones[0].id,
                target.id,
                lppThread.lpp
              )
            )
          );
        } catch (e) {
          this.handleError(e);
        }
      }
      /**
       * Get value of specified function variable.
       * @param args Variable name.
       * @param util Scratch util.
       * @returns The value of the variable. If it is not exist, returns null instead.
       */
      var(args, util) {
        try {
          const { thread } = util;
          this.util = util;
          const lppThread = thread;
          if (lppThread.lpp) {
            const v = lppThread.lpp.get(args.name);
            return new Wrapper(v);
          }
          throw new LppError("useOutsideContext");
        } catch (e) {
          this.handleError(e);
        }
      }
      /**
       * Return a value from the function.
       * @param param0 Return value.
       * @param util Scratch util.
       */
      return({ value }, util) {
        try {
          const { thread } = util;
          this.util = util;
          value = Wrapper.unwrap(value);
          if (!(value instanceof LppValue || value instanceof LppReference))
            throw new LppError("syntaxError");
          const val = asValue(value);
          const lppThread = thread;
          if (lppThread.lpp) {
            const lpp = lppThread.lpp.unwind();
            if (lpp instanceof LppAsyncFunctionContext) {
              const then = val.get("then");
              let thenFn;
              let thenSelf;
              if (then instanceof LppReference) {
                if (!(then.value instanceof LppFunction)) {
                  lpp.detach();
                  lpp.promise?.resolve(val);
                  return thread.stopThisScript();
                }
                thenFn = then.value;
                thenSelf = then.parent.deref() ?? new LppConstant(null);
              } else {
                if (!(then instanceof LppFunction)) {
                  lpp.detach();
                  lpp.promise?.resolve(val);
                  return thread.stopThisScript();
                }
                thenFn = then;
                thenSelf = new LppConstant(null);
              }
              lpp.detach();
              return this.asap(
                ImmediatePromise.sync(
                  new ImmediatePromise((resolve) => {
                    thenFn.apply(thenSelf, [
                      new LppFunction((ctx) => {
                        lpp.promise?.resolve(ctx.args[0] ?? new LppConstant(null));
                        thread.stopThisScript();
                        resolve();
                        return new LppReturn(new LppConstant(null));
                      }),
                      new LppFunction((ctx) => {
                        lpp.promise?.reject(ctx.args[0] ?? new LppConstant(null));
                        thread.stopThisScript();
                        resolve();
                        return new LppReturn(new LppConstant(null));
                      })
                    ]);
                  })
                ),
                util.thread
              );
            } else if (lpp instanceof LppFunctionContext) {
              lpp.resolve(new LppReturn(val));
              return thread.stopThisScript();
            }
          }
          throw new LppError("useOutsideFunction");
        } catch (e) {
          this.handleError(e);
        }
      }
      /**
       * Throw a value from the function.
       * @param param0 Exception.
       * @param util Scratch util.
       */
      throw({ value }, util) {
        try {
          const { thread } = util;
          this.util = util;
          value = Wrapper.unwrap(value);
          if (!(value instanceof LppValue || value instanceof LppReference))
            throw new LppError("syntaxError");
          const val = asValue(value);
          const result = new LppException(val);
          const lppThread = thread;
          result.pushStack(
            new LppTraceback2.Block(
              thread.target.sprite.clones[0].id,
              thread.peekStack(),
              lppThread.lpp ?? void 0
            )
          );
          if (lppThread.lpp) {
            lppThread.lpp.resolve(result);
            return thread.stopThisScript();
          }
          this.handleException(result);
        } catch (e) {
          this.handleError(e);
        }
      }
      /**
       * Execute in new scope.
       * @param args ID for finding where the branch is.
       * @param util Scratch util.
       * @returns Wait for the branch to finish.
       */
      scope(args, util) {
        const { thread, target } = util;
        this.util = util;
        try {
          const block = this.getActiveBlockInstance(args, thread);
          const id = block.inputs.SUBSTACK?.block;
          if (!id)
            return;
          if (!this.util)
            throw new Error("lpp: util used initialization");
          const controller = new ThreadController(
            this.vm.runtime,
            this.util
          );
          const parentThread = thread;
          return this.asap(
            ImmediatePromise.sync(
              new ImmediatePromise((resolve) => {
                const scopeThread = controller.create(id, target);
                scopeThread.lpp = new LppContext(
                  parentThread.lpp ?? void 0,
                  (value) => {
                    if (parentThread.lpp) {
                      parentThread.lpp.resolve(value);
                    } else
                      throw new LppError("useOutsideFunction");
                  }
                );
                resolve(controller.wait(scopeThread).then(() => void 0));
              })
            ),
            thread
          );
        } catch (e) {
          this.handleError(e);
        }
      }
      /**
       * Catch exceptions.
       * @param args ID for finding where the branch is.
       * @param util Scratch util.
       * @returns Wait for the function to finish.
       */
      try(args, util) {
        const { thread, target } = util;
        this.util = util;
        try {
          const block = this.getActiveBlockInstance(args, thread);
          const dest = Wrapper.unwrap(args.var);
          if (!(dest instanceof LppReference))
            throw new LppError("syntaxError");
          const id = block.inputs.SUBSTACK?.block;
          if (!id)
            return;
          if (!this.util)
            throw new Error("lpp: util used before initialization");
          const controller = new ThreadController(
            this.vm.runtime,
            this.util
          );
          const captureId = block.inputs.SUBSTACK_2?.block;
          const parentThread = thread;
          const tryThread = controller.create(id, target);
          let triggered = false;
          return this.asap(
            ImmediatePromise.sync(
              new ImmediatePromise((resolve) => {
                tryThread.lpp = new LppContext(
                  parentThread.lpp ?? void 0,
                  (value) => {
                    if (value instanceof LppReturn) {
                      if (parentThread.lpp) {
                        parentThread.lpp.resolve(value);
                      } else
                        throw new LppError("useOutsideFunction");
                    } else {
                      triggered = true;
                      if (!captureId) {
                        resolve(void 0);
                        return;
                      }
                      const error = value.value;
                      if (error.instanceof(Global.Error)) {
                        const traceback = new LppArray(
                          value.stack.map((v) => new LppConstant(v.toString()))
                        );
                        error.set("stack", traceback);
                      }
                      dest.assign(error);
                      const catchThread = controller.create(captureId, target);
                      catchThread.lpp = new LppContext(
                        parentThread.lpp ?? void 0,
                        (value2) => {
                          if (parentThread.lpp) {
                            parentThread.lpp.resolve(value2);
                          } else {
                            if (value2 instanceof LppReturn)
                              throw new LppError("useOutsideFunction");
                            this.handleException(value2);
                          }
                        }
                      );
                      controller.wait(catchThread).then(() => {
                        resolve(void 0);
                      });
                    }
                  }
                );
                controller.wait(tryThread).then(() => {
                  if (!triggered) {
                    resolve(void 0);
                  }
                });
              })
            ),
            thread
          );
        } catch (e) {
          this.handleError(e);
        }
      }
      /**
       * Drops the value of specified expression.
       * @param args Unneccessary argument.
       * @param util Scratch util.
       */
      nop({ value }, util) {
        const { thread } = util;
        this.util = util;
        if (thread.stackClick && thread.atStackTop() && !thread.target.blocks.getBlock(thread.peekStack())?.next && value !== void 0) {
          if (thread.isCompiled) {
            this.vm.runtime.visualReport(thread.peekStack(), value);
          } else {
            return value;
          }
        }
        return void 0;
      }
      /**
       * Handle syntax error.
       * @param e Error object.
       */
      handleError(e) {
        if (e instanceof LppError) {
          const thread = this.util?.thread;
          if (thread) {
            const stack = thread.peekStack();
            if (stack) {
              warnError(
                this.Blockly,
                this.vm,
                Scratch2.translate,
                e.id,
                stack,
                thread.target.sprite.clones[0].id
              );
              this.vm.runtime.stopAll();
            }
          }
        }
        throw e;
      }
      /**
       * Handle unhandled exceptions.
       * @param e LppException object.
       */
      handleException(e) {
        warnException(this.Blockly, this.vm, Scratch2.translate, e);
        this.vm.runtime.stopAll();
        throw new Error("lpp: user exception");
      }
      /**
       * Process return value.
       * @param result Result value.
       * @param thread Caller thread.
       * @returns processed value.
       */
      processApplyValue(result, thread) {
        if (result instanceof LppReturn) {
          return result.value;
        } else {
          result.pushStack(
            new LppTraceback2.Block(
              thread.target.sprite.clones[0].id,
              thread.peekStack(),
              thread.lpp ?? void 0
            )
          );
          if (thread.lpp) {
            thread.lpp.resolve(result);
            return new LppConstant(null);
          }
          this.handleException(result);
        }
      }
      /**
       * Get active block instance of specified thread.
       * @param args Block arguments.
       * @param thread Thread.
       * @returns Block instance.
       */
      getActiveBlockInstance(args, thread) {
        const container = thread.target.blocks;
        const id = thread.isCompiled ? thread.peekStack() : container._cache._executeCached[thread.peekStack()]?._ops?.find(
          (v) => args === v._argValues
        )?.id;
        const block = id ? container.getBlock(id) ?? this.vm.runtime.flyoutBlocks.getBlock(id) : this.vm.runtime.flyoutBlocks.getBlock(thread.peekStack());
        if (!block) {
          throw new Error("lpp: cannot get active block");
        }
        return block;
      }
      /**
       * Get mutation of dedicated block.
       * @param args Block arguments.
       * @param thread Thread.
       * @returns mutation object.
       */
      getMutation(block) {
        return block.mutation;
      }
      /**
       * Create a dummy target.
       * @param Target Target constructor.
       * @param blocks Block container.
       * @returns Dummy target.
       */
      createDummyTarget(Target, blocks) {
        const target = new Target(
          {
            blocks,
            name: ""
          },
          this.vm.runtime
        );
        target.id = "";
        const warnFn = () => {
          this.handleError(new LppError("useAfterDispose"));
        };
        for (const key of Reflect.ownKeys(target.constructor.prototype)) {
          if (typeof key === "string" && key.startsWith("set")) {
            Reflect.set(target, key, warnFn);
          }
        }
        Reflect.set(target, "makeClone", warnFn);
        return target;
      }
      /**
       * Process result as soon as possible.
       * @param res Result.
       * @param thread Caller thread.
       * @returns Processed promise or value.
       */
      asap(res, thread) {
        if (!this.util)
          throw new Error("lpp: util used before initialization");
        const controller = new ThreadController(
          this.vm.runtime,
          this.util
        );
        const postProcess = () => {
          controller.step(thread);
        };
        return isPromise(res) ? new PromiseProxy(res, postProcess, postProcess) : res;
      }
      executeScratchAsync(Target, ctx) {
        if (hasMetadata(ctx.fn) && ctx.fn.metadata instanceof ScratchMetadata) {
          const metadata = ctx.fn.metadata;
          let target;
          if (metadata.target)
            target = this.vm.runtime.getTargetById(metadata.target);
          if (!target)
            target = this.createDummyTarget(Target, metadata.blocks[0]);
          const id = metadata.blocks[0].getBlock(metadata.blocks[1])?.inputs.SUBSTACK?.block;
          if (!id)
            return new LppReturn(new LppConstant(null));
          if (!this.util)
            throw new Error("lpp: util used before initialization");
          const controller = new ThreadController(
            this.vm.runtime,
            this.util
          );
          const thread = controller.create(id, target);
          return ImmediatePromise.sync(
            new ImmediatePromise((resolve) => {
              const lpp = thread.lpp = new LppAsyncFunctionContext(
                metadata.closure,
                ctx.self ?? new LppConstant(null),
                (val) => {
                  resolve(val);
                }
              );
              for (const [key, value] of metadata.signature.entries()) {
                if (key < ctx.args.length)
                  thread.lpp.closure.set(value, ctx.args[key]);
                else
                  thread.lpp.closure.set(value, new LppConstant(null));
              }
              controller.wait(thread).then(() => {
                lpp.detach();
                lpp.promise?.resolve(new LppConstant(null));
              });
            })
          );
        }
        return new LppReturn(new LppConstant(null));
      }
      executeScratch(Target, ctx) {
        if (hasMetadata(ctx.fn) && ctx.fn.metadata instanceof ScratchMetadata) {
          const metadata = ctx.fn.metadata;
          let target;
          if (metadata.target)
            target = this.vm.runtime.getTargetById(metadata.target);
          if (!target)
            target = this.createDummyTarget(Target, metadata.blocks[0]);
          const id = metadata.blocks[0].getBlock(metadata.blocks[1])?.inputs.SUBSTACK?.block;
          if (!id)
            return new LppReturn(new LppConstant(null));
          if (!this.util)
            throw new Error("lpp: util used before initialization");
          const controller = new ThreadController(
            this.vm.runtime,
            this.util
          );
          const thread = controller.create(id, target);
          return ImmediatePromise.sync(
            new ImmediatePromise((resolve) => {
              const lpp = thread.lpp = new LppFunctionContext(
                metadata.closure,
                ctx.self ?? new LppConstant(null),
                (val) => {
                  resolve(val);
                }
              );
              for (const [key, value] of metadata.signature.entries()) {
                if (key < ctx.args.length)
                  thread.lpp.closure.set(value, ctx.args[key]);
                else
                  thread.lpp.closure.set(value, new LppConstant(null));
              }
              controller.wait(thread).then(() => {
                lpp.resolve(new LppReturn(new LppConstant(null)));
              });
            })
          );
        }
        return new LppReturn(new LppConstant(null));
      }
      /**
       * Serialize function.
       * @param block Function block instance.
       * @param blocks Blocks instance.
       * @param signature Function signature.
       * @returns LppFunction result.
       */
      static serializeFunction(block, blocks, signature) {
        const info = {
          signature,
          script: serializeBlock(blocks, block),
          block: block.id
        };
        return ffi_exports.fromObject(info);
      }
    }
    Scratch2.extensions.register(new LppExtension(Scratch2.vm.runtime));
  })(Scratch);
})();
