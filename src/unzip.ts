/* The development of this file continues in other copy */
import * as fs from 'fs'
import * as yauzl from 'yauzl'

export const unzip = async (src: fs.PathLike, dest: fs.PathLike) => {
    return new Promise(
        async (
            resolve: (value?: unknown) => void,
            reject: (reason?: any) => void
        ) => {
            yauzl.open(src as string, { lazyEntries: true }, function (err, zipfile) {
                if (err) throw err
                zipfile.readEntry()
                zipfile.on('entry', function (entry) {
                    // file entry
                    zipfile.openReadStream(entry, function (err, readStream) {
                        if (err) throw err
                        readStream.on('end', function () {
                            zipfile.readEntry()
                        })
                        const streamPath = fs.createWriteStream(dest)
                        readStream.pipe(streamPath)
                        streamPath.on('finish', () => {
                            streamPath.close((err) => {
                                if (err) {
                                    reject(new Error(err.message))
                                }
                                else {
                                    resolve(true)
                                }
                            })
                        })
                        streamPath.on('error', (err) => {
                            streamPath.destroy()
                            fs.unlink(dest, (err) => {
                                if (err) {
                                    reject(new Error(err.message))
                                }
                            })
                        })
                    })
                })
            })
        })
}