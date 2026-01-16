
let selectElem = document.querySelector('select');
let logo = document.querySelector('img');

selectElem.addEventListener('change', changeTheme);

function changeTheme() {
    let current = selectElem.value;
    if (current == 'dark') {
        document.querySelector('body').style.backgroundColor = 'black';
        document.querySelector('#content').style.color = 'white';
        document.getElementById('logo').src = 'byui-logo-white.png';
        document.querySelector('#content').style.border = '1px solid white';
        document.querySelector('.container').style.margin = '0 300px';
    } else {
        document.querySelector('body').style.backgroundColor = 'white';
        document.querySelector('#content').style.color = 'black';
        document.getElementById('logo').src = 'byui-logo-blue.webp';
        document.querySelector('#content').style.border = '1px solid black';
        document.querySelector('.container').style.margin = '0 300px';
    }
}           
                    