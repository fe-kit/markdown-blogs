const summaryAll = [];
function getNavigation(tree) {
    const list = [];
    let title = '';
    tree.forEach((item, i) => {
        const { type, tag } = item;
        if (type === 'heading_open') {
            const token = tree[i + 1];
            if (tag === 'h1' && !title) {
                title = token.content;
            }
            list.push({ [tag]: token });
        }
    })
    return {
        title,
        list
    }
}

function render({ title, pageHtml, Summary, filename }) {
    const pageNav = renderPageNav(Summary, filename);
    const mainHtml = renderMain(pageHtml, pageNav);
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>${title}</title>
        <link rel="stylesheet" href="../assets/style.css">
    </head>
    
    <body>
        <div class="app">
        <header class="navbar"></header>
        ${renderSidebar(Summary.summary)}
        ${mainHtml}
        </div>
        <script>
        const pageName = location.href.replace(/^(.*)\\/([^/]*).html$/i, "$2");
            const menu = document.querySelector('.sidebar ul');
            const current = menu.querySelector('a[href="' + pageName + '.html"]');
            const list = document.querySelectorAll('.sidebar li');
            const cache = {};
            list.forEach((item, index) => {
                const ul = item.querySelector('ul');
                if (ul) {
                    const holder = item.firstElementChild;
                    holder.setAttribute('data-holder', index);
                    holder.setAttribute('class', 'holder');
                    ul.setAttribute('data-menu', index);
                    cache[index] = ul;
                }
            })
            if (current) {
                current.setAttribute('class', 'cur');
                displayParent(current);
            }
            menu.addEventListener('click', (e) => {
                const target = e.target;
                const holder = target.getAttribute('data-holder');
                if (holder) {
                    const block = cache[holder].style.display === 'block';
                    cache[holder].style.display = block ? 'none' : 'block';
                    target.setAttribute('class', block ? 'holder' : 'holder active');
                }
            });

            function displayParent(ele) {
                const ul = ele.parentElement.parentElement;
                if (ul && ul.getAttribute('data-menu')) {
                    ul.style.display = 'block';
                    ul.previousElementSibling.setAttribute('class', 'holder active');
                    displayParent(ul);
                }
            }
        </script>
    </body>
    </html>`;
}

function renderHomePage() {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>首页</title>
        <link rel="stylesheet" href="./assets/style.css">
    </head>
    
    <body>
        <div class="app">
        <header class="navbar"></header>
        <div class="sitemap">${summaryAll.join('')}</div>
        </div>
    </body>
    </html>`;
}

function renderSidebar(str) {
    return `<aside class="sidebar">
    ${str}
    </aside>`
}

function renderMain(...arg) {
    const str = arg.reduce((x, y) => x + y);
    return `<main class="page"><div class="page-bd">
        ${str}
        </div>
    </main>`
}

function renderPageNav(Summary = {}, filename) {
    const { router = [], routerMap = {} } = Summary;
    const length = router.length;
    const index = router.indexOf(`${filename}.html`);
    const navArr = ['<div class="page-nav">'];
    if (index > 0) {
        const pre = `${router[index - 1]}`;
        navArr.push(`<a class="pre" href="${pre}">←${routerMap[pre]}</a>`);
    }
    if (index < length - 1) {
        const next = `${router[index + 1]}`;
        navArr.push(`<a class="next" href="${next}">${routerMap[next]}→</a>`);
    }
    navArr.push('</div>')
    return navArr.join('');
}

function parseSummary(dir = '', list = []) {
    // console.info(list)
    const arr = [];
    const router = [];
    const routerMap = {};
    list.forEach(item => {
        const { tag, nesting, level, children, content } = item;
        if (tag === 'ul' && nesting === 1) {
            arr.push(`<ul class="ul-${level}">`);
        }
        if (tag === 'li' && nesting === 1) {
            arr.push(`<li class="li-${level}">`);
        }
        if (nesting === 0) {
            if (children.length === 1) {
                arr.push(`<p class="a-${level - 1}">${content}</p>`)
            } else {
                console.info(content);

                content.replace(/\[(.*)\]\((.*)\)/, ($1, $2, $3) => {
                    const href = $3.toLocaleLowerCase();
                    router.push(href);
                    routerMap[href] = $2;
                    dir && summaryAll.push(`<a href="${dir}/${href}" class="a-${level - 1}">${$2}</a>`);
                    arr.push(`<a href="${href}" class="a-${level - 1}">${$2}</a>`);
                })
            }

        }
        if (tag === 'li' && nesting === -1) {
            arr.push(`</li>`);
        }
        if (tag === 'ul' && nesting === -1) {
            arr.push(`</ul>`);
        }
    });
    summary = arr.join('');
    return {
        summary,
        router,
        routerMap
    }
}

module.exports = {
    getNavigation,
    render,
    parseSummary,
    renderHomePage
}