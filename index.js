#!/usr/bin/env node

'use strict';

const yargs = require('yargs');
const {
    hideBin
} = require('yargs/helpers');
const {
    JSDOM
} = require('jsdom');
const {
    Readability
} = require('@mozilla/readability');
const {
    NodeHtmlMarkdown
} = require('node-html-markdown');

async function fetchUrlText(url) {
    const response = await fetch(url);
    const text = await response.text();
    return text;
}

function extractArticle({url, text}) {
    const doc = new JSDOM(text, {
        url: url
    });

    const reader = new Readability(doc.window.document);
    const article = reader.parse();
    return article;
}


async function main() {
    const args = yargs(hideBin(process.argv)).scriptName("webread").boolean("json").parse();
    if (args._.length !== 1) {
        console.error('Please provide a single URL as an argument.');
        process.exit(1);
    }

    const inputUrl = args._[0];

    const urlContent = await fetchUrlText(inputUrl);
    const article = extractArticle({url: inputUrl, text: urlContent});
    const content = NodeHtmlMarkdown.translate(article.content);

    var output = '';
    if (args.json) {
        output = JSON.stringify({'title': article.title, 'content': content});
    }
    else {
        output = `# ${article.title}\n\n${content}`;
    }
    console.log(output);

    process.exit(0);
}

main();