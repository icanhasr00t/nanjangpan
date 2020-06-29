const vm = new Vue({
  el: "#app",
  data() {
    return {
      nakseo: {},
    };
  },
  mounted() {
    setupEditor();
    this.getItem();
  },
  methods: {
    getItem: function () {
      let id = new URLSearchParams(window.location.search).get("id");
      check4Id(id);
      let uri = `${ENDPOINT}${id}`;
      axios
        .get(uri)
        .then((response) => {
          this.nakseo = response.data;
          $("#summernote").summernote("code", nl2br(this.nakseo.body));
        })
        .catch((e) => {
          triggerError();
        });
    },
    updateItem: function () {
      let uri = `${ENDPOINT}${this.nakseo.id}`;
      this.nakseo.body = $("#summernote")
        .summernote("code")
        .replace(/<br><br>/g, "<br>");
      axios
        .put(uri, this.nakseo)
        .then((response) => {
          window.location.href = "/read.html?id=" + this.nakseo.id;
        })
        .catch((e) => {
          triggerError();
        });
    },
  },
});
