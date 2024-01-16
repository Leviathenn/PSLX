/**
 * @author Leviathan
 */

const commandLineArguments = [];
const ignoreArgs = [process.argv[0], process.argv[1]];
function Usage(){
    return `
        ./PSLX | PSLX <option> <url | mergefile> 
    `
}
process.argv.forEach(arg => {
    if(!ignoreArgs.includes(arg)){
        commandLineArguments.push(arg)
    }else{
        
    }
});

if(commandLineArguments.length == 0){
    console.log(Usage());
    process.exit(1);
}
