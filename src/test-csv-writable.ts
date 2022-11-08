/**
 * File: test-csv-writable.ts
 * Purpose: Implements CsvWritable test.
 */

const test_tiny = true;
const input_file = test_tiny ? 'data/allCountries.tiny.txt' : 'data/allCountries.perf.txt';

import * as fs from 'fs';
import { pipeline } from 'stream';
import { CsvWritableStream } from './csv-writable';

console.log('test-csv-writable.ts: Start.')

const srcStream = fs
    .createReadStream(input_file, {
        flags: 'r',
        encoding: 'utf8',
        autoClose: true,
    });

const destStream = new CsvWritableStream({
    delimiter: test_tiny ? '\t' : ',',
    quote: test_tiny ? '' : '"',
    /*onHeader: (record: string[], line?: number): string => {
        let result = `[HEADER] : ${JSON.stringify(record)}`.substring(0, 60) + '...';
        console.log(result);
        return result;
    },/* */
    /*onRecord: (data, line) => {
        console.log(line, JSON.stringify(data))
    }/* */
});

pipeline(
    srcStream,
    destStream,
    (err) => {
        if (err)
            console.error(err);
        else
            console.log('test-csv-writable.ts: pipeline callback().');
    }
).on('close', () => {
    console.log('test-csv-writable.ts: pipeline \'close\'.')
});

console.log('test-csv-writable.ts: main pipeline executing...');