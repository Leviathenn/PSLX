const fs = require('fs');

// Read the compiled WebAssembly module from file
const wasmCode = fs.readFileSync('test.wasm');

const imports = { }

const wasmModule = new WebAssembly.Module(wasmCode);

// Create an instance of WebAssembly.Instance


const wasmInstance = new WebAssembly.Instance(wasmModule);

// Call the exported function if needed
if (wasmInstance.exports.$_Lfunc_exp1) {
  wasmInstance.exports.$_Lfunc_exp1();
}