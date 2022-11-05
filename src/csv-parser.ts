/**
 * File: csv-parser.ts
 * Purpose: Implements CsvParser class.
 * 
 * Reference: https://www.rfc-editor.org/rfc/rfc4180
 */

const debug = false;

// TODO: Remove debug options.
import { ansiEscape } from "./ansiEscape"; // For debug.

/* The transition triple is [symbol,state,action] */
export type TransitionProduction = [number, number, number];

/**
 * The transition table is a table[state][triple] where last triple of
 * table[state] array is the default transition (symbol = 0).
 */
export type TransitionTable = TransitionProduction[][];

/* The set of final accepting states. */
export type FinalStates = number[];

/**
 * Callbacks for error and parsed field and record.
 */
export type ErrorCallback = (err: any) => void;
export type FieldCallback = (field: string, index?: number, line?: number) => void;
export type RecordCallBack = (record: string[], line?: number) => (void | string | Buffer);

/* Symbols for white space, line break and page break. */
const HT = 0x09  /* horizontal tab */
const LF = 0x0a; /* Line feed */
const FF = 0x0c  /* Form feed (page break) */
const CR = 0x0d; /* Carriage Return */
const HS = 0x20; /* Horizotal Space */

/* CsvParser instance configuration. */
export interface CsvParserConfiguration {
    separator: string,
    quote: string,
    encoding: BufferEncoding,
    onError: ErrorCallback,
    onField: FieldCallback,
    onRecord: RecordCallBack
}
export type CsvParserOptions = Partial<CsvParserConfiguration>

/* Parser automata error interface. */
export interface CsvParserErrorInfo {
    input: string,
    line: number,
    pos: number,
    state: number
}

/**
 * CsvParser class
 */
export class CsvParser {
    // TODO: Remove debug options.
    public debug: boolean = debug;
    private _separator!: number;
    private _quote!: number;
    private _encoding!: BufferEncoding;
    private _state!: number;
    private _saved_state!: number;
    private _lineno!: number;
    private _pos!: number;
    private _saved_pos!: number;
    private _saved_index!: number;
    private _field!: string;
    private _record!: string[];
    private _parsed!: string;
    private _transition!: TransitionTable;
    private _final!: FinalStates;

    private onError!: ErrorCallback;
    private onField!: FieldCallback | undefined | null;
    private onRecord!: RecordCallBack;

    /**
     * The constructor is not public because the class provides a static
     * method for instantiation: CsvParser.create()
     * @param options 
     */
    protected constructor(options?: CsvParserOptions) {
        this.reset(options);
    }

    public unparseRecord(record: string[]): string {
        return `${this.quote}${record.map(field => field.replace(this.quote, this.quote + this.quote)).join(this.quote + this.separator + this.quote)}${this.quote}`
    }

    private defaultSeparator = ','.charCodeAt(0);
    private defaultQuote = '"'.charCodeAt(0);

    private defaultOnError: ErrorCallback = (err: CsvParserErrorInfo) => {
        console.log(`[${err.line?.toString().padStart(4, ' ')}]: `, {
            input: err.input,
            pos: err.pos,
            state: err.state
        });
    }

    private defaultOnRecord: RecordCallBack = (record: string[], line?: number): string => {
        let result = `[${line?.toString().padStart(4, ' ')}] : ${this.unparseRecord(record)}`;
        console.log(result);
        return result;
    };

    /**
     * Reset CsvParser instance to start to process first chunk
     * @param options 
     */
    public reset(options?: CsvParserOptions): void {
        this._state = 1;
        this._lineno = 1;
        this._pos = 0;
        this._saved_pos = NaN;
        this._saved_state = NaN;
        this._saved_index = NaN;
        this._field = '';
        this._record = [];
        this._parsed = '';
        if (!options) {
            this._separator = this.defaultSeparator;
            this._quote = this.defaultQuote;
            this._encoding = 'utf-8'
            this.onError = this.defaultOnError;
            this.onField = null;
            this.onRecord = this.defaultOnRecord;
        }
        else {
            if (options.separator) {
                if (options.separator.length != 1) throw new Error('Separator must be a string of one character (default is \',\')');
                this._separator = options.separator.charCodeAt(0);
            }
            else {
                this._separator = this.defaultSeparator;
            }
            if (options.quote) {
                if (options.quote.length > 1) throw new Error('Quote delimiter must be null or a string of one character (default is \'"\')');
                if (options.quote.length) {
                    this._quote = options.quote.charCodeAt(0);
                }
                else {
                    this._quote = 0;
                }

            }
            else {
                this._quote = 0;
            }
            this._encoding = (options.encoding) ? options.encoding : 'utf-8'
            this.onError = (options.onError) ? options.onError : this.defaultOnError;
            this.onField = (options.onField) ? options.onField : null;
            this.onRecord = (options.onRecord) ? options.onRecord : this.defaultOnRecord;
        }
        this._transition = [
            /*  0 */[],
            /*  1 */[
                [this._quote, 3, 1],
                [this._separator, 1, 3],
                [CR, 8, 4],
                [LF, 1, 4],
                [0, 2, 0]
            ],
            /*  2 */[
                [this._separator, 1, 3],
                [CR, 8, 4],
                [LF, 1, 4],
                [this._quote, 9, 7],
                [0, 2, 0]
            ],
            /*  3 */[
                [this._quote, 6, 1],
                [0, 4, 0]
            ],
            /*  4 */[
                [this._quote, 6, 1],
                [0, 4, 0]
            ],
            /*  5 */[
                [this._quote, 6, 1],
                [0, 4, 0]
            ],
            /*  6 */[
                [this._separator, 1, 2],
                [this._quote, 5, 0],
                [CR, 8, 4],
                [LF, 1, 4],
                [0, 10, 7]
            ],
            /*  7 */[
                [LF, 1, 6],
                [0, 1, 5]
            ],
            /*  8 */[
                [CR, 8, 4],
                [LF, 1, 1],
                [0, 1, 2]
            ],
            /*  9 */[
                [CR, 7, 1],
                [LF, 1, 6],
                [0, 9, 1]
            ],
            /* 10 */[
                [CR, 7, 1],
                [LF, 1, 6],
                [0, 10, 1]
            ]
        ];
        this._final = [1, 2, 6, 8];
        if (!this._quote) {
            this._transition[1].shift();
            this._transition[2].splice(3, 1);
            this._final.splice(2, 1);
        }
    }

