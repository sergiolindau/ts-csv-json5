import * as fs from 'fs'
import * as es from 'event-stream'

export const lineTranslator = (
    input: fs.PathLike,
    output: fs.PathLike,
    encoding: BufferEncoding,
    transform: (line: string, srcStream?: es.MapStream) => string,
    rerror: (err: Error) => void,
    werror: (error: Error | null | undefined) => void,
    end: () => void,
    nl: '\n' | '\r\n' | null = '\n'
) => {
    const destStream = fs
        .createWriteStream(output, encoding)
    let srcStream = fs
        .createReadStream(input, encoding)
        .pipe(es.split())
        .pipe(es.mapSync((line: string) => {
            const canContinue = destStream.write(
                transform(line, srcStream) + (nl ? nl : ''),
                error => { if (error) werror(error); }
            )
            if (!canContinue) {
                srcStream.pause();
                destStream.once('drain', () => srcStream.resume())
            }
        }))
        .on('error', rerror)
        .on('end', () => {
            destStream.end();
            if (end) end();
        })
}
