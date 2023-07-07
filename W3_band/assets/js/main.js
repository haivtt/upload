const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
// Begin: Modal
const buyBtns = document.querySelectorAll('.js-buy-btn');
const modal = document.querySelector('.js-modal');
const modalContainer = document.querySelector('.js-modal-container');
const modalClose = document.querySelector('.js-modal-close');

// Hàm hiển thị modal mua vé (thêm class open vào modal)
function showBuyTickets() {
    modal.classList.add('open');
}

// Hàm ẩn modal mua vé (gỡ bỏ class open của modal)
function hideBuyTickets() {
    modal.classList.remove('open');
}

// Lặp qua từng thẻ button và lắng nghe hành vi click
for (const buyBtn of buyBtns) {
    buyBtn.addEventListener('click', showBuyTickets)
}

// Nghe hành vi click vào button close
modalClose.addEventListener('click', hideBuyTickets)

modal.addEventListener('click', hideBuyTickets)

modalContainer.addEventListener('click', function (e) {
    e.stopPropagation();
})
// End: Modal

// Begin: Mobile menu
const header = $('.js-header');
const mobileMenu = $('.js-mobile-menu');
var headerHeight = header.clientHeight;

function openMenu() {
    header.style.height = 'auto';
}

function closeMenu() {
    header.style.height = null;
}
// Lắng nghe click thực thi đóng mở mobile menu
mobileMenu.addEventListener('click', function() {
    var isClose = header.clientHeight === headerHeight;
    if(isClose) {
        openMenu()
    } else {
        closeMenu()
    }
})

const menuItems = $$('#nav li a[href*="#"]');
for(var menuItem of menuItems) {
    menuItem.onclick = function(event) {
        // Kiểm tra có anh chị em và đồng thời có class là subnav
        if((this.nextElementSibling && this.nextElementSibling.classList.contains('subnav'))) {
            // Ngăn hành vi mặc định của thẻ a
            event.preventDefault(); 
        } else {
            closeMenu();
        }
    }
}
// End: Mobile menu


