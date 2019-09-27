const pageName = location.href.replace(/^(.*)\/([^/]*).html$/i, "$2");
const menu = document.querySelector('.sidebar ul');
const current = menu.querySelector('a[href="' + pageName + '.html"]');

const list = document.querySelectorAll('.sidebar li');
const cache = {};
let openUl, openHolder;
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
    //cache.values
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