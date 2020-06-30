const vm = new Vue({
    el: '#app',
    data() {
        return {
            nakseo: {},
            replies: [],
            start_at:  -1,
            // TODO: do something about stopping the IS
        };
    },
    mounted() {
        this.getItem();
    	// infinite scroll
    	window.onscroll = () => {
      		const a = Math.ceil(document.documentElement.scrollTop) + window.innerHeight;
      		const b = getDocHeight();
		
      		const bottomOfWindow = (a == b || (a + 1 == b))
            if (bottomOfWindow) {
                if (this.replies.length > 0) {
                    this.start_at = this.replies[this.replies.length - 1].id;
					console.log(this.start_at);
                    this.getMoreReplies();
                }
            }
        };

    },
    methods: {
        highlight: function (content) {
            const DELIM = "```";
            if (content && content.length > 0) {
                let pos = content.indexOf(DELIM);
                if (pos >= 0) {
                    const tokens = content.split(DELIM);
                    let result = tokens[0];
                    for (let i = 1; i < tokens.length; i++) {
                        if ((i & 1) != 0) {
                            result += "<div class='hljs'><pre><code>\n";
                        } else {
                            result += "\n</code></pre></div>\n";
                        }
                        result += tokens[i];
                    }
                    let dom = htmlToElem(result);
                    $(dom).ready(function () {
                        $('pre code').each(function (i, e) {
                            hljs.highlightBlock(e);
                        });
                    });
                    return result;
                }
            }
            return content;
        },
        getItem: function () {
            let id = new URLSearchParams(window.location.search).get('id');
            check4Id(id);
            let uri = `${ENDPOINT}${id}`;
            axios.get(uri)
                .then((res) => {
                    this.nakseo = res.data;
                    this.replies = res.data.replies;
                    this.nakseo.at = new Date(this.nakseo.at).toLocaleString()
                })
                .catch((err) => {
                    triggerError();
                    window.location.href = "/index.html";
                });
        },
        tryRm: function () {
            let uri = `${ENDPOINT}${this.nakseo.id}`;
            axios.delete(uri, { data: { passwd: this.nakseo.passwd } })
                .then((res) => {
                    $('#askPwd').modal('hide');
                    window.location.href = "/index.html";
                })
                .catch((err) => {
                    triggerError();
                });
        },
        editItem: function (id) {
            window.location.href = `/edit.html?id=${id}`;
        },
        reply: function () {
			const rpl = this.nakseo.reply;
            this.nakseo.reply = "";

			if (!rpl || rpl === "" || rpl.length === 0) {
				return;
			}

            const uri = `${ENDPOINT}${this.nakseo.id}`;
            const data = {
                body: rpl,
            }
            axios.post(uri, data)
                .then((res) => {
                    this.replies.push({ id: res.data.id, body: rpl });
                })
                .catch((err) => {
                    triggerError("#errReply");
                });
        },
        getMoreReplies: function () {
            const uri = `${ENDPOINT}${this.nakseo.id}`;
            headers = {
                'Start-At': (this.start_at == -1) ? '' : this.start_at,
            };
            axios.get(uri, { headers })
                .then((res) => {
                    this.replies.push(...res.data)
                })
                .catch((e) => {
                    triggerError("#errReply");
                });
        },
    }
});
