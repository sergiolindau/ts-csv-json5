import * as fs from 'fs'
import * as es from 'event-stream'

export const lineParser = (
    path: fs.PathLike,
    encoding: BufferEncoding,
    linecallback: (line: string, srcStream?: es.MapStream) => void,
    errorcallback: (err: Error) => void,
    endcallback: () => void
) => {
    let srcStream = fs
        .createReadStream(path, encoding)
        .pipe(es.split())
        .pipe(es.mapSync((line: string) => { linecallback(line, srcStream) }))
        .on('error', errorcallback)
        .on('end', endcallback)
}
