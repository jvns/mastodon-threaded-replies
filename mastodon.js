class Mastodon {
    constructor(options) {
        /* options are: app_name, app_url, scopes */
        this.options = options;
    }

    static async initialize(options) {
        const mastodon = new Mastodon(options);
        mastodon.redirectUri = window.location.origin + window.location.pathname;
        mastodon.restore();
        await mastodon.get_access_code();
        return mastodon;
    }

    restore() {
        if (localStorage.getItem(this.options.app_name)) {
            const data = JSON.parse(localStorage.getItem(this.options.app_name));
            this.clientId = data.clientId;
            this.clientSecret = data.clientSecret;
            this.instanceURL = data.instanceURL;
            this.accessToken = data.accessToken;
        }
        console.log("instance url", this.instanceURL);
    }


    save() {
        localStorage.setItem(this.options.app_name, JSON.stringify({
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            instanceURL: this.instanceURL,
            accessToken: this.accessToken,
        }));
    }

    logout() {
        localStorage.removeItem(this.options.app_name);
        this.clientId = undefined;
        this.clientSecret = undefined;
        this.instanceURL = undefined;
        this.accessToken = undefined;
    }

    async login(instanceURL) {
        if (this.accessToken) {
            return;
        }
        this.instanceURL = instanceURL;
        await this.register_application();
        window.location = this.generate_auth_link();
    }

    loggedIn() {
        return this.accessToken !== undefined;
    }

    async get_access_code() {
        if (window.location.search.length > 0) {
            const params = new URLSearchParams(window.location.search);
            if (params.has('code')) {
                const accessCode = params.get('code');
                await this.get_access_token(accessCode);
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }

    async register_application() {
        console.log('logging in');
        if (this.accessToken) {
            console.log('already logged in');
            return;
        }
        const url = `${this.instanceURL}/api/v1/apps`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_name: this.options.app_name,
                redirect_uris: this.redirectUri,
                scopes: this.options.scopes,
                website: this.options.app_url,
            }),
        });
        const data = await response.json();
        this.clientId = data.client_id;
        this.clientSecret = data.client_secret;
        this.save()
        return data;
    }

    async get_access_token(accessCode) {
        const response = await fetch(`${this.instanceURL}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                code: accessCode,
                redirect_uri: this.redirectUri,
                grant_type: 'authorization_code',
                scope: this.options.scopes,
            }
        )});
        const data = await response.json();
        this.accessToken = data.access_token;
        this.save();
    }

    generate_auth_link() {
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            response_type: 'code',
            scope: this.options.scopes,
        });
        return `${this.instanceURL}/oauth/authorize?${params}`;
    }

    normalize(path) {
        if (path.startsWith('/')) {
            return `${this.instanceURL}${path}`;
        }
        return path;
    }

    async post(path, data) {
        const response = await fetch(this.normalize(path), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`,
            },
            body: JSON.stringify(data),
        });
        return response;
    }


    async get(path) {
        const response = await fetch(this.normalize(path), {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
            },
        });
        return response;
    }
}
