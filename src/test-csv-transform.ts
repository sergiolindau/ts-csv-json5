/**
 * File: test-csv-transform.ts
 * Purpose: Implements CsvTransform class test.
 */

const input_file = 'data/allCountries.tiny.txt';
const output_file = 'data/allCountries.test.txt';

import * as fs from 'fs';
import { pipeline } from 'stream';

import { CsvTransform } from './csv-transform'

const srcStream = fs
    .createReadStream(input_file, {
        flags: 'r',
        encoding: 'utf-8',
        autoClose: true,
    });

/*const destStream = fs
    .createWriteStream(output_file, {
        flags: 'w',
        encoding: 'utf-8',
        autoClose: true,
    });/* */

const transformStream = CsvTransform.create({
    separator: '\t',
    quote: '',
    onRecord: (record: string[], line?: number): string => {
        return `${line}: ["${record.join('","')}"]\r\n`;
    },
    onFlush: () => {
        //destStream.write(transformStream.parsed);
        process.stdout.write(transformStream.parsed);
    }
})

pipeline(
    srcStream,
    transformStream,
    process.stdout,
    (err) => {
        if (err)
            console.error(err);
        else
            console.error("success");
    }
)

console.log('test-csv-transform.ts: Done.')