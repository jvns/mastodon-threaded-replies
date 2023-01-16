# mastodon threaded replies

Shows you replies to a Mastodon post of yours in a threaded reply style, kind of like a Reddit comment thread.

The website is here: https://mastodon-thread-view.jvns.ca

### no server

This is a static site: there's no server, all your data is stored only in your
browser, as soon as you clear your cache it's all gone.

I've tested it with my personal mastodon server, it may or may not work with other Mastodon instances.

### this code is unmaintained

I made this site just for me to use, it's fulfilled its purpose for me, and
I'm not planning to take feature requests or fix bugs. I would genuinely love
to hear about problems (and I might even fix them! who knows!) but I want to be
clear that there's a high probability that I will not respond :)

It's MIT licensed so you can use it however you want.

### how to develop it

To develop this locally, run:

```
python3 -m http.server 8081
```

Then open http://localhost:8081 in your browser.

### contains a tiny Mastodon library

This contains a tiny Mastodon library called `mastodon.js` for logging in with
OAuth and making requests. You can see some examples of how to use it in `script.js`.

I also probably won't be fixing bugs or taking feature requests for that library.
