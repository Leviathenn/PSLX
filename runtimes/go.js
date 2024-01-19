
/**
 * @author Leviathenn
 * @description CODE WAS TAKEN AND BUNDLED FOR WASM_EXEC.JS!
 * @executeCMD cp cp $(go env GOROOT)/misc/wasm/wasm_exec.js go-original.js
*/
export const GoLib = {
    "manditoryValues": ()=>{
        return `
        this.argv = ["js"];
        this.env = {};
        this.exit = (code) => {
            if (code !== 0) {
                console.warn("exit code:", code);
            }
        };
        this._exitPromise = new Promise((resolve) => {
            this._resolveExitPromise = resolve;
        });
        this._pendingEvent = null;
        this._scheduledTimeouts = new Map();
        this._nextCallbackTimeoutID = 1;

        this.setInt64 = (addr, v) => {
            this.mem.setUint32(addr + 0, v, true);
            this.mem.setUint32(addr + 4, Math.floor(v / 4294967296), true);
        }

        this.setInt32 = (addr, v) => {
            this.mem.setUint32(addr + 0, v, true);
        }

        this.getInt64 = (addr) => {
            const low = this.mem.getUint32(addr + 0, true);
            const high = this.mem.getInt32(addr + 4, true);
            return low + high * 4294967296;
        }

        this.loadValue = (addr) => {
            this.f = this.mem.getFloat64(addr, true);
            if (f === 0) {
                return undefined;
            }
            if (!isNaN(f)) {
                return f;
            }

            const id = this.mem.getUint32(addr, true);
            return this._values[id];
        }

        this.storeValue = (addr, v) => {
            const nanHead = 0x7FF80000;

            if (typeof v === "number" && v !== 0) {
                if (isNaN(v)) {
                    this.mem.setUint32(addr + 4, nanHead, true);
                    this.mem.setUint32(addr, 0, true);
                    return;
                }
                this.mem.setFloat64(addr, v, true);
                return;
            }

            if (v === undefined) {
                this.mem.setFloat64(addr, 0, true);
                return;
            }

            let id = this._ids.get(v);
            if (id === undefined) {
                id = this._idPool.pop();
                if (id === undefined) {
                    id = this._values.length;
                }
                this._values[id] = v;
                this._goRefCounts[id] = 0;
                this._ids.set(v, id);
            }
            this._goRefCounts[id]++;
            let typeFlag = 0;
            switch (typeof v) {
                case "object":
                    if (v !== null) {
                        typeFlag = 1;
                    }
                    break;
                case "string":
                    typeFlag = 2;
                    break;
                case "symbol":
                    typeFlag = 3;
                    break;
                case "function":
                    typeFlag = 4;
                    break;
            }
            this.mem.setUint32(addr + 4, nanHead | typeFlag, true);
            this.mem.setUint32(addr, id, true);
        }

        this.loadSlice = (addr) => {
            const array = getInt64(addr + 0);
            const len = getInt64(addr + 8);
            return new Uint8Array(this._inst.exports.mem.buffer, array, len);
        }

        this.loadSliceOfValues = (addr) => {
            const array = getInt64(addr + 0);
            const len = getInt64(addr + 8);
            const a = new Array(len);
            for (let i = 0; i < len; i++) {
                a[i] = loadValue(array + i * 8);
            }
            return a;
        }

        this.loadString = (addr) => {
            const saddr = getInt64(addr + 0);
            const len = getInt64(addr + 8);
            return decoder.decode(new DataView(this._inst.exports.mem.buffer, saddr, len));
        }

        const timeOrigin = Date.now() - performance.now();
        this.importObject = {
            _gotest: {
                add: (a, b) => a + b,
            },

        `
    },
    "runtime.wasmExit": (sp) => {
        return `
        "runtime.wasmExit": (sp) => {
          sp >>>= 0;
          const code = this.mem.getInt32(sp + 8, true);
          this.exited = true;
          delete this._inst;
          delete this._values;
          delete this._goRefCounts;
          delete this._ids;
          delete this._idPool;
          this.exit(code);
        }
        `;
      },
      
      "runtime.wasmWrite": (sp) => {
        return `
        "runtime.wasmWrite": (sp) => {
          sp >>>= 0;
          const fd = getInt64(sp + 8);
          const p = getInt64(sp + 16);
          const n = this.mem.getInt32(sp + 24, true);
          fs.writeSync(fd, new Uint8Array(this._inst.exports.mem.buffer, p, n));
        }
        `;
      },
      
      "runtime.resetMemoryDataView": (sp) => {
        return `
        "runtime.resetMemoryDataView": (sp) => {
          sp >>>= 0;
          this.mem = new DataView(this._inst.exports.mem.buffer);
        }
        `;
      },
      
      "runtime.nanotime1": (sp) => {
        return `
        "runtime.nanotime1": (sp) => {
          sp >>>= 0;
          setInt64(sp + 8, (timeOrigin + performance.now()) * 1000000);
        }
        `;
      },
      
      "runtime.walltime": (sp) => {
        return `
        "runtime.walltime": (sp) => {
          sp >>>= 0;
          const msec = (new Date).getTime();
          setInt64(sp + 8, msec / 1000);
          this.mem.setInt32(sp + 16, (msec % 1000) * 1000000, true);
        }
        `;
      },
      
      "runtime.scheduleTimeoutEvent": (sp) => {
        return `
        "runtime.scheduleTimeoutEvent": (sp) => {
          sp >>>= 0;
          const id = this._nextCallbackTimeoutID;
          this._nextCallbackTimeoutID++;
          this._scheduledTimeouts.set(id, setTimeout(
            () => {
              this._resume();
              while (this._scheduledTimeouts.has(id)) {
                console.warn("scheduleTimeoutEvent: missed timeout event");
                this._resume();
              }
            },
            getInt64(sp + 8),
          ));
          this.mem.setInt32(sp + 16, id, true);
        }
        `;
      },
      
      "runtime.clearTimeoutEvent": (sp) => {
        return `
        "runtime.clearTimeoutEvent": (sp) => {
          sp >>>= 0;
          const id = this.mem.getInt32(sp + 8, true);
          clearTimeout(this._scheduledTimeouts.get(id));
          this._scheduledTimeouts.delete(id);
        }
        `;
      },
      
      "runtime.getRandomData": (sp) => {
        return `
        "runtime.getRandomData": (sp) => {
          sp >>>= 0;
          crypto.getRandomValues(loadSlice(sp + 8));
        }
        `;
      },
      
      "syscall/js.finalizeRef": (sp) => {
        return `
        "syscall/js.finalizeRef": (sp) => {
          sp >>>= 0;
          const id = this.mem.getUint32(sp + 8, true);
          this._goRefCounts[id]--;
          if (this._goRefCounts[id] === 0) {
            const v = this._values[id];
            this._values[id] = null;
            this._ids.delete(v);
            this._idPool.push(id);
          }
        }
        `;
      },
      
      "syscall/js.stringVal": (sp) => {
        return `
        "syscall/js.stringVal": (sp) => {
          sp >>>= 0;
          storeValue(sp + 24, loadString(sp + 8));
        }
        `;
      },
      
      "syscall/js.valueGet": (sp) => {
        return `
        "syscall/js.valueGet": (sp) => {
          sp >>>= 0;
          const result = Reflect.get(loadValue(sp + 8), loadString(sp + 16));
          sp = this._inst.exports.getsp() >>> 0;
          storeValue(sp + 32, result);
        }
        `;
      },
      
      "syscall/js.valueSet": (sp) => {
        return `
        "syscall/js.valueSet": (sp) => {
          sp >>>= 0;
          Reflect.set(loadValue(sp + 8), loadString(sp + 16), loadValue(sp + 32));
        }
        `;
      },
      
      "syscall/js.valueDelete": (sp) => {
        return `
        "syscall/js.valueDelete": (sp) => {
          sp >>>= 0;
          Reflect.deleteProperty(loadValue(sp + 8), loadString(sp + 16));
        }
        `;
      },
      
      "syscall/js.valueIndex": (sp) => {
        return `
        "syscall/js.valueIndex": (sp) => {
          sp >>>= 0;
          storeValue(sp + 24, Reflect.get(loadValue(sp + 8), getInt64(sp + 16)));
        }
        `;
      },
      
      "syscall/js.valueSetIndex": (sp) => {
        return `
        "syscall/js.valueSetIndex": (sp) => {
          sp >>>= 0;
          Reflect.set(loadValue(sp + 8), getInt64(sp + 16), loadValue(sp + 24));
        }
        `;
      },
      
      "syscall/js.valueCall": (sp) => {
        return `
        "syscall/js.valueCall": (sp) => {
          sp >>>= 0;
          try {
            const v = loadValue(sp + 8);
            const m = Reflect.get(v, loadString(sp + 16));
            const args = loadSliceOfValues(sp + 32);
            const result = Reflect.apply(m, v, args);
            sp = this._inst.exports.getsp() >>> 0;
            storeValue(sp + 56, result);
            this.mem.setUint8(sp + 64, 1);
          } catch (err) {
            sp = this._inst.exports.getsp() >>> 0;
            storeValue(sp + 56, err);
            this.mem.setUint8(sp + 64, 0);
          }
        }
        `;
      },
      
      "syscall/js.valueInvoke": (sp) => {
        return `
        "syscall/js.valueInvoke": (sp) => {
          sp >>>= 0;
          try {
            const v = loadValue(sp + 8);
            const args = loadSliceOfValues(sp + 16);
            const result = Reflect.apply(v, undefined, args);
            sp = this._inst.exports.getsp() >>> 0;
            storeValue(sp + 40, result);
            this.mem.setUint8(sp + 48, 1);
          } catch (err) {
            sp = this._inst.exports.getsp() >>> 0;
            storeValue(sp + 40, err);
            this.mem.setUint8(sp + 48, 0);
          }
        }
        `;
      },
      
      "syscall/js.valueNew": (sp) => {
        return `
        "syscall/js.valueNew": (sp) => {
          sp >>>= 0;
          try {
            const v = loadValue(sp + 8);
            const args = loadSliceOfValues(sp + 16);
            const result = Reflect.construct(v, args);
            sp = this._inst.exports.getsp() >>> 0;
            storeValue(sp + 40, result);
            this.mem.setUint8(sp + 48, 1);
          } catch (err) {
            sp = this._inst.exports.getsp() >>> 0;
            storeValue(sp + 40, err);
            this.mem.setUint8(sp + 48, 0);
          }
        }
        `;
      },
      
      "syscall/js.valueLength": (sp) => {
        return `
        "syscall/js.valueLength": (sp) => {
          sp >>>= 0;
          setInt64(sp + 16, parseInt(loadValue(sp + 8).length));
        }
        `;
      },
      
      "syscall/js.valuePrepareString": (sp) => {
        return `
        "syscall/js.valuePrepareString": (sp) => {
          sp >>>= 0;
          const str = encoder.encode(String(loadValue(sp + 8)));
          storeValue(sp + 16, str);
          setInt64(sp + 24, str.length);
        }
        `;
      },
      
      "syscall/js.valueLoadString": (sp) => {
        return `
        "syscall/js.valueLoadString": (sp) => {
          sp >>>= 0;
          const str = loadValue(sp + 8);
          loadSlice(sp + 16).set(str);
        }
        `;
      },
      
      "syscall/js.valueInstanceOf": (sp) => {
        return `
        "syscall/js.valueInstanceOf": (sp) => {
          sp >>>= 0;
          this.mem.setUint8(sp + 24, (loadValue(sp + 8) instanceof loadValue(sp + 16)) ? 1 : 0);
        }
        `;
      },
      
      "syscall/js.copyBytesToGo": (sp) => {
        return `
        "syscall/js.copyBytesToGo": (sp) => {
          sp >>>= 0;
          const dst = loadSlice(sp + 8);
          const src = loadValue(sp + 32);
          if (!(src instanceof Uint8Array || src instanceof Uint8ClampedArray)) {
            this.mem.setUint8(sp + 48, 0);
            return;
          }
          const toCopy = src.subarray(0, dst.length);
          dst.set(toCopy);
          setInt64(sp + 40, toCopy.length);
          this.mem.setUint8(sp + 48, 1);
        }
        `;
      },
      
      "syscall/js.copyBytesToJS": (sp) => {
        return `
        "syscall/js.copyBytesToJS": (sp) => {
          sp >>>= 0;
          const dst = loadValue(sp + 8);
          const src = loadSlice(sp + 16);
          if (!(dst instanceof Uint8Array || dst instanceof Uint8ClampedArray)) {
            this.mem.setUint8(sp + 48, 0);
            return;
          }
          const toCopy = src.subarray(0, dst.length);
          dst.set(toCopy);
          setInt64(sp + 40, toCopy.length);
          this.mem.setUint8(sp + 48, 1);
        }
        `;
      },
      
      "debug": (sp) => {
        return `
        "debug": (sp) => {
          sp >>>= 0;
          console.log(sp);
        }
        `;
      },      
}