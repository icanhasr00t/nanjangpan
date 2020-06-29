const vm = new Vue({
    el: '#app',
    data() {
        return {
            nakseo: {}
        };
    },
    mounted() {
        setupEditor();
    },
    methods: {
        writeItem: function () {
            let uri = ENDPOINT;
            this.nakseo.body = $('#summernote').summernote('code').replace(/<br><br>/g,"<br>");
            axios.post(uri, this.nakseo)
                .then((response) => {
                    window.location.href = `/read.html?id=${response.data.id}`;
                })
                .catch((e) => {
                    triggerError();
                });
        },
    }
});
