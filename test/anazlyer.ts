import * as fs from 'fs/promises';

async function readWasmFile(filePath: string): Promise<Uint8Array> {
  try {
    // Read the file asynchronously
    const wasmBuffer = await fs.readFile(filePath);

    // Convert the buffer to Uint8Array
    const wasmBytes = new Uint8Array(wasmBuffer);

    return wasmBytes;
  } catch (error) {
    throw new Error(`Error reading WebAssembly file: ${error.message}`);
  }
}

// Example usage
async function analyzeWasmImports(wasmBytes: Uint8Array): Promise<void> {
    // Instantiate the WebAssembly module
    const wasmModule = new WebAssembly.Module(wasmBytes);
  
    // Extract imports
    const imports = WebAssembly.Module.imports(wasmModule);
  
    // Log the imports
    console.log('Imports:');
    imports.forEach((importDesc) => {
      console.log(`Module: ${importDesc.module}, Name: ${importDesc.name}`);
    });
  }
  
  // Example usage
  const wasmFilePath = 'test.wasm';
readWasmFile(wasmFilePath)
  .then((wasmBytes) => {
    // Now you can use wasmBytes in the analyzeWasmImports function or any other analysis logic
    analyzeWasmImports(wasmBytes);
  })
  .catch((error) => {
    console.error(error);
  });
  