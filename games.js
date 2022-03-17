$(document).ready(function(){
    const base_url = "";
    let config = {};
    let site_config = {};
    let game_data = {};
    let keyboard_status = {};
    let keyboard_letters = [];
    let used_letters = [];
    let hidden_word = "";
    let expected_letters = [];
    let matched_letters = [];
    let dictionary = null;
    let stats = {};
    let remaining_failures;
    let remaining_hints;

    $('.page').hide();
    $('#mainPage').show();
 
    let keyboards = {
        "en": [
            "qwertyuiop",
            "  asdfghjkl",
            "    zxcvbnm"
        ],
        "ladino": [
            "  ertyuiop",
            "  asdfghjkl",
            "    z cvbnm"
        ],
        "he": [
            "קראטוןםפ",
            "  שדגכעיחלךף",
            "    זסבהנמצתץ"
        ],
        "hu": [
            "í         öüó",
            "  qwertyuiopőú",
            "    asdfghjkléáű",
            "      zxcvbnm"

        ],
        "fr": [
            "azertyuiop",
            "  qsdfghjklmù",
            "    wxcvbnàâäæçè",
            "      éêëîïôœûü"
        ],
        "de": [
            "qwertzuiopü",
            "  asdfghjklöä",
            "    yxcvbnmß"
        ],
        "eo": [
            "ŝŭertĵuiopĝĥ",
            "  asdfghjkl",
            "    zĉcvbnm"
        ],
    }

    const load_site_stats = function() {
        const url = `${base_url}/data/stats.json`;
        $.getJSON(url, function(data){
            stats = data;
        }).fail(function(){
            console.log(`An error has occurred while loading from ${url}`);
        });    
    };


    const load_site_config = function() {
        const url = `${base_url}/games.json`;
        $.getJSON(url, function(data){
            site_config = data;
            $("title").html(`${site_config["meta"]["prefix"]}Word Games`);
            $("#release_date").html(site_config["meta"]["release_date"]);
            console.log("site_config:", site_config);
            if (Object.keys(config).length === 0) {
                config["language_id"] = "";
                show_config();
            } else {
                load_game()
            }
        }).fail(function(jqxhr, textStatus, error){
            console.log(`An error has occurred while loading from ${url} ${error}`);
        });    
    };

    const load_game = function() {
        const game_id = config["game_id"];
        const language_id = config["language_id"];
        const filename = site_config["games"][language_id]["file"];
        const url = `${base_url}/data/${game_id}/${filename}`;
        dictionary = null;
        $.getJSON(url, function(data){
            game_data = data;
            console.log("game_data:", game_data);
            //$("#output").html("Loaded");
            setup_game();
        }).fail(function(err){
            //$("#output").html('Error');
            console.log(err);
            console.log(`An error has occurred while loading from ${url}`);
        });

        if ('dictionary' in site_config["games"][language_id]) {
            const dictionary_url = site_config["games"][language_id]["dictionary"] + "/target-to-source.json";
            $.getJSON(dictionary_url, function(data){
                dictionary = data;
                console.log("dictionary loaded");
            }).fail(function(){
                console.log(`Failed to load the dictionary from ${dictionary_url}`);
            });
    
        }
    };

    const generate_word = function() {
        let categories = Object.keys(game_data);
        let category_index = Math.floor(Math.random() * categories.length);
        let category = categories[category_index];
        // console.log(category);
        let words = game_data[category];
        let word_index = Math.floor(Math.random() * words.length);
        hidden_word = words[word_index];
        console.log(hidden_word);
        return [category, hidden_word.split("")];
    }

    const setup_game = function() {
        console.log("setup_game");

        const keyboard_id = site_config["games"][config["language_id"]]["keyboard_id"]
        let keyboard = keyboards[keyboard_id];
        let keyboard_letters_str = keyboard.join("");
        keyboard_letters_str = keyboard_letters_str.replace(/\s/g, "");
        keyboard_letters = keyboard_letters_str.split("");
        let direction = "lrt";
        if ("dir" in site_config["games"][config["language_id"]]) {
            direction = site_config["games"][config["language_id"]]["dir"]
        }
        $("#keyboard").attr("dir", direction);
        $("#word").attr("dir", direction);
    };

    const updated_keyboard = function() {
        console.log("update_keyboard");
        const language_id = config["language_id"];
        // console.log("language_id:", language_id);
        const keyboard_id = site_config["games"][language_id]["keyboard_id"];
        let keyboard = keyboards[keyboard_id];

        // ABC keyboard
        let abc_keyboard = [];
        for (let ix = 0; ix < keyboard.length; ix++) {
            let row = keyboard[ix];
            for (let jx = 0; jx < row.length; jx++) {
                if (keyboard[ix][jx] != " ") {
                    abc_keyboard.push(keyboard[ix][jx]);
                }
            }
        }
        abc_keyboard.sort();
        keyboard = [abc_keyboard.join("")];

        let html = "";
        for (let ix = 0; ix < keyboard.length; ix++) {
            html += `<div class="keyboard row">`;
            let row = keyboard[ix];
            for (let jx = 0; jx < row.length; jx++) {
                const char = keyboard[ix][jx]
                // console.log(char, keyboard_status[char]);
                if (keyboard[ix][jx] == " ") {
                    html += '<span>&nbsp</span>';
                } else {
                    let disabled = "";
                    let status = "";
                    if (keyboard_status[char] == "matched") {
                        status = "is-success";
                        disabled = "disabled";
                    }
                    if (keyboard_status[char] == "wrong") {
                        status = "is-danger";
                        disabled = "disabled";
                    }
                    if (keyboard_status[char] == "disabled") {
                        disabled = "disabled";
                    }
                     // console.log(disabled);
                    html += `<button class="button key ${status}" ${disabled}>${char}</button>`;
                }
            }
            html += "</div>\n";
        }
        // console.log(html);
        $("#keyboard").html(html);
        $(".key").click(virtual_keyboard_pressed);
    };

    const virtual_keyboard_pressed = function(event){
        let char = this.innerHTML;
        handle_char(char);
    }

    const real_keyboard_pressed = function(event) {
        // console.log( event.which );
        // console.log( "á".charCodeAt());
        // console.log( "á".codePointAt());
        let char = String.fromCharCode(event.which);
        if (char == "?") {
            show_about();
        } else if (char == "/") {
            show_config();
        } else {
            handle_char(char);
        }
    };

    const handle_char = function(char) {
        console.log(`pressed: '${char}'`);
        char = char.toLowerCase();
        if (! keyboard_letters.includes(char)) {
            console.log(`An invalid key ${char} was pressed`)
        }

        // console.log(char);
        if (used_letters.includes(char)) {
            // console.log(`Character ${char} was already used.`)
            return;
        }
        // console.log(`checking ${char}`);
        if (expected_letters.includes(char) || expected_letters.includes(char.toUpperCase())) {
            let ix = -1
            while (true) {
                const lower = expected_letters.indexOf(char, ix+1);
                const upper = expected_letters.indexOf(char.toUpperCase(), ix+1);
                if (lower == -1 && upper == -1) {
                    break;
                }
                if (lower == -1) {
                    ix = upper;
                } else if (upper == -1) {
                    ix = lower;
                } else {
                    ix = Math.min(upper, lower);
                }
                console.log(ix);
                $(`#button_${ix}`).html(expected_letters[ix]);
                console.log("expected: ", expected_letters[ix]);
                matched_letters[ix] = expected_letters[ix];
                keyboard_status[char] = 'matched';
            }
            if (JSON.stringify(expected_letters)==JSON.stringify(matched_letters)) {
                $("#wikipedia").attr("href", site_config["games"][config["language_id"]]["wikipedia"] + hidden_word);
                $("#wikipedia").show();
                end_game("Matched!");
            }
        } else {
            remaining_failures--;
            $("#fails").html(`Fails (${remaining_failures})`)
            keyboard_status[char] = 'wrong';
            if (remaining_failures == 1) {
                $("#fails").addClass("is-warning");
            }
            if (remaining_failures <= 0) {
                $("#fails").removeClass("is-warning");
                $("#fails").addClass("is-danger");
                end_game("Failed!");
            }
        }
        used_letters.push(char);
        updated_keyboard();
    };

    const end_game = function(message) {
        if (dictionary !== null) {
            console.log("dictionary");
            const dictionary_url = site_config["games"][config["language_id"]]["dictionary"];
            if (hidden_word in dictionary){
                //console.log(dictionary[hidden_word]);
                dictionary[hidden_word].forEach(function(word) {
                    message += " " + word;
                });                       
                message += ` <a href="${dictionary_url}/target/${hidden_word}.html" target="_blank">${hidden_word}</a>`;
            }
        }

        $('#message').html(message);
        disable_the_whole_keyboard();
        $("#next_game").show();
        $("#stop_game").hide();
        $(".show_config").show();
        $("#hint").hide();

    };

    const disable_the_whole_keyboard = function() {
        console.log('disable_the_whole_keyboard');
        keyboard_letters.forEach(function (char){
            // console.log(char);
            if (!(char in keyboard_status)) {
                // console.log("in", char);
                keyboard_status[char] = "disabled"; 
            }
        });
    };

    const hint = function(event) {
        console.log('hint');
        event.stopImmediatePropagation();
        // find the first letter which is not know yet and display it (pretend the user clicked it)
        for (let ix = 0; ix < expected_letters.length; ix++) {
            if (expected_letters[ix] != matched_letters[ix]) {
                handle_char(expected_letters[ix]);
                //console.log(ix, expected_letters[ix])
                break;
            }
        }
        remaining_hints--;
        $("#hint").html(`Hint (${remaining_hints})`)
        if (remaining_hints <= 0) {
            $("#hint").prop("disabled", true);
        }
    };

    const start_game = function() {
        console.log("start_game");

        const chars = Object.keys(keyboard_status);
        for (let ix=0; ix < chars.length; ix++) {
            delete keyboard_status[chars[ix]];
        }
        matched_letters = [];
        used_letters = [];
        remaining_failures = 7;
        remaining_hints = 2;
        $("#hint").html(`Hint (${remaining_hints})`)
        $("#fails").html(`Fails (${remaining_failures})`)
        $("#fails").removeClass("is-warning");
        $("#fails").removeClass("is-danger");

        $("#hint").prop("disabled", false);
        $('.page').hide();
        $("#next_game").hide();
        $(".show_config").hide();
        $("#stop_game").show();
        $("#hint").show();
        $('#message').html("")
        $("#wikipedia").hide();
        $('#gamePage').show();
        $('#hint').click(hint);

        let category;
        [category, expected_letters] = generate_word();
        // console.log(category);
        // console.log(expected_letters);
        $("#category").html(category);

        let html = "";
        for (let ix = 0; ix < expected_letters.length; ix++) {
            //console.log(expected_letters[ix]);
            let display = "";
            if (expected_letters[ix] == " " || expected_letters[ix] == "-") {
                //console.log('save');
                display = expected_letters[ix];
                matched_letters.push(expected_letters[ix]);
                html += `<span class="placeholder">${display}</span>`;
            } else {
                matched_letters.push("");
                html += `<button class="button letter" id="button_${ix}">${display}</button>`;
            }

        }
        $("#word").html(html);

        updated_keyboard();

        //$( "html" ).keypress(real_keyboard_pressed);
    };
 
    const stop_game = function() {
        $('.page').hide();
        $('#mainPage').show();
        $(".show_config").show();
        $(".show_about").show();
        $( "html" ).off("keypress");
    };

    const next_game = function() {
        start_game();
    };

    const enable_escape = function(func){
        $( "html" ).keydown(function (event) {
            // ESC
            if (event.which == 27) {
                func();
            }
        });
    }

    const show_about = function() {
        console.log('show_about');

        $("#about_modal").addClass('is-active');
        const languages = Object.keys(stats);
        let html = `<table class="table">`;
        html += `<thead><tr><th>Language</th><th>Categories</th><th>Words</th></tr></thead>\n`;
        html += "<tbody>\n";
        for (let ix=0; ix < languages.length; ix++) {
            const language_id = languages[ix];
            console.log(language_id);
            const language = site_config["games"][language_id]["name"];
            html += `<tr><td>${language}</td><td>${stats[language_id]["categories"]}</td><td>${stats[language_id]["words"]}</td></tr>\n`
        }
        html += "</tbody>\n";
        html += "</table>";
        $("#stats").html(html);
        console.log(html);
        enable_escape(close_about);
    };

    const close_about = function() {
        console.log("close");
        $("#about_modal").removeClass('is-active');
    };

    const show_config = function() {
        $('.page').hide();

        let language_options = "";
        let languages = Object.keys(site_config["games"]);
        if (config["language_id"] == "") {
            language_options += `<option selected></a>`;
            $("#welcome-text").show();
            $("#save_config").prop("disabled", true);
            $("#cancel_config").prop("disabled", true);
        } else {
            $("#save_config").prop("disabled", false);
            $("#cancel_config").prop("disabled", false);
        }
        for (let ix=0; ix < languages.length; ix++) {
            let language_id = languages[ix];
            language_options += `<option value="${language_id}" `;
            language_options += (language_id == config["language_id"] ? "selected" : "");
            language_options += `>${site_config["games"][language_id]["name"]} - ${site_config["games"][language_id]["xname"]}</option>`;
        }
        // console.log(language_options);
        $("#language_selector").html(language_options);
        if (config["language_id"] == "") {
            $("#language_selector").change(function() {
                if ($("#language_selector").val() != "") {
                    $("#save_config").prop("disabled", false);
                } else {
                    $("#save_config").prop("disabled", true);
                }
            });
        }
        $('#configPage').show();
    };

    const cancel_config = function() {
        $('.page').hide();
        $('#mainPage').show(); 
    }

    const save_config = function() {
        const language_id = $("#language_selector option:selected").val();
        config["language_id"] = language_id;
        config["game_id"] = "categories";
        load_game()
        save_local_config();
        $('.page').hide();
        $('#mainPage').show(); 
    };

    const load_local_config = function() {
        let config_str = localStorage.getItem('word_games');
        if (config_str !== null) {
            config = JSON.parse(config_str);
            first_load = false;
        }
        console.log("local_config", config);
    };

    const save_local_config = function() {
        localStorage.setItem("word_games", JSON.stringify(config));
    };

    load_local_config();
    load_site_config();
    load_site_stats();
    $("#start_game").click(start_game);
    $("#stop_game").click(stop_game);
    $("#next_game").click(next_game);
    $(".show_config").click(show_config);
    $(".show_about").click(show_about);
    $("#close_about_modal").click(close_about);
    $("#save_config").click(save_config);
    $("#cancel_config").click(cancel_config);
    $( "html" ).keypress(real_keyboard_pressed);
});
