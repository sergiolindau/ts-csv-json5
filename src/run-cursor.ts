export abstract class RunCursor {
    static run = (msg?: string, P = ["\\", "|", "/", "-"], tick = 100): NodeJS.Timer => {
        console.log(msg)
        let count = 0
        process.stdout.write("\n")
        return setInterval(() => {
            process.stdout.write(P[count++] + "\r")
            if (count >= P.length) count = 0
        }, tick)
    }

    static stop = async (ticker: NodeJS.Timer, wait: any, msg?: string) => {
        await wait
        clearInterval(ticker)
        if (msg) {
            console.log(msg)
        }
    }

    static startRun = (wait: any, start_msg?: string, stop_msg?: string, P = ["\\", "|", "/", "-"], tick = 100) => {
        RunCursor.stop(RunCursor.run(start_msg), wait, stop_msg)
    }

}