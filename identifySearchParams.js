import { scrapeResourses } from './flipingPage.js';
import { getOrcidAuthorData } from './scrapeORCID.js';

const inputsParams = {
    SPINDotkulova: '3052-6119',
    SPINPolanceva: '8112-8560',
    SPINMoseva: '1313-0436',
    SPINKysin: '5407-1197',
    SPINPotapchenko: '9952-5540',
    SPINTishkin: '8890-3510',
    IDDotkulova: '893597',
    IDPolanceva: '1035887',
    IDMoseva: '946893',
    IDKysin: '873546',
    IDPotapchenko: '837252',
    IDTishkin: '110',
    IDMosevaAl: '1230650',
    ORCIDPolanceva: '0000-0002-7102-4208',
    ORCIDMoseva: '0000-0002-9778-124X'
};

const regexSPIN = /^\d{4}-\d{4}$/;
const regexID = /^\d{1,9}$/;
const orcidRegex = /^(\d{4}-){3}\d{3}[\dX]$/;

async function analyzeString(input) {
    try {
        if (regexSPIN.test(input)) {
            console.log(`Вы предоставили параметр для ресурса elibrary: SPIN код`);
            console.log(input)
            return await scrapeResourses(input);
        } else if (regexID.test(input)) {
            console.log(`Вы предоставили параметр для ресурса elibrary: AuthorID`);
            return await scrapeResourses(input);
        } else if (orcidRegex.test(input)) {
            console.log("Вы предоставили параметр для ресурса ORCID");

            return await getOrcidAuthorData(input);
        } else {
            console.log("Строка не соответствует ни одному из известных шаблонов");
            return null;
        }
    } catch (error) {
        console.error("Произошла ошибка при обработке строки:", error);
        return null;
    }
}

export {analyzeString};
