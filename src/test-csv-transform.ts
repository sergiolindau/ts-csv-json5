/**
 * File: test-csv-transform.ts
 * Purpose: Implements CsvTransform test.
 */

const test_tiny_stdout = false;
const test_generate_perf = true;
const test_generate_perf_lineno = 200000;
const input_file = test_tiny_stdout ? 'data/allCountries.tiny.txt' : 'data/allCountries.big.txt';
const output_file = test_generate_perf ? 'data/allCountries.perf.txt' : 'data/allCountries.test.txt';

import * as fs from 'fs';
import { pipeline } from 'stream';

import { CsvTransform } from './csv-transform'

console.log('test-csv-transform.ts: Start.');

const srcStream = fs
    .createReadStream(input_file, {
        flags: 'r',
        encoding: 'utf-8',
        autoClose: true,
    });

var destStream!: fs.WriteStream;

if (!test_tiny_stdout) {
    destStream = fs
        .createWriteStream(output_file, {
            flags: 'w',
            encoding: 'utf-8',
            autoClose: true,
        });
}

const transformStream = CsvTransform.create({
    delimiter: '\t',
    quote: '',
    onRecord: (record: string[], line?: number): string => {
        if (test_generate_perf) {
            if (line! < test_generate_perf_lineno) {
                return `"${record.map(field => field.replace(/"/g, '""')).join('","')}"\r\n`;
            }
            else {
                return ''
            }
        }
        else {
            return `${line}: ["${record.join('","')}"]\r\n`;
        }
    }
})


pipeline(
    srcStream,
    transformStream,
    test_tiny_stdout ? process.stdout : destStream,
    (err) => {
            if (err)
                console.error(err);
            else
                console.log('test-csv-transform.ts: pipeline callback().');
        }
).on('close', () => {
    console.log('test-csv-transform.ts: pipeline \'close\'.');
})

console.log('test-csv-transform.ts: main pipeline executing...');