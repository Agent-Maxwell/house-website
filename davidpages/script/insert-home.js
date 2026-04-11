export function insertHome() {
    // if this isn't the homepage:
    const isHome = document.getElementById("home");
    if (!isHome) {
        // create home link
        const home = document.createElement("a");
        home.innerText = "Back to Room";
        home.href = "/davidpages/index.html";
        
        // Place it at the top of the page
        document.body.prepend(home);
    }
}