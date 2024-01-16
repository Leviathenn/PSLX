/**
 * @author Leviathan
 */

import axios from 'axios';
import * as winston from 'winston'
import * as fs from 'fs';
import * as diff2html from 'diff2html';

import { config } from "./config"

import * as bundler from "./bundler"

const commandLineArguments:string[] = [];
const options:string[] = [];
const ignoreArgs = [process.argv[0], process.argv[1]];


if(fs.existsSync(config.configFolder)){
    if(fs.existsSync(config.runtimeFolder)){

    }else{
        fs.mkdirSync(config.runtimeFolder);
        config.runtimes.forEach(runtime => {
            bundler.downloadRuntimes(runtime, true);
        })
    }
}else{
    fs.mkdirSync(config.configFolder);
    if(fs.existsSync(config.runtimeFolder)){

    }else{
        fs.mkdirSync(config.runtimeFolder);
        config.runtimes.forEach(runtime => {
            bundler.downloadRuntimes(runtime, true);
        })
    }
}


if(fs.existsSync("app.log")){
    fs.rmSync("app.log");
}else{

}
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(i => `[${i.timestamp}][${i.level.toUpperCase()}]: ${i.message.replace(/(\r\n|\n|\r)/gm, "")}`)
    ),
    transports: [
      new winston.transports.File({ filename: "error.log", level: "warn" }),
      new winston.transports.File({ filename: "app.log" }),
    ],
});
function findData(code: string, name: string): any {
    const regexVariable = new RegExp(`(var|let|const)\\s+${name}\\s*=\\s*([^;]+);`);
    const regexFunction = new RegExp(`${name}\\s*\\(([^)]*)\\)\\s*{([^}]*)}`);

    const matchVariable = code.match(regexVariable);
    const matchFunction = code.match(regexFunction);
    const toReturn = [];

    if (matchVariable) {
        const [, declaration, value] = matchVariable;
        
        toReturn.push(declaration,name,value.trim());
    } else if (matchFunction) {
        const [, parameters, body] = matchFunction;
        
        toReturn.push(name,parameters,body);
        
    } else {
        
        toReturn.push("error");
    }
    return toReturn;
}


const log: any = {}
log.log = function(data: any){
    logger.info(data);
    console.log(data);
}
log.warn = function(data: any){
    logger.warn(data);
    console.warn(data);
}
log.error = function(data: any,error:any){
    logger.error(error);
    
    console.error(data);
}

function Usage(){
    return `
        ./PSLX | PSLX <option> <url | mergefile> 
    `
}
console.log(findData(fs.readFileSync("runtimes/go.txt").toString(),"syscall/js.copyBytesToGo"));

process.argv.forEach(arg => {
    if(!ignoreArgs.includes(arg)){
     if(arg.startsWith("--") || arg.startsWith("-")){
            if(arg.startsWith("--")){
                options.push(arg.split("--")[1]);
              
            }else if(arg.startsWith("-")){
                options.push(arg.split("-")[1]);
            }
        }else{
            commandLineArguments.push(arg)
        }
    }else{
     
    }
});

    

if(commandLineArguments.length == 0){
    console.log(Usage());
    process.exit(1);
}else{

}
const currentMode = commandLineArguments[0];
const projName = commandLineArguments[1];
log.log(`
Mode: ${currentMode},
Options: ${commandLineArguments}
Toggles: ${options ? ["none"] : [0]}

`)
if(currentMode == "merge"){
  try {
    if(fs.statSync(projName).isDirectory()){
        
        
        // Example usage
        const yourCode = `
        function addr(one, two){
            return one + two;
        }
        
        let randomCode = true;
        let isThisRandom = true;
        console.log(\`
            random: \${randomCode ? 'yup' : 'nope'},
            isIt?: \${isThisRandom ? 'yup' : 'nope'}
        \`);
        `;
        
        const functionNameToFind = 'randomCode';
     
    };
  } catch (error) {
    log.error(`Error! Check Log for Details.`,error);
  }   
}