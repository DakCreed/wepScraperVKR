import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import cheerio from 'cheerio';
import {generateUniqueKey} from './generateuniq.js';

puppeteer.use(StealthPlugin());

const removeComments = (element) => {
    element.contents().each(function() {
        if (this.type === 'comment') {
            cheerio(this).remove();
        }
    });
};

const fetchAuthorData = async (authorId) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const pageAuthors = `https://orcid.org/${authorId}`;
    await page.goto(pageAuthors, { waitUntil: 'networkidle2' });

    const pageContent = await page.content();
    await browser.close();

    const $ = cheerio.load(pageContent);
    const nameElement = $('h1.orc-font-heading');
    removeComments(nameElement);
    const nameAuthor = nameElement.text().trim();

    const doiLinks = $('a[href^="https://doi.org/"]').map((_, element) => $(element).attr('href')).toArray();
    const articleTitles = $('h4.work-title.orc-font-body.ng-star-inserted').map((_, element) => $(element).text().trim()).toArray();

    const articlesList = articleTitles.map((title, index) => ({
        linkToArticle: index < doiLinks.length ? doiLinks[index] : '',
        titleOfArticle: title
    }));

    return {
        uniqkey: generateUniqueKey(),
        dateStamp: new Date().toLocaleString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }),
        messageToUser: 'Вы ввели ORCID ID поиск произведен на портале orcid.org.',
        from: 'https://orcid.org',
        nameAuthor: nameAuthor,
        pageAuthors: pageAuthors,
        foundArticles: `Количество найденных статей ${articlesList.length}`,
        articlesList: articlesList

    };
};

const getOrcidAuthorData = async (orcidId) => {
    if (!orcidId) {
        console.error("ORCID ID не предоставлен");
        return;
    }

    try {
        const authorData = await fetchAuthorData(orcidId);
        const resultJSON = JSON.stringify(authorData, null, 2);
        console.log(resultJSON);
        return resultJSON;
    } catch (error) {
        console.error('Произошла ошибка:', error);
    }
};
export {getOrcidAuthorData};
// Пример использования функции в другом файле:
// import { getOrcidAuthorData } from './path-to-this-file.js';
// getOrcidAuthorData('0000-0002-9778-124X');
// getOrcidAuthorData('0000-0002-7102-4208');
// getOrcidAuthorData('0000-0001-6000-188X');
// getOrcidAuthorData('0000-0002-9762-9395');
