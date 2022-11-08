import * as fs from 'fs'
import * as http from 'http'
import * as https from 'https'

/**
 * Source: https://www.geeksforgeeks.org/how-to-download-a-file-using-node-js/
 * @param path 
 * @param url 
 * @returns 
 */
export const downloadFile = async (url: string, path: fs.PathLike, callback?: (url: string, path: fs.PathLike) => void) => {
    const protocol = url.substring(0, url.indexOf(':'))
    let protocol_module
    if (protocol === 'https') {
        protocol_module = https
    }
    else {
        protocol_module = http
    }
    protocol_module.get(url, (res: http.IncomingMessage) => {
        const filePath = fs.createWriteStream(path)
        res.pipe(filePath)
        filePath.on('finish', () => {
            filePath.close()
            if (callback) callback(url, path)
        })
    })
}

/**
 * Source: https://www.javaniceday.com/post/download-and-save-a-file-in-node-js
 * @param url - the url where we have our file
 * @param path - the full file path where we want to store our image
 * @return {Promise<>}
 */
export const downloadFilePromise = async (url: string, path: fs.PathOrFileDescriptor): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        https.get(url, (resp: http.IncomingMessage) => {

            // chunk received from the server
            resp.on('data', (chunk) => {
                fs.appendFileSync(path, chunk)
            })

            // last chunk received, we are done
            resp.on('end', () => {
                resolve(true)
            })

        }).on('error', (err) => {
            reject(new Error(err.message))
        })
    })
}


export const downloadAppend = async (
    url: string,
    path: fs.PathOrFileDescriptor
): Promise<void> => {
    return new Promise((resolve, reject) => {
        (url.startsWith('https') ? https : http).get(url, (resp: http.IncomingMessage) => {
            // chunk received from the server
            resp.on('data', (chunk) => {
                fs.appendFileSync(path, chunk)
            })
            // last chunk received, we are done
            resp.on('end', () => {
                resolve()
            })

        }).on('error', (err) => {
            reject(new Error(err.message))
        })
    })
}

// **** Overloading

export function add(first: number, second: number): number;    //Overload signature with two parameters
export function add(first: number, second: number, third:number): number;  //Overload signature with three parameters
export function add(first: number, second: number, third?: number, fourth?: number): number {  //Implementation signature
  if (first !== undefined && second !== undefined && third !== undefined) {
    return first + second + third;
  } else {
    return first + second;
  }
}

/*
declare global {
    interface String {
        toJSON: () => any;
    }
}

String.prototype.toJSON = function (): any {
    return JSON.parse(this.toString())
}/* */