const path = require('path');
const fs = require('fs-extra');
const markdown = require('markdown-it');
const hljs = require('highlight.js');
const rd = require('rd');
const { getNavigation, render, parseSummary, renderHomePage } = require('./parse');
const md = new markdown({
    html: true,
    breaks: true,
    prefix: 'code-',
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str).value;
            } catch (__) { }
        }
        return ''; // use external default escaping
    }
})
    .use(require('markdown-it-include'), '_include')
    .use(require('markdown-it-container'), 'spoiler', {
        validate: function (params) {
            return params.trim().match(/^spoiler\s+(.*)$/);
        },
        render: function (tokens, idx) {
            var m = tokens[idx].info.trim().match(/^spoiler\s+(.*)$/);
            if (tokens[idx].nesting === 1) {
                return '<details><summary>' + m[1] + '</summary>\n';
            } else {
                return '</details>\n';
            }
        }
    });

const Summary = {
    html: '',
    router: [],
    routerMap: {}
}
let cwd = process.cwd();

function mkPublicDir(cwd, dirMap) {
    if (fs.existsSync(path.resolve(cwd, '_posts'))) {
        files = fs.readdirSync(path.resolve(cwd, '_posts'));
        files.forEach(function (file) {
            const postPath = path.resolve(cwd, `_posts/${file}`);
            const publicPath = path.resolve(cwd, `public/${file}`);
            if (fs.statSync(postPath).isDirectory()) {
                fs.ensureDirSync(publicPath);
                dirMap.set(postPath, publicPath);
            }
        });
    }
}

async function getFilesByDir(dirMap) {
    for (const [source, target] of dirMap) {
        const dir = source.split('_posts/')[1]; console.info(dir)
        await getSummary(dir, path.resolve(source, 'SUMMARY.md'));
        rd.readFilter(source, /\.md$/, (err, files) => {
            if (err) {
                console.log('读取文件夹内容失败！');
                return;
            }
            //遍历文件夹列表，对每一个文件执行渲染操作。
            files.forEach(filepath => {
                if (!/summary.md$/i.test(filepath)) {
                    writhHtmlFile(filepath, target);
                    // console.log('%s.html 生成成功！', filename);
                };

            });
        });
    }
    createHomePage();
}

async function getSummary(dir, filepath) {
    let content = '';
    try {
        content = fs.readFileSync(filepath).toString();
        content = parseSummary(dir, md.parse(content, {}));
        Object.assign(Summary, content);
    } catch (error) {
    }
}

function md2html(filepath, filename) {
    const content = fs.readFileSync(filepath);
    const { title } = getNavigation(md.parse(content.toString(), {})) || filename;
    const pageHtml = md.render(`${content.toString()}`);
    return render({ title, pageHtml, Summary, filename });
}

function writhHtmlFile(filepath, target) {
    const filename = getFileNameByPath(filepath);
    const html = md2html(filepath, filename);
    const outpath = path.resolve(target, filename + '.html');
    fs.writeFile(outpath, html, function (err) {
        if (err) {
            console.log('writhHtmlFile: 保存文件内容失败！');
            return;
        }
    });
}

function createHomePage() {
    const outpath = path.resolve(cwd, 'public/index.html');
    const html = renderHomePage();
    fs.writeFile(outpath, html, function (err) {
        if (err) {
            console.log('writhHtmlFile: 保存文件内容失败！');
            return;
        }
    });
}

function getFileNameByPath(filepath) {
    return filepath.toString().replace(/^(.*)\/([^/]*).md$/i, "$2")
        .toLocaleLowerCase();
}

async function build(options) {
    const dirMap = new Map();
    cwd = options.cwd || process.cwd();
    mkPublicDir(cwd, dirMap);
    getFilesByDir(dirMap);
}

module.exports = (...args) => {
    return build(...args).catch((err) => {
        console.warn(err)
    });
};
