export function formatIndianNumber(num: number | string | undefined): string {
    if (num === undefined || num === null || num === '') return '0';
    const n = Number(num);
    if (isNaN(n)) return String(num);

    const parts = n.toString().split(".");
    let integer = parts[0];
    const lastThree = integer.slice(-3);
    const other = integer.slice(0, -3);

    if (other !== "") {
        integer = other.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
    }

    return parts.length > 1 ? integer + "." + parts[1] : integer;
}

export function numberToIndianWords(num: number | undefined): string {
    if (!num || isNaN(num)) return "Rupees Zero Only";

    const a = [
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
        "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ];
    const b = [
        "", "", "Twenty", "Thirty", "Forty", "Fifty",
        "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    function inWords(n: number): string {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
        if (n < 1000)
            return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + inWords(n % 100) : "");
        if (n < 100000)
            return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
        if (n < 10000000)
            return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
        return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
    }

    return "Rupees " + inWords(Math.floor(num)) + " Only";
}
