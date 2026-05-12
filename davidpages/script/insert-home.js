export function insertHome() {
    // if this isn't the homepage:
    const noHomeLink = document.getElementById("no-home-link");
    if (!noHomeLink) {
        // create home link
        const home = document.createElement("a");
        home.innerText = "Back to Room";
        home.href = "/davidpages/index.html";
        home.classList.add("home-link");
        
        // Place it at the top of the page
        document.body.prepend(home);
    }
}