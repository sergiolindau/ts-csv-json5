/**
 * File: ansiEscape.ts
 * Purpose: Implements ansiEscape function. It converts a string to it's
 * ANSI escaped representation without enclosed quotes. It is used mainly
 * for one string character and for debug purposes (to show \r, \n and
 * \t escapes).
 */

export const ansiEscape = (value: string): string => {
    let data = JSON.stringify(value);
    return data.substring(1, data.length - 1);
}