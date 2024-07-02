import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import {flattenObjectArrays, parsePage} from './parseCheerio.js';
import {getLinkToPerson, optionValue, inputsParams}  from './scrapeELIB.js';
import {generateUniqueKey} from './generateuniq.js';



puppeteer.use(StealthPlugin());



function returnPageAuthorElib(url) {
    try {
        const urlObj = new URL(url);
        const authorId = urlObj.searchParams.get('authorid');
        if (!authorId) {
            throw new Error('Parameter "authorid" not found in URL');
        }

        // Формируем новый URL с baseURL и параметром authorid
        const simplifiedUrl = `${urlObj.origin}${urlObj.pathname}?authorid=${authorId}`;
        return simplifiedUrl;
    } catch (error) {
        console.error('Invalid URL:', error.message);
        return null; // или можно вернуть сам url без изменений в случае ошибки
    }
}



// let scrapeAuthorArticles = async function z(inputURL, ftrres) {
//
//     let finalResultArticles = {
//
//         uniqkey: generateUniqueKey(),
//
//         dateStamp: new Date().toLocaleString('ru-RU', {
//             year: 'numeric',
//             month: '2-digit',
//             day: '2-digit',
//             hour: '2-digit',
//             minute: '2-digit',
//             second: '2-digit'
//         }),
//         from: "elibrary.ru",
//         messageToUser: "",
//         pageAuthors: returnPageAuthorElib(inputURL),
//         nameAuthor: "Гусев Аркадий Эдуардович",
//         get foundArticles() {
//             return `Найдено публикаций: ${this.articlesList.length}`;
//         },
//         articlesList: []
//     };
//
//
//     const regexSPIN=/^\d{4}-\d{4}$/;
//     const regexID=/^\d{1,9}$/;
//
//     if(regexSPIN.test(ftrres)) {
//         finalResultArticles.messageToUser='Вы ввели SPIN код автора, поиск будет произведен по ресурсу elibrary.ru';
//     }
//     if(regexID.test(ftrres)) {
//         finalResultArticles.messageToUser='Вы ввели id автора, поиск будет произведен по ресурсу elibrary.ru';
//     }
//
//     const browser = await puppeteer.launch({ headless: true, userDataDir: './tmp' });
//     const page = await browser.newPage();
//
//     await page.goto(inputURL, { waitUntil: 'networkidle0' });
//
//     const elementName = await page.$('#thepage > table > tbody > tr > td > table:nth-child(1) > tbody > tr > td:nth-child(2) > form > table > tbody > tr:nth-child(3) > td:nth-child(1) > table > tbody > tr > td > div:nth-child(1) > font > b');
//     finalResultArticles.nameAuthor = await page.evaluate((element) => element.textContent, elementName);
//
//     let countPage = 1;
//
//     while (true) {
//         const element = await page.$('#panel > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > a');
//         const textContent = await page.evaluate((element) => element.textContent, element);
//         // console.log(textContent);
//         if (textContent === "Предыдущая страница" || textContent === "Выделить все публикации на этой странице") {
//             const htmlContent = await page.content();
//             finalResultArticles.articlesList.push(parsePage(htmlContent));
//             finalResultArticles.articlesList = flattenObjectArrays(finalResultArticles.articlesList);
//             const jsonString = JSON.stringify(finalResultArticles);
//             await browser.close();
//             return jsonString;
//         }
//         const htmlContent = await page.content();
//         finalResultArticles.articlesList.push(parsePage(htmlContent));
//         try {
//             await Promise.all([
//                 page.click('#panel > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > a'),
//                 page.waitForNavigation({ waitUntil: 'networkidle0' })
//             ]);
//         } catch (error) {
//             console.error('Произошла ошибка при нажатии на элемент или ожидании навигации:', error);
//             break;
//         }
//         countPage++;
//     }
//     await browser.close();
// };

