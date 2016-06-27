System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var ReadyState, ServerEventsClient, JsonServiceClient, css, splitOnFirst, queryString, combinePaths;
    return {
        setters:[],
        execute: function() {
            /**
             * EventSource
             */
            (function (ReadyState) {
                ReadyState[ReadyState["CONNECTING"] = 0] = "CONNECTING";
                ReadyState[ReadyState["OPEN"] = 1] = "OPEN";
                ReadyState[ReadyState["CLOSED"] = 2] = "CLOSED";
            })(ReadyState || (ReadyState = {}));
            exports_1("ReadyState", ReadyState);
            ServerEventsClient = (function () {
                function ServerEventsClient(baseUrl, channels, options, eventSource) {
                    if (options === void 0) { options = {}; }
                    if (eventSource === void 0) { eventSource = null; }
                    this.baseUrl = baseUrl;
                    this.channels = channels;
                    this.options = options;
                    this.eventSource = eventSource;
                    this.eventSourceUrl = combinePaths(baseUrl, 'event-stream');
                    if (eventSource == null) {
                        this.eventSource = new EventSource(this.eventSourceUrl);
                        this.eventSource.onmessage = this.onMessage.bind(this);
                    }
                }
                ServerEventsClient.prototype.onMessage = function (e) {
                    var _this = this;
                    var opt = this.options;
                    var parts = splitOnFirst(e.data, ' ');
                    var selector = parts[0];
                    var selParts = splitOnFirst(selector, "@");
                    if (selParts.length > 1) {
                        e.channel = selParts[0];
                        selector = selParts[1];
                    }
                    var json = parts[1];
                    var msg = json ? JSON.parse(json) : null;
                    parts = splitOnFirst(selector, '.');
                    if (parts.length <= 1)
                        throw "invalid selector format: " + selector;
                    var op = parts[0], target = parts[1].replace(new RegExp("%20", 'g'), " ");
                    if (opt.validate && opt.validate(op, target, msg, json) === false)
                        return;
                    var tokens = splitOnFirst(target, "$");
                    var cmd = tokens[0], cssSel = tokens[1];
                    var els = cssSel && document.querySelectorAll(cssSel);
                    var el = els && els[0];
                    var headers = new Headers();
                    headers.set("Content-Type", "text/plain");
                    if (op === "cmd") {
                        if (cmd === "onConnect") {
                            Object.assign(opt, msg);
                            if (opt.heartbeatUrl) {
                                if (opt.heartbeat) {
                                    window.clearInterval(opt.heartbeat);
                                }
                                opt.heartbeat = window.setInterval(function () {
                                    if (_this.eventSource.readyState === 2) {
                                        window.clearInterval(opt.heartbeat);
                                        var stopFn = opt.handlers["onStop"];
                                        if (stopFn != null)
                                            stopFn.apply(_this.eventSource);
                                        _this.reconnectServerEvents({ errorArgs: { error: "CLOSED" } });
                                        return;
                                    }
                                    var req = new Request(opt.heartbeatUrl, {
                                        method: "POST",
                                        mode: "cors",
                                        headers: headers
                                    });
                                    fetch(req)
                                        .then(function (res) {
                                        if (!res.ok)
                                            throw res;
                                    })
                                        .catch(function (res) {
                                        _this.reconnectServerEvents({ errorArgs: [res] });
                                    });
                                }, parseInt(opt.heartbeatIntervalMs) || 10000);
                            }
                            if (opt.unRegisterUrl) {
                                window.onunload = function () {
                                    fetch(new Request(opt.unRegisterUrl, {
                                        method: "POST",
                                        mode: "cors",
                                        headers: headers
                                    }))
                                        .then(function (res) {
                                        if (!res.ok)
                                            throw res;
                                    })
                                        .catch(function (res) { return null; }); //ignore
                                };
                            }
                            this.updateSubscriberUrl = opt.updateSubscriberUrl;
                            this.updateChannels((opt.channels || "").split(","));
                        }
                        var fn = opt.handlers[cmd];
                        if (fn) {
                            fn.call(el || document.body, msg, e);
                        }
                    }
                    else if (op === "trigger") {
                    }
                    else if (op === "css") {
                        css(els || document.querySelectorAll("body"), cmd, msg);
                    }
                    else {
                        var r = opt.receivers && opt.receivers[op];
                        this.invokeReceiver(r, cmd, el, msg, e, op);
                    }
                    if (opt.success) {
                        opt.success(selector, msg, e);
                    }
                };
                ServerEventsClient.prototype.reconnectServerEvents = function (opt) {
                    if (opt === void 0) { opt = {}; }
                    if (this.eventSourceStop)
                        return this.eventSource;
                    var hold = this.eventSource;
                    var es = new EventSource(opt.url || this.eventSourceUrl || hold.url);
                    es.onerror = opt.onerror || hold.onerror;
                    es.onmessage = opt.onmessage || hold.onmessage;
                    var fn = this.options.handlers["onReconnect"];
                    if (fn != null)
                        fn.apply(es, opt.errorArgs);
                    hold.close();
                    return this.eventSource = es;
                };
                ServerEventsClient.prototype.invokeReceiver = function (r, cmd, el, msg, e, name) {
                    if (r) {
                        if (typeof (r[cmd]) == "function") {
                            r[cmd].call(el || r[cmd], msg, e);
                        }
                        else {
                            r[cmd] = msg;
                        }
                    }
                };
                ServerEventsClient.prototype.updateChannels = function (channels) {
                    this.channels = channels;
                    if (!this.eventSource)
                        return;
                    var url = this.eventSource.url;
                    this.eventSourceUrl = url.substring(0, Math.min(url.indexOf("?"), url.length)) + "?channels=" + channels.join(",");
                };
                return ServerEventsClient;
            }());
            exports_1("ServerEventsClient", ServerEventsClient);
            JsonServiceClient = (function () {
                function JsonServiceClient(baseUrl) {
                    this.baseUrl = baseUrl;
                }
                JsonServiceClient.prototype.get = function (request) {
                    console.log(request);
                    return fetch("/").then(function (r) { return null; });
                };
                return JsonServiceClient;
            }());
            exports_1("JsonServiceClient", JsonServiceClient);
            /* utils */
            exports_1("css", css = function (selector, name, value) {
                var els = typeof selector == "string"
                    ? document.querySelectorAll(selector)
                    : selector;
                for (var i = 0; i < els.length; i++) {
                    var el = els[i];
                    if (el != null && el.style != null) {
                        el.style[name] = value;
                    }
                }
            });
            exports_1("splitOnFirst", splitOnFirst = function (s, c) {
                if (!s)
                    return [s];
                var pos = s.indexOf(c);
                return pos >= 0 ? [s.substring(0, pos), s.substring(pos + 1)] : [s];
            });
            exports_1("queryString", queryString = function (url) {
                if (!url || url.indexOf('?') === -1)
                    return {};
                var pairs = splitOnFirst(url, '?')[1].split('&');
                var map = {};
                for (var i = 0; i < pairs.length; ++i) {
                    var p = pairs[i].split('=');
                    map[p[0]] = p.length > 1
                        ? decodeURIComponent(p[1].replace(/\+/g, ' '))
                        : null;
                }
                return map;
            });
            exports_1("combinePaths", combinePaths = function () {
                var paths = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    paths[_i - 0] = arguments[_i];
                }
                var parts = [], i, l;
                for (i = 0, l = paths.length; i < l; i++) {
                    var arg = paths[i];
                    parts = arg.indexOf("://") === -1
                        ? parts.concat(arg.split("/"))
                        : parts.concat(arg.lastIndexOf("/") === arg.length - 1 ? arg.substring(0, arg.length - 1) : arg);
                }
                var combinedPaths = [];
                for (i = 0, l = parts.length; i < l; i++) {
                    var part = parts[i];
                    if (!part || part === ".")
                        continue;
                    if (part === "..")
                        combinedPaths.pop();
                    else
                        combinedPaths.push(part);
                }
                if (parts[0] === "")
                    combinedPaths.unshift("");
                return combinedPaths.join("/") || (combinedPaths.length ? "/" : ".");
            });
        }
    }
});
//# sourceMappingURL=servicestack-client.js.map