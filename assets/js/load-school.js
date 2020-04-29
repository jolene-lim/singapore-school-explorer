let input = document.getElementById("searchInput");
let button = document.getElementById("searchBtn");

function loadSchool() {
    let schoolPage = document.getElementById("school");
    schoolPage.scrollIntoView();
}

// Execute when user clicks find
input.addEventListener("keyup", function (event) {

    // pressed enter
    if (event.keyCode === 13) {

        // Trigger the button element with a click
        button.click();
    }
});

button.addEventListener("click", function () {

    let name = input.value;
    sendCode(name);
});

function sendCode(school_name) {
    d3.json("data/data/translationDictionary.json", function (d) {
        var name = school_name.toUpperCase();
        var code = d[name]["code"][0];
        loadSchool();
        plotSchool(code);

    });
};
