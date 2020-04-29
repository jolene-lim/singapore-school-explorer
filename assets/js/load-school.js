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

    let value = document
        .getElementById("searchInput")
        .value

    value = transform(value)
    console.log(value)

    loadSchool();
    plotSchool(value);
});

function transform(school_name) {
    d3.json("data/data/translationDictionary.json", function (d) {
        console.log(d[school_name])
        console.log(d[school_name]["code"])
        console.log(d[school_name]["code"][0])
        return d[school_name]["code"][0]
    })
}
