const vm = new Vue({
  el: "#app",
  data() {
    return {
      items: [],
      selected: {},
      start_at: 999999,
    };
  },
  mounted() {
    this.fetchItems();
    // infinite scroll
    window.onscroll = () => {
      let bottomOfWindow =
        document.documentElement.scrollTop + window.innerHeight ===
        document.documentElement.offsetHeight;

      if (bottomOfWindow) {
        this.start_at = this.items[this.items.length - 1].id;
        this.fetchItems();
      }
    };
  },
  methods: {
    read: function (id) {
      let uri = `/read.html?id=${id}`;
      window.location.href = uri;
    },
    fetchItems: function () {
      let uri = ENDPOINT;
      headers = {
        'Start-At': this.start_at,
      };
      axios
        .get(uri, { headers})
        .then((response) => {
          this.items.push(...response.data);
          // this.items.sort(function (a, b) {
            // if (a.replies === b.replies) {
              // return Date.parse(b.at) - Date.parse(a.at);
            // }
            // return b.replies - a.replies;
          // });
        })
        .catch((e) => {
          triggerError();
        });
    },
    markItem: function (id) {
      this.selected.id = id;
      return;
    },
    tryRm: function () {
      if (!this.selected.id) {
        triggerError();
        return;
      }

      const id = this.selected.id;
      const isSelected = (item) => item.id === id;
      const it = this.items.findIndex(isSelected);

      let uri = `${ENDPOINT}${id}`;
      axios
        .delete(uri, { data: { passwd: this.selected.passwd } })
        .then((res) => {
          this.items.splice(it, 1);
          $("#askPwd").modal("hide");
          this.selected = {};
        })
        .catch((err) => {
          triggerError("#errDelete");
        });
    },
    editItem: function (id) {
      let uri = `/edit.html?id=${id}`;
      window.location.href = uri;
    },
  },
});
