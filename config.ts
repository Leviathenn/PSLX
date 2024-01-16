import { userInfo } from "os";


export const config = {
    configFolder: `${userInfo().homedir}/.pslx`,
    runtimeFolder:  `${userInfo().homedir}/.pslx/runtimes`,
    runtimes: [
        "go"
    ]
}