    /* Static method for instantiation */
    public static create(options?: CsvParserOptions): CsvParser {
        return new CsvParser(options);
    }

    /**
     * Properties getters
     */
    public get separator(): string {
        return String.fromCharCode(this._separator);
    }

    public get quote(): string {
        return (this._quote) ? String.fromCharCode(this._quote) : '';
    }

    public get lineno(): number {
        return this._lineno;
    }

    public get pos(): number {
        return this._pos;
    }

    public get saved_pos(): number {
        return this._saved_pos;
    }

    public get saved_index(): number {
        return this._saved_index;
    }

    public get field(): string {
        return this._field;
    }

    public get record(): string[] {
        return this._record;
    }

    public get state(): number {
        return this._state;
    }

    public get saved_state(): number {
        return this._saved_state;
    }

    /**
     * Returns true if current state is a final state.
     */
    public get final(): boolean {
        return (this._final.indexOf(this._state) > -1)
    }

    public get parsed(): Buffer {
        return this._parsed as unknown as Buffer;
    }

    public static parse(chunk: Buffer | string, options?: CsvParserOptions): CsvParser {
        const result = new CsvParser(options);
        result.parse(chunk);
        return result;
    }

    public parse(chunk: Buffer | string): (void | string | Buffer) {
        if (typeof chunk === 'string') chunk = Buffer.from(chunk, this._encoding)
        this._parsed = '';
        let n = 0;
        const doAction = (action: number, s: number): number => {
            switch (action) {
                case 0: // append character at chunk[n] to field
                    this._field += String.fromCharCode(chunk[n] as number);
                case 1: // null action, only do state transition
                    return s;
                case 2: // Unshift one character to chunk
                    n--;
                    return s;
                case 3: // add field
                case 4: // add last field
                    if (this.onField) this.onField(this._field, this._record.length, this._lineno);
                    this._record.push(this._field);
                    this._field = '';
                    if (action == 3) return s;
                    this._parsed += this.onRecord(this._record, this._lineno) as string;
                    this._record = [];
                    this._lineno++;
                    this._pos = 0;
                    return s;
                case 5: // Emit error then unshift one character to chunk.
                case 6: // Emit error.
                    this.onError({
                        input: chunk.slice(n - this._pos + ((chunk[n - this._pos] == CR || chunk[n - this._pos] == LF) ? 1 : 0), n - 1).toString(),
                        line: this._lineno,
                        pos: this._saved_pos,
                        state: this._saved_state,
                    })
                    this._lineno++;
                    this._pos = 0;
                    this._saved_pos = NaN;
                    this._saved_state = NaN;
                    this._saved_index = NaN;
                    this._record = [];
                    this._field = '';
                    if (action == 6) return (chunk[n] == CR) ? 7 : 1; // Go to state 1 or 7.
                    n--;
                    return 1;
                case 7: // Store error position and state.
                    this._saved_state = s;
                    this._saved_pos = this._pos;
                    this._saved_index = n;
                    return s;
                default: // Unexpected action.
                    return NaN;
            }
        }
        for (; n < chunk.length; n++) {
            if (chunk[n] != LF) this._pos++;
            let st = 0;
            for (; st < this._transition[this._state].length - 1; st++)
                if (chunk[n] == this._transition[this._state][st][0]) break;
            // TODO: Remove debug options.
            if (this.debug) console.log(`s${this._state} :${ansiEscape(String.fromCharCode(chunk[n])).padStart(2, ' ')} > s${this._transition[this._state][st][1]} (${this._transition[this._state][st][2]}) ${this._lineno.toString().padStart(9, ' ')}:${this._pos}`)
            this._state = doAction(this._transition[this._state][st][2], this._transition[this._state][st][1]);
        }
        // TODO: Remove debug options.
        if (this.debug) console.log(`s${this._state} ${this._lineno.toString().padStart(9, ' ')}:`)
        return this._parsed;
    }

    public accept(): boolean {
        if (this._final.indexOf(this._state) > -1) {
            if (this.onField) this.onField(this._field, this._record.length, this._lineno);
            this._record.push(this._field);
            this._field = '';
            this._parsed = this.onRecord(this._record, this._lineno) as string;
            this._record = [];
            this._lineno++;
            this._pos = 0;
            this._saved_pos = NaN;
            this._saved_state = NaN;
            this._saved_index = NaN;
            return true;
        }
        else {
            this._parsed = '';
            return false;
        }
    }

}
