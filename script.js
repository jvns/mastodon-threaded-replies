/* global Vue */ // for eslint
/* global Mastodon */ // for eslint

var app = Vue.createApp({
    el: '#app',
    data() {
        return {
            server: "",
            mastodon: undefined,
            my_toots: undefined,
            replies: {},
            user_id: undefined,
            status_id: undefined,
        }
    },

    async mounted() {
        this.mastodon = await Mastodon.initialize({
            app_name: 'show-threaded-replies',
            app_url: 'https://threaded-replies.jvns.ca',
            // best docs for scopes is here: https://github.com/mastodon/mastodon/pull/7929
            scopes: 'read:statuses read:accounts',
        });
        if (!this.mastodon.loggedIn()) {
            return;
        }
        this.user_id = await this.get_user_id();
        this.my_toots = await this.get_recent_statuses();
        // check hash
        if (window.location.hash.length > 0) {
            this.get_thread();
        }
        // on hash change
        window.addEventListener('hashchange', () => {
            this.get_thread();
        });
    },


    methods: {
        logout() {
            this.mastodon.logout();
            window.location.hash = "";
        },

        pretty_date(date) {
            const delta = (new Date() - new Date(date)) / 1000;
            const days = Math.floor(delta / 86400);
            var seconds = delta % 86400;
            const hours = Math.floor(seconds / 3600);
            seconds = seconds % 3600;
            const minutes = Math.floor(seconds / 60);
            seconds = Math.floor(seconds % 60);
            if (days > 1) {
                return `${days} days ago`;
            } else if (days == 1) {
                return `1 day ago`;
            } else if (hours > 1) {
                return `${hours} hours ago`;
            } else if (hours == 1) {
                return `1 hour ago`;
            } else if (minutes > 1) {
                return `${minutes} minutes ago`;
            } else {
                return `1 minute ago`;
            }
        },

        format_url(toot) {
            return `${this.mastodon.instanceURL}/@${toot.account.acct}/${toot.id}`;
        },

        async get_thread() {
            const status_id = window.location.hash.slice(1);
            this.status_id = status_id || undefined;
            if (!status_id) {
                return;
            }
            const response = await this.mastodon.get(`/api/v1/statuses/${status_id}/context`);
            if (!response.ok) {
                alert("error getting thread");
            }
            const data = await response.json();
            const replies = data.descendants;
            this.calculate_depths(replies);
            this.replies[status_id] = replies;
        },

        calculate_depths(replies) {
            const replies_by_id = {};
            for (const reply of replies) {
                replies_by_id[reply.id] = reply;
            }
            for (const reply of replies) {
                reply.depth = this.get_depth(reply, replies_by_id);
            }
        },

        get_depth(reply, replies_by_id) {
            if (reply.in_reply_to_id === this.status_id) {
                return 0;
            }
            const parent = replies_by_id[reply.in_reply_to_id];
            return this.get_depth(parent, replies_by_id) + 1;
        },

        async get_user_id() {
            const response = await this.mastodon.get('/api/v1/accounts/verify_credentials');
            if (!response.ok) {
                alert('error getting user id');
            }
            const data = await response.json();
            return data.id;
        },

        async get_recent_statuses() {
            // GET /api/v1/accounts/:id/statuses
            const response = await this.mastodon.get(`/api/v1/accounts/${this.user_id}/statuses?limit=40`);
            if (!response.ok) {
                alert('error getting statuses');
            }
            var data = await response.json();
            // filter out boosts
            data =  data.filter(status => status.reblog === null);
            // filter out replies
            data = data.filter(status => status.in_reply_to_id === null);
            return data;
        },

        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        random_placeholder() {
            const servers = [ "kolektiva.social", "social.coop", "fediscience.org", "mstdn.party", "toot.community", "types.pl", "macaw.social", "social.tchncs.de", "c.im", "recurse.social", "noc.social", "masto.ai", "toot.cat", "mstdn.ca", "phpc.social", "treehouse.systems", "mastodon.me.uk", "social.linux.pizza", "vis.social", "toot.cafe",
"mamot.fr", "mastodon.nz", "aus.social", "mastodon.xyz", "indieweb.social", "sfba.social", "data-folks.masto.host", "mastodon.ie", "sigmoid.social", "ioc.exchange", "mathstodon.xyz", "mastodon.world", "octodon.social", "piaille.fr", "mastodon.sdf.org",
"tech.lgbt", "mastodon.lol", "mastodon.gamedev.place", "techhub.social", "mastodon.cloud", "ruby.social", "chaos.social", "mstdn.social", "mas.to",
"mastodon.online", "fosstodon.org", "infosec.exchange", "hachyderm.io", "mastodon.social"]
            return servers[Math.floor(Math.random() * servers.length)];
        },

        login: async function() {
            const server = this.server;
            if (server == "") {
                alert("Please enter a server address");
                return;
            }

            await this.mastodon.login("https://" + server);
        },
    }
})


app.mount('#app')
