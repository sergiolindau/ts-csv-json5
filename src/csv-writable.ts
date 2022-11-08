/**
 * File: csv-writable.ts
 * Purpose: Implements CsvWritable class extending Writable class.
 */

import { Writable } from 'stream';
import { CsvParser, CsvParserOptions } from "./csv-parser";

export class CsvWritableStream extends Writable {
    protected csv: CsvParser;
    constructor(options?: CsvParserOptions) {
        super();
        this.csv = CsvParser.create(options);
    }
    _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null | undefined) => void): void {
        this.csv.parse(chunk);
        callback(null);
    }
    end(): this {
        this.csv.accept();
        //TODO: remove debug
        console.log('csv-writable.ts: end');
        super.end();
        return this;
    }
}