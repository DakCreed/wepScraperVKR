import fs from 'fs';
import * as cheerio from 'cheerio';

export function parseCheerioElement(findArr){

    let finalSetArticlesPage=[];

    const baseUrl=`https://elibrary.ru`;

    let arrayOfHTML=Array.from(findArr);

    for (let shellArticle of arrayOfHTML){
        let dataAboutArt={};
        let $shellArticle=cheerio.load(shellArticle);

        const firstTr = $shellArticle('tr').first(); // Выбираем первый тег tr

        const typeOfArticle = firstTr.attr('id'); // Получаем значение атрибута id

        if (typeOfArticle.startsWith("arw")){
            const $informForScrap = $shellArticle('td[align="left"][valign="top"]');//Обрезаем лишний html-код

            //Название статьи
            let title = $shellArticle($informForScrap[0]).find('span[style="line-height:1.0;"]');//по отобранному вычисляем даные
            dataAboutArt.titleOfArticle=title.html();

            //Сcылка на статью
            let link=$informForScrap.find('a').first().attr('href');
            dataAboutArt.linkToArticle=new URL(link, baseUrl).href;

            //Авторы
            dataAboutArt.authors = $informForScrap.find('font[color="#00008f"]')
                .find('i').first().text();//.split(',').map(author => author.trim());

            finalSetArticlesPage.push(dataAboutArt);

        }else if (typeOfArticle.startsWith("brw")){
            const $informForScrap = $shellArticle('td[align="left"][valign="top"]');//иттерируемый элемент подготваливаем для парсинга

            //Название статьи
            let title = $informForScrap.find('font[color="#00008f"]').first().text();
            dataAboutArt.titleOfArticle=title;

            //Сcылка на статью
            dataAboutArt.linkToArticle="Ссылка на публикацию в ресурсе elibrary.ru не указана!";

            //Авторы
            dataAboutArt.authors=$informForScrap.find('font[color="#00008f"]').eq(1).text().split(',').map(author => author.trim());

            finalSetArticlesPage.push(dataAboutArt);

        }else {
            finalSetArticlesPage.push({error: "Нераспознан id статьи!", typeOfArticle:typeOfArticle });
        }
    }

    return finalSetArticlesPage;
}


export function parsePage(loadedHTML){

    const $ = cheerio.load(loadedHTML);

// Ищем теги <tr>, id которых начинается с "arw" или "brw"
    const rowArtArr = $('tr[id^="arw"][valign="middle"], tr[id^="brw"][valign="middle"]');

// Проверяем, существуют ли такие теги
    if (rowArtArr.length > 0) {
        //Если есть, передаем их в функции, которая вернет объект с данными по статьям
        let returnedArticlesInform=parseCheerioElement(rowArtArr);
        return returnedArticlesInform;

    } else {
        console.error('Теги не найдены.');
    }

}

export function flattenObjectArrays(arrayOfArrays) {
    return arrayOfArrays.flat();
}
