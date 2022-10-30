/**
 * 
 * Reference: https://www.rfc-editor.org/rfc/rfc4180
 */


export const parseCsvLine = (
    line: string,
    separator: string = ',',
    quote: string = '"',
    prefix: string = '',
    postfix: string = '',
    escape: 'quote' | 'ansi' = 'quote'
): string[] => {
    const result: string[] = [];

    return result;
}