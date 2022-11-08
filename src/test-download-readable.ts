/**
 * File: test-download-readable.ts
 * Purpose: Implements CsvWritable class extending Writable class.
 */

import * as http from 'http'
import * as https from 'https'
import { Readable, ReadableOptions } from 'stream';

const test_url = 'http://download.geonames.org/export/dump/featureCodes_en.txt'
const use_stdout = false;
const output_file = use_stdout ? '' : 'data/download.test.txt';

// This data can also come from other streams :]
let dataToStream = [
    'This is line 1\n'
    , 'This is line 2\n'
    , 'This is line 3\n'
]

export interface DownloadReadableCofiguration {

}

export type DownloadReadableOptions = Partial<DownloadReadableCofiguration>;

class DownloadReadable extends Readable {
    constructor(options?: ReadableOptions & DownloadReadableOptions | undefined) {
        super(options);
        this.setOptions(options);
        this.on('end', () => {super.emit('close');})
    }
    setOptions(opts?: ReadableOptions & DownloadReadableOptions | undefined) {

    }
    _read() {
        // The consumer is ready for more data
        this.push(dataToStream.shift())
        if (!dataToStream.length) {
            this.push(null) // End the stream
            
        }
    }

    _destroy() {
        // Not necessary, but illustrates things to do on end
        //dataToStream = null
    }
}



let i = 0;

export const download = async (
    url: string | URL,
): Promise<string | fs.PathLike | void> => {
    return new Promise(
        (
            resolve: (value?: string | fs.PathLike | void) => void,
            reject: (reason?: any) => void
        ) => {
            const request = ((url as string).startsWith('https') ? https : http).get(url, (res: http.IncomingMessage) => {
                console.log('request callback')
                res.on('data', (chunk) => {
                    console.log(i++);
                    if (i == 4) {
                        res.pause();
                        res.resume();
                    }
                })
            })
        })
}


import * as fs from 'fs';
import { pipeline } from 'stream';



const destStream = use_stdout ?
    process.stdout :
    fs
        .createWriteStream(output_file, {
            flags: 'w',
            encoding: 'utf-8',
            autoClose: true,
        });

//download(test_url);

console.log('test-download-readable.ts: Start.')

const srcStream = new DownloadReadable(test_url);

pipeline(
    srcStream,
    destStream,
    (err) => {
        if (err)
            console.error(err);
        else
            console.log('test-download-readable.ts: pipeline callback().');
    }
).on('close', () => {
    console.log('test-csv-writable.ts: pipeline \'close\'.')
});

console.log('test-download-readable.ts: main pipeline executing...')
