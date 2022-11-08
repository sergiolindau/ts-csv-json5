/**
 * File: csv-transform.ts
 * Purpose: Implements CsvTransform class extending Transform class.
 */

import { Transform, TransformCallback } from "stream";
import { CsvParser, CsvParserOptions } from "./csv-parser";

export type CsvTransformOptions = CsvParserOptions & Partial<{onFlush: () => void}>;

export class CsvTransform extends Transform {
    protected csv: CsvParser;
    protected onFlush: () => void = () => {};
    public _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void {
        callback(null, this.csv.parse(chunk));
    }
    public _flush(callback: TransformCallback): void {
        if (this.csv.accept() && this.onFlush) this.onFlush();
        callback(null,this.csv.parsed);
    }
    private constructor(options?: CsvTransformOptions) {
        super();
        if (options!.onFlush) this.onFlush = options!.onFlush;
        this.csv = CsvParser.create(options);
    }
    public static create(options?: CsvTransformOptions) {
        return new CsvTransform(options);
    }
    public get delimiter(): string {
        return this.csv.delimiter;
    }
    public get quote(): string {
        return this.csv.quote;
    }
    public get lineno(): number {
        return this.csv.lineno;
    }
    public get pos(): number {
        return this.csv.pos;
    }
    public get saved_pos(): number {
        return this.csv.saved_pos;
    }
    public get saved_index(): number {
        return this.csv.saved_index;
    }
    public get field(): string {
        return this.csv.field;
    }
    public get record(): string[] {
        return this.csv.record;
    }
    public get state(): number {
        return this.csv.state;
    }
    public get saved_state(): number {
        return this.csv.saved_state;
    }
    public get final(): boolean {
        return this.csv.final;
    }
    public get parsed(): Buffer {
        return this.csv.parsed;
    }
}
