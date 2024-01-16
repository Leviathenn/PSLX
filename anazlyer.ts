/**
 * @author Leviathen
 */
import * as fs from 'fs/promises';

async function readWasmFile(filePath: string): Promise<Uint8Array> {
  try {
   
    const wasmBuffer = await fs.readFile(filePath);

 
    const wasmBytes = new Uint8Array(wasmBuffer);

    return wasmBytes;
  } catch (error) {
    throw new Error(`Error reading WebAssembly file: ${error.message}`);
  }
}

async function analyzeWasmImports(wasmBytes: Uint8Array, callback: (data: string[]) => void) {
    
    const wasmModule = new WebAssembly.Module(wasmBytes);

    const imports = WebAssembly.Module.imports(wasmModule);
    const toReturn = [];

    imports.forEach((importDesc) => {
     
      let toPush = {};
      switch (importDesc.module) {
        case "gojs":
            toPush["runtime"] = "go";
            break;
        default:
            break;
      }
      toPush["syscall"] = importDesc.name;
      toPush["callType"] = importDesc.kind;
      toReturn.push(toPush);
    });
   callback(toReturn); 
  }
  const wasmFilePath = 'test/test.wasm';
readWasmFile(wasmFilePath)
  .then((wasmBytes) => {
   
    analyzeWasmImports(wasmBytes, (data)=>{
        console.log(data);
    });
  })
  .catch((error) => {
    console.error(error);
  });
  