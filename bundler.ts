/**
 * @author Leviathenn
 */

import * as fs from 'fs';
import { log } from "winston"
import { execSync, exec } from "child_process"
import { config } from "./config"
let MODULE_PATHS = {
    "go":()=>{
        if(fs.existsSync("runtimes/go.js")){

        }else{       
           
            execSync(`/bin/bash -c "cp $(go env GOROOT)/misc/wasm/wasm_exec.js ${config.runtimeFolder}/go.js"`);
        }
    }
}

export function downloadRuntimes(runtime: string, logging: boolean) {
    switch (runtime) {
        case "go":

            execSync(`/bin/bash -c "cp $(go env GOROOT)/misc/wasm/wasm_exec.js ${config.runtimeFolder}/go.js"`);
            if(logging){
                console.log("Installed go runtime.")
            }else{
                
            }
            break;
    
        default:
            break;
    }
}
export function bundleFunction(library: string, func: string){
    switch (library) {
        case "go":
                
            break;
    
        default:
            break;
    }
}