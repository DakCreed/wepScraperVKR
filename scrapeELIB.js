import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

import {flattenObjectArrays, parsePage} from './parseCheerio.js';
import readline from 'readline';

const baseURL=`https://elibrary.ru/`;
const inputsParams={
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
    IDMosevaAl: '1230650'

};

const optionValue = {
    SPIN: 'SPIN',
    ORCID: 'ORCID',
    RSCI: 'RSCI'
}

puppeteer.use(StealthPlugin());

let finalResultArticles= {
    nameAuthor: "Гусев Аркадий Эдуардович",
    articlesList: [],
    get foundArticles() {
        return `Найденно публикаций : ${this.articlesList.length}`;
    }};

//получаем ссылку на страницу со статьями
let getLinkToPerson = async function c(inputdata) {
    const browser = await puppeteer.launch({ headless: false, userDataDir: './tmp' });
    const page = await browser.newPage();
    await page.goto('https://elibrary.ru/authors.asp', { waitUntil: 'networkidle0' }); // Замените на нужный URL

    // Нажать "Очистить"
    const clearSelector = '#show_param > table:nth-child(6) > tbody > tr:nth-child(2) > td:nth-child(5) > div';
    await page.click(clearSelector);

    //Выбираем поиск по библиотеке e-lib
    const setElibrarySelect = '#show_param > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(3) > div > select';
    await page.select(setElibrarySelect, '2');

    const regexSPIN=/^\d{4}-\d{4}$/;
    const regexID=/^\d{1,9}$/;
    if(regexSPIN.test(inputdata)){
        console.log('Вы ввели SPIN код автора');
        //меняем тип параметра для поиска
        const selectSelector = '#codetype';//находим тип параметра для поиска на странице
        await page.select(selectSelector, optionValue.SPIN);//выбираем параметр для поиска

        // Ввести цифры параметра для поиска
        const inputSelector = 'input#codevalue'; // Замените на нужный селектор
        await page.type(inputSelector, inputdata);

    }else if(regexID.test(inputdata)){
        console.log('Вы ввели id автора')
        //меняем тип параметра для поиска
        const selectSelector = '#codetype';//находим тип параметра для поиска на странице
        await page.select(selectSelector, optionValue.RSCI);//выбираем параметр для поиска

        // Ввести цифры параметра для поиска
        const inputSelector = 'input#codevalue'; // Замените на нужный селектор
        await page.type(inputSelector, inputdata);
    }

    else {
        console.log('Скорей всего вы ввели имя')
        // Ввести фамилию
        const inputSelector = 'input#surname'; // Замените на нужный селектор
        await page.type(inputSelector, 'Мосева М. С.');
    }

    //Нажимаем кнопку "Искать"
    const enterSelector = '#show_param > table:nth-child(6) > tbody > tr:nth-child(2) > td:nth-child(6) > div';
    await page.waitForSelector(enterSelector);
    await page.click(enterSelector);

    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // Находим ссылку на все публикации автора
    const hrefValue = await page.$eval('#restab > tbody > tr:nth-child(4) > td:nth-child(4) > div > a:nth-child(1)',
        (link, baseURL) => {
            return `${baseURL}${link.getAttribute('href')}`; // Получаем значение атрибута href
        },
        baseURL // Передайте baseURL в качестве аргумента функции
    );

    await page.goto(hrefValue, { waitUntil: 'networkidle0' });
    const hrefJSON = JSON.stringify({ href: hrefValue });


    // console.log(hrefValue);
    await browser.close()
    console.log('Мы отдали ссылку на автора elib', hrefJSON)
    return hrefJSON;
}

export { getLinkToPerson, optionValue, inputsParams };


