import * as fs from 'fs'
import * as http from 'http'
import * as https from 'https'
import * as stream from 'stream'

/**
 * @file download.ts
 * @version 1.0.0
 * @date 2022-08-22
 * @description Provides download function that can make redirection, download to file, to memory and others.
 */

/**
 * `download` function URL parameter type
 */
export type downloadURL = string | URL

/**
 * Alias type for fs.PathLike
 */
export type PathLike = fs.PathLike

/**
 * Callback type for `download` function.
 */
export type downloadCallback = (url: string, path?: PathLike) => void

/**
 * Options type for `download` function.
 */
export type downloadOptions = BufferEncoding | stream.StreamOptions<stream.Stream>

/**
 * Download file from URL.
 * @param url 
 * @param path 
 * @param callback 
 * @param options 
 * @param timeout 
 * @returns 
 */
export const download = async (
    url: downloadURL,
    path?: PathLike | downloadCallback | downloadOptions | number,
    callback?: downloadCallback | downloadOptions | number,
    options?: downloadOptions | number,
    timeout?: number
): Promise<string | PathLike | void> => {
    if (url instanceof URL) {
        url = url.href
    }
    if (path) {
        if (typeof path === 'function') {
            if (options) timeout = options as any
            if (callback) options = callback as any
            callback = path
            path = undefined
        }
        if (callback) {
            if (typeof callback !== 'function') {
                if (typeof callback == 'number') {
                    timeout = callback
                    callback = undefined
                    options = undefined
                }
                else {
                    if (options) timeout = options as any
                    options = callback
                    callback = undefined
                }
            }
            if (options) {
                if (typeof options !== 'string') {
                    timeout = options as number
                    options = undefined
                }
            }
        }
        if (typeof path === 'number') {
            timeout = path
            path = undefined
        }
    }
    if (options && !(path)) {
        throw new Error("download function: options parameter cannot be specified without path parameter.")
    }
    return new Promise(
        (
            resolve: (value?: string | PathLike | void) => void,
            reject: (reason?: any) => void
        ) => {
            const request = ((url as string).startsWith('https') ? https : http).get(url, (res: http.IncomingMessage) => {
                if (res.statusCode === 200) {
                    if (path) {
                        const writableStream = fs.createWriteStream(path as PathLike, options as downloadOptions)
                        res.pipe(writableStream)
                        writableStream.on('finish', () => {
                            writableStream.close((err) => {
                                if (err) {
                                    reject(new Error(err.message))
                                }
                            })
                            if (callback) (callback as (url: string, path?: PathLike) => void)(url as string, path as PathLike)
                            resolve(path as PathLike)
                        })
                        writableStream.on('error', (err) => {
                            writableStream.destroy()
                            fs.unlink(path as PathLike, (err) => {
                                if (err) {
                                    reject(new Error(err.message))
                                }
                            })
                        })
                    }
                    else {
                        const buffer: Array<any> = []
                        res.on('data', (chunk) => {
                            buffer.push(chunk)
                        })
                        res.on('end', () => {
                            resolve(buffer.map((data: any) => data.toString()).join(''))
                        })
                    }

                } else if (res.statusCode === 302 || res.statusCode === 301) {
                    // Recursively follow redirects, only a 200 will resolve.
                    download(res.headers.location as string, path, callback, options, timeout).then(() => resolve())
                } else {
                    reject(new Error(`Download request failed, response status: ${res.statusCode} ${res.statusMessage}`))
                }
            })
                .on('error', (err) => {
                    reject(new Error(err.message))
                })
            if (timeout) {
                request.setTimeout(timeout, () => {
                    request.destroy()
                    reject(new Error(`Download timeout after ${(timeout as number) / 1e3} s`))
                })
            }
        }
    )
}

/**
 * Sources:
 * https://github.com/kevva/download/blob/master/index.js
 * https://stackoverflow.com/questions/35491322/download-synchronous-with-nodejs
 * https://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js-without-using-third-party-libraries
 * https://github.com/douzi8/ajax-request/blob/master/index.js
 * https://stackoverflow.com/questions/58875655/whats-the-difference-between-pipe-and-pipeline-on-streams
 * https://sebhastian.com/nodejs-download-file/
 * https://www.codegrepper.com/code-examples/javascript/node.js+download+file+from+url
 * https://www.codegrepper.com/code-examples/javascript/how+to+download+a+file+with+node+js
 * https://nodejs.dev/learn/reading-files-with-nodejs
 * https://futurestud.io/tutorials/node-js-how-to-download-a-file
 */