let scrapeAuthorArticles = async function z(inputURL, ftrres) {
    const finalResultArticles = {
        uniqkey: generateUniqueKey(),
        dateStamp: new Date().toLocaleString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }),
        from: "elibrary.ru",
        messageToUser: "",
        pageAuthors: returnPageAuthorElib(inputURL),
        nameAuthor: "Гусев Аркадий Эдуардович",
        get foundArticles() {
            return `Найдено публикаций: ${this.articlesList.length}`;
        },
        articlesList: []
    };

    const regexSPIN = /^\d{4}-\d{4}$/;
    const regexID = /^\d{1,9}$/;

    if (regexSPIN.test(ftrres)) {
        finalResultArticles.messageToUser = 'Вы ввели SPIN код автора, поиск будет произведен по ресурсу elibrary.ru';
    }
    if (regexID.test(ftrres)) {
        finalResultArticles.messageToUser = 'Вы ввели id автора, поиск будет произведен по ресурсу elibrary.ru';
    }

    let browser;

    try {
        browser = await puppeteer.launch({ headless: true, userDataDir: './tmp' });
        const page = await browser.newPage();
        await page.goto(inputURL, { waitUntil: 'networkidle0' });

        const elementName = await page.$('#thepage > table > tbody > tr > td > table:nth-child(1) > tbody > tr > td:nth-child(2) > form > table > tbody > tr:nth-child(3) > td:nth-child(1) > table > tbody > tr > td > div:nth-child(1) > font > b');
        finalResultArticles.nameAuthor = await page.evaluate((element) => element.textContent, elementName);

        let countPage = 1;

        while (true) {
            const element = await page.$('#panel > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > a');
            const textContent = await page.evaluate((element) => element.textContent, element);
            if (textContent === "Предыдущая страница" || textContent === "Выделить все публикации на этой странице") {
                const htmlContent = await page.content();
                finalResultArticles.articlesList.push(parsePage(htmlContent));
                finalResultArticles.articlesList = flattenObjectArrays(finalResultArticles.articlesList);
                const jsonString = JSON.stringify(finalResultArticles);
                await browser.close();
                return jsonString;
            }
            const htmlContent = await page.content();
            finalResultArticles.articlesList.push(parsePage(htmlContent));
            try {
                await Promise.all([
                    page.click('#panel > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > a'),
                    page.waitForNavigation({ waitUntil: 'networkidle0' })
                ]);
            } catch (error) {
                console.error('Ошибка при нажатии на элемент или ожидании навигации:', error);
                break;
            }
            countPage++;
        }
    } catch (error) {
        console.error('Произошла ошибка:', error);
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error('Произошла ошибка при закрытии браузера:', closeError);
            }
        }
    }
};


let scrapeResourses = async function u(inputURL){
    let a = await getLinkToPerson(inputURL);
    console.log('Посмотрим как выглядит строка для анализа источника:', inputURL)
    console.log(a);
    const parsedResult = JSON.parse(a);
    let y = await scrapeAuthorArticles(parsedResult.href, inputURL);

    return y;
}

// async function p(){
//     let a = await getLinkToPerson(inputsParams.SPINKysin);
//     console.log(a);
//     const parsedResult = JSON.parse(a);
//     let y = await scrapeAuthorArticles(parsedResult.href);
//     console.log('here');
// }
// p();

// (async () => {
//     let a = await getLinkToPerson(inputsParams.IDMoseva);
//     console.log(a);
//     const parsedResult = JSON.parse(a);
//     let y = await scrapeAuthorArticles(parsedResult.href);
//     console.log('here');
//
// })();
export {scrapeResourses}
// let p = await scrapeResourses('kjh');
// console.log(p);

// (async (inputURL) => {
//     console.log(inputURL)
//     const browser = await puppeteer.launch({ headless: true, userDataDir: './tmp' });
//     const page = await browser.newPage();
//
//     // await page.goto('https://elibrary.ru/author_items.asp?authorid=1230650&show_refs=1&show_option=1', { waitUntil: 'networkidle0' });
//     // await page.goto('https://www.elibrary.ru/author_items.asp?authorid=837252&show_refs=1&show_option=1', { waitUntil: 'networkidle0' });
//     await page.goto(inputURL, { waitUntil: 'networkidle0' });
//     const elementName= await page.$('#thepage > table > tbody > tr > td > table:nth-child(1) > tbody > tr > td:nth-child(2) > form > table > tbody > tr:nth-child(3) > td:nth-child(1) > table > tbody > tr > td > div:nth-child(1) > font > b');
//     finalResultArticles.nameAuthor=await page.evaluate((element) => element.textContent, elementName);
//     let countPage = 1;
//     while (true) {
//         // Получение содержимого элемента
//         const element = await page.$('#panel > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > a');
//         const textContent = await page.evaluate((element) => element.textContent, element);
//
//         if (textContent==="Предыдущая страница" || textContent==="Выделить все публикации на этой странице") {
//
//             // Получение HTML-кода страницы
//             const htmlContent = await page.content();
//
//             finalResultArticles.articlesList.push(parsePage(htmlContent));
//             finalResultArticles.articlesList=flattenObjectArrays(finalResultArticles.articlesList);
//
//             console.log(finalResultArticles.nameAuthor);
//             // console.log(finalResultArticles.articlesList);
//             console.log(util.inspect(finalResultArticles.articlesList, { showHidden: false, depth: null, colors: true }));
//             console.log(finalResultArticles.foundArticles);
//
//             break;
//         }
//
//
//         // Получение HTML-кода страницы
//         const htmlContent = await page.content();
//
//         finalResultArticles.articlesList.push(parsePage(htmlContent));
//         try {
//             await Promise.all([
//                 page.click('#panel > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > a'),
//
//                 page.waitForNavigation({ waitUntil: 'networkidle0' })
//             ]);
//         } catch (error) {
//             console.error('Произошла ошибка при нажатии на элемент или ожидании навигации:', error);
//             // Дополнительные действия, если необходимо, например, закрыть браузер или выполнить другие действия в ответ на ошибку
//         }
//         countPage++
//     }
//
//     // await browser.close();
// })('https://www.elibrary.ru/author_items.asp?authorid=837252&show_refs=1&show_option=1');
