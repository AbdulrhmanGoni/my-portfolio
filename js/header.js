const navMenuIcon = document.querySelector("#nav-menu-icon")
const navBar = document.querySelector("#navbar")
navMenuIcon.addEventListener("click", () => {
    const opened = navMenuIcon.classList.toggle("open")
    if (opened) navBar.classList.add("mobile-navbar")
    else navBar.classList.remove("mobile-navbar")
})

const header = document.querySelector('header');

window.onscroll = function () {
    if (this.scrollY >= 100) {
        header.classList.add('active')
    }
    else {
        header.classList.remove('active')
    }
}