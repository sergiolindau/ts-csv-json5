/**
 * File: test-csv-parser.ts
 * Purpose: Implements CsvParser class test.
 */

import { CsvParser } from './csv-parser'

CsvParser.parse([
    '"aaa"', '\r\n',  //  1: OK
    '"ab","1""2"', '\r\n',  //  2: OK
    'a"b,12', '\r',    //  3: Error
    '1ab,"12",xyz', '\r\n',  //  4: OK
    '2ab,"12","xyz', '\n',    //  5: Error
    '3ab,"12,"xyz"', '\r\r',  //  5: Error
    '4ab,12","xyz"', '\r\n',  //  7: Error
    '5ab,"12",xyz"', '\r\n',  //  8: Error
    ',"12",xyz', '\r\n',  //  9: OK
    '"a""aa","bbb","ccc","ddd"', '\r\n',  // 10: OK
    '"aaa","bbb","ccc"', '\r\n',  // 11: OK
    '"xa""a","bbb","ccc"', '\r\n',  // 12: OK
].join());

console.log('test-csv-parser.ts: Done.')