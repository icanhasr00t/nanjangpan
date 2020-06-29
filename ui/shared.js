$(document).ready(function () {
    $("#bCancel").click(function (e) {
        e.preventDefault();
        window.history.back();
    });
});

const ENDPOINT = "https://wtf.codentalks.com/nanjangpan/"

const nl2br = (str, is_xhtml) => {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
};

const htmlToElem = (html) => {
    const template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
};

const check4Id = (id) => {
    if (!id || isNaN(id)) {
        window.history.back();
        return;
    }
};

const triggerError = (target = "#errNote") => {
    $(target).fadeTo(1000, 500).slideUp(100, function () {
        $(target).slideUp(100);
    });
};

const setupEditor = () => {
    $("#summernote").summernote({
        placeholder: "내용",
        codeviewFilter: false,
        codeviewIframeFilter: true,
        tabsize: 2,
        height: 400,
        callbacks: {
            onImageUpload: function (files) {
                for (let i = 0; i < files.length; i++) {
                    upload(files[i]);
                }
            },
            onEnter: function(e) {
                $(this).summernote("pasteHTML", "<br><br>");
                e.preventDefault();
            },
        },
    });
};

const upload = (file) => {
    let out = new FormData();
    out.append("file", file, file.name);
    $.ajax({
        method: "POST",
        url: `${ENDPOINT}upload`,
        contentType: false,
        cache: false,
        processData: false,
        data: out,
        success: function (img) {
            $("#summernote").summernote("insertImage", img);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error(textStatus + " " + errorThrown);
            triggerError();
        },
    });
};
