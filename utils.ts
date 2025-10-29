// A simple number to words converter
export function numberToWords(num: number): string {
    const a = [
        '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
    ];
    const b = [
        '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
    ];

    const inWords = (n: number): string => {
        if (n < 20) return a[n];
        const digit = n % 10;
        if (n < 100) return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
        if (n < 1000) return a[Math.floor(n / 100)] + ' hundred' + (n % 100 === 0 ? '' : ' and ' + inWords(n % 100));
        if (n < 100000) return inWords(Math.floor(n / 1000)) + ' thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
        return inWords(Math.floor(n / 100000)) + ' lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
    };

    if (num === 0) return 'Zero';
    const rupees = Math.floor(num);
    const paisa = Math.round((num - rupees) * 100);

    let words = inWords(rupees) + ' Rupees';
    if (paisa > 0) {
        words += ' and ' + inWords(paisa) + ' Paisa';
    }
    words += ' only';
    
    return words.split(' ').filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

export function toTitleCase(str: string): string {
    if (!str) return '';
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}