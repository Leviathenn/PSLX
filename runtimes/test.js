const fs = require("fs");
const testTable = {
    "add": (a,b)=>{
        return a + b;
    }
}

const tt = {

}
tt["test"] = testTable.add;
delete testTable;
fs.writeFileSync("test.json",JSON.stringify(tt));