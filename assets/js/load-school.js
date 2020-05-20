// load school
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
    d3.json("data/translationDictionary.json", function (d) {

        var name = school_name.toUpperCase();

        if (name in d) {

            var code = d[name]["code"][0];

            loadSchool();
            plotSchool(code);

            $("#landingErrorMessage").removeClass("landingErrorBox")

        } else {

            $("#landingErrorMessage").removeClass("landingErrorBox")

            setTimeout(function () {
                $("#landingErrorMessage").addClass("landingErrorBox")
            }, 50)


        }
    });
};

// return to home
let back = document.getElementById("back");

back.addEventListener("click", function() {
    document.getElementById("homepage").scrollIntoView();
})