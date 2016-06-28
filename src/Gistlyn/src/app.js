/// <reference path='../typings/browser.d.ts'/>
System.register(['react-dom', 'react', 'redux', 'react-redux', './servicestack-client', 'react-codemirror', "jspm_packages/npm/codemirror@5.16.0/addon/edit/matchbrackets.js", "jspm_packages/npm/codemirror@5.16.0/addon/comment/continuecomment.js", "jspm_packages/npm/codemirror@5.16.0/addon/display/fullscreen.js", "jspm_packages/npm/codemirror@5.16.0/mode/clike/clike.js", "jspm_packages/npm/codemirror@5.16.0/mode/xml/xml.js", "./codemirror.js", './Gistlyn.dtos'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var ReactDOM, React, redux_1, react_redux_1, servicestack_client_1, react_codemirror_1, Gistlyn_dtos_1;
    var options, ScriptStatusRunning, updateGist, store, client, sse, getSortedFileNames, App, qsGist;
    function reduxify(mapStateToProps, mapDispatchToProps, mergeProps, options) {
        return function (target) { return (react_redux_1.connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(target)); };
    }
    return {
        setters:[
            function (ReactDOM_1) {
                ReactDOM = ReactDOM_1;
            },
            function (React_1) {
                React = React_1;
            },
            function (redux_1_1) {
                redux_1 = redux_1_1;
            },
            function (react_redux_1_1) {
                react_redux_1 = react_redux_1_1;
            },
            function (servicestack_client_1_1) {
                servicestack_client_1 = servicestack_client_1_1;
            },
            function (react_codemirror_1_1) {
                react_codemirror_1 = react_codemirror_1_1;
            },
            function (_1) {},
            function (_2) {},
            function (_3) {},
            function (_4) {},
            function (_5) {},
            function (_6) {},
            function (Gistlyn_dtos_1_1) {
                Gistlyn_dtos_1 = Gistlyn_dtos_1_1;
            }],
        execute: function() {
            options = {
                lineNumbers: true,
                matchBrackets: true,
                indentUnit: 4,
                mode: "text/x-csharp",
                extraKeys: {
                    "F11": function (cm) {
                        cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                    },
                    "Esc": function (cm) {
                        if (cm.getOption("fullScreen"))
                            cm.setOption("fullScreen", false);
                    }
                }
            };
            ScriptStatusRunning = ["Started", "PrepareToRun", "Running"];
            updateGist = function (store) { return function (next) { return function (action) {
                var oldGist = store.getState().gist;
                var result = next(action);
                var state = store.getState();
                if (action.type === 'GIST_CHANGE' && action.gist && oldGist !== action.gist) {
                    fetch("https://api.github.com/gists/" + action.gist)
                        .then(function (res) {
                        if (!res.ok) {
                            throw res;
                        }
                        else {
                            return res.json().then(function (r) {
                                store.dispatch({ type: 'GIST_LOAD', files: r.files, activeFileName: getSortedFileNames(r.files)[0] });
                            });
                        }
                    })
                        .catch(function (res) {
                        store.dispatch({ type: 'ERROR_RAISE', error: { code: res.status, message: "Gist with hash '" + action.gist + "' was " + res.statusText } });
                    });
                }
                return result;
            }; }; };
            store = redux_1.createStore(function (state, action) {
                switch (action.type) {
                    case 'SSE_CONNECT':
                        return Object.assign({}, state, { activeSub: action.activeSub });
                    case 'GIST_CHANGE':
                        return Object.assign({}, state, { gist: action.gist, error: null, files: null, activeFileName: null });
                    case 'GIST_LOAD':
                        return Object.assign({}, state, { files: action.files, activeFileName: action.activeFileName, hasLoaded: true });
                    case 'FILE_SELECT':
                        return Object.assign({}, state, { activeFileName: action.activeFileName });
                    case 'ERROR_RAISE':
                        return Object.assign({}, state, { error: action.error });
                    case 'CONSOLE_LOG':
                        return Object.assign({}, state, { logs: state.logs.concat(action.logs) });
                    case 'SCRIPT_STATUS':
                        return Object.assign({}, state, { scriptStatus: action.scriptStatus });
                    case 'SOURCE_CHANGE':
                        var file = Object.assign({}, state.files[action.fileName], { content: action.content });
                        return Object.assign({}, state, { files: Object.assign({}, state.files, (_a = {}, _a[action.fileName] = file, _a)) });
                    default:
                        return state;
                }
                var _a;
            }, {
                gist: null,
                activeSub: null,
                files: null,
                activeFileName: null,
                hasLoaded: false,
                error: null,
                logs: [],
                scriptStatus: null
            }, redux_1.applyMiddleware(updateGist));
            client = new servicestack_client_1.JsonServiceClient("/");
            sse = new servicestack_client_1.ServerEventsClient("/", ["gist"], {
                handlers: {
                    onConnect: function (activeSub) {
                        store.dispatch({ type: 'SSE_CONNECT', activeSub: activeSub });
                    },
                    ConsoleMessage: function (m, e) {
                        //console.log("ConsoleMessage", m, e);
                        store.dispatch({ type: 'CONSOLE_LOG', logs: [m.message] });
                    },
                    ScriptExecutionResult: function (m, e) {
                        //console.log("ScriptExecutionResult", m, e);
                        if (m.status === store.getState().scriptStatus)
                            return;
                        store.dispatch({ type: 'CONSOLE_LOG', logs: [m.status] });
                        store.dispatch({ type: 'SCRIPT_STATUS', scriptStatus: m.status });
                    }
                }
            });
            getSortedFileNames = function (files) {
                var fileNames = Object.keys(files);
                fileNames.sort(function (a, b) {
                    if (a.toLowerCase() === "main.cs")
                        return -1;
                    if (b.toLowerCase() === "main.cs")
                        return 1;
                    if (!a.endsWith(".cs") && b.endsWith(".cs"))
                        return 1;
                    if (a === b)
                        return 0;
                    return a < b ? -1 : 0;
                });
                return fileNames;
            };
            App = (function (_super) {
                __extends(App, _super);
                function App() {
                    var _this = this;
                    _super.apply(this, arguments);
                    this.run = function () {
                        _this.props.clearError();
                        var request = new Gistlyn_dtos_1.RunScript();
                        request.scriptId = _this.scriptId;
                        request.mainSource = _this.getMainFile().content;
                        request.packagesConfig = _this.getFileContents("packages.config");
                        request.sources = [];
                        for (var k in _this.props.files || []) {
                            if (k.endsWith(".cs") && k.toLowerCase() !== "main.cs")
                                request.sources.push(_this.props.files[k].content);
                        }
                        _this.props.setScriptStatus("Started");
                        client.post(request)
                            .then(function (r) {
                            console.log('run success', r);
                            _this.props.logToConsole(r.references.map(function (ref) { return ("loaded " + ref.name); }));
                        })
                            .catch(function (r) {
                            console.log('run error', r);
                            _this.props.raiseError(r.responseStatus);
                            _this.props.setScriptStatus("Failed");
                        });
                    };
                    this.cancel = function () {
                        _this.props.clearError();
                        var request = new Gistlyn_dtos_1.CancelScript();
                        request.scriptId = _this.scriptId;
                        client.post(request)
                            .then(function (r) {
                            console.log('cancel success', r);
                            _this.props.setScriptStatus("Cancelled");
                            _this.props.logToConsole(["Cancelled by user"]);
                        })
                            .catch(function (r) {
                            console.log('cancel error', r);
                            _this.props.raiseError(r.responseStatus);
                            _this.props.setScriptStatus("Failed");
                        });
                    };
                }
                App.prototype.getFile = function (fileName) {
                    if (this.props.files == null)
                        return null;
                    for (var k in this.props.files) {
                        if (k.toLowerCase() === fileName) {
                            return this.props.files[k];
                        }
                    }
                    return null;
                };
                App.prototype.getFileContents = function (fileName) {
                    var file = this.getFile(fileName);
                    return file != null
                        ? file.content
                        : null;
                };
                App.prototype.getMainFile = function () {
                    return this.getFile("main.cs");
                };
                Object.defineProperty(App.prototype, "scriptId", {
                    get: function () {
                        return this.props.activeSub && this.props.activeSub.id;
                    },
                    enumerable: true,
                    configurable: true
                });
                App.prototype.handleGistUpdate = function (e) {
                    var target = e.target;
                    var parts = servicestack_client_1.splitOnLast(target.value, '/');
                    var hash = parts[parts.length - 1];
                    this.props.updateGist(hash);
                };
                App.prototype.updateSource = function (src) {
                    this.props.updateSource(this.props.activeFileName, src);
                };
                App.prototype.componentDidUpdate = function () {
                    if (!this.consoleScroll)
                        return;
                    this.consoleScroll.scrollTop = this.consoleScroll.scrollHeight;
                };
                App.prototype.render = function () {
                    var _this = this;
                    var source = "";
                    var Tabs = [];
                    if (this.props.files) {
                        var keys = getSortedFileNames(this.props.files);
                        keys.forEach(function (k) {
                            var file = _this.props.files[k];
                            var active = k === _this.props.activeFileName ||
                                (_this.props.activeFileName == null && k.toLowerCase() === "main.cs");
                            Tabs.push((React.createElement("div", {className: active ? 'active' : null, onClick: function (e) { return _this.props.selectFileName(file.filename); }}, React.createElement("b", null, file.filename))));
                            if (active) {
                                source = file.content;
                                options["mode"] = file.filename.endsWith('.config')
                                    ? "application/xml"
                                    : "text/x-csharp";
                            }
                        });
                    }
                    var main = this.getMainFile();
                    if (this.props.hasLoaded && this.props.gist && this.props.files && main == null && this.props.error == null) {
                        this.props.error = { message: "main.cs is missing" };
                    }
                    var isScriptRunning = ScriptStatusRunning.indexOf(this.props.scriptStatus) >= 0;
                    var Preview = [(React.createElement("div", {id: "vars", className: "section"}, isScriptRunning
                            ? (React.createElement("div", {style: { margin: '40px', color: "#31708f" }}, React.createElement("i", {className: "material-icons", style: { position: "absolute" }}, "build"), React.createElement("p", {style: { padding: "0 0 0 30px", fontSize: "22px" }}, "Executing Script...")))
                            : null))];
                    if (this.props.error != null) {
                        var code = this.props.error.errorCode ? "(" + this.props.error.errorCode + ") " : "";
                        Preview = [(React.createElement("div", {id: "errors", className: "section"}, React.createElement("div", {style: { margin: "25px 25px 40px 25px", color: "#a94442" }}, code, this.props.error.message), this.props.error.stackTrace != null
                                ? React.createElement("pre", {style: { color: "red", padding: "5px 30px" }}, this.props.error.stackTrace)
                                : null))];
                    }
                    if (this.props.logs.length > 0) {
                        Preview.push((React.createElement("div", {id: "console", className: "section", style: { borderBottom: "solid 1px #ddd" }}, React.createElement("div", {className: "head", style: { font: "14px/20px arial", height: "22px", textAlign: "right", borderBottom: "solid 1px #ddd" }}, React.createElement("b", {style: { background: "#444", color: "#fff", padding: "4px 8px" }}, "console")), React.createElement("div", {className: "scroll", style: { overflow: "auto", maxHeight: "350px" }, ref: function (el) { return _this.consoleScroll = el; }}, React.createElement("table", {style: { width: "100%" }}, React.createElement("tbody", {style: { font: "13px/18px monospace", color: "#444" }}, this.props.logs.map(function (log) { return (React.createElement("tr", null, React.createElement("td", {style: { padding: "2px 8px" }}, log))); })))))));
                    }
                    return (React.createElement("div", {id: "body"}, React.createElement("div", {className: "titlebar"}, React.createElement("div", {className: "container"}, React.createElement("img", {id: "logo", src: "img/logo-32-inverted.png"}), React.createElement("h3", null, "Gistlyn"), " ", React.createElement("sup", {style: { padding: "0 0 0 5px", fontSize: "12px", fontStyle: "italic" }}, "BETA"), React.createElement("div", {id: "gist"}, React.createElement("input", {type: "text", id: "txtGist", placeholder: "gist hash or url", value: this.props.gist, onFocus: function (e) { return e.target.select(); }, onChange: function (e) { return _this.handleGistUpdate(e); }}), main != null
                        ? React.createElement("i", {className: "material-icons", style: { color: "#0f9", fontSize: "30px", position: "absolute", margin: "-2px 0 0 7px" }}, "check")
                        : this.props.error
                            ? React.createElement("i", {className: "material-icons", style: { color: "#ebccd1", fontSize: "30px", position: "absolute", margin: "-2px 0 0 7px" }}, "error")
                            : null))), React.createElement("div", {id: "content"}, React.createElement("div", {id: "ide"}, React.createElement("div", {id: "editor"}, React.createElement("div", {id: "tabs", style: { display: this.props.files ? 'flex' : 'none' }}, Tabs), React.createElement(react_codemirror_1.default, {value: source, options: options, onChange: function (src) { return _this.updateSource(src); }})), React.createElement("div", {id: "preview"}, Preview))), React.createElement("div", {id: "footer"}, React.createElement("div", {id: "run"}, main != null
                        ? (!isScriptRunning
                            ? React.createElement("i", {className: "material-icons", title: "run", onClick: this.run}, "play_arrow")
                            : React.createElement("i", {className: "material-icons", title: "cancel script", onClick: this.cancel, style: { color: "#FF5252" }}, "cancel"))
                        : React.createElement("i", {className: "material-icons disabled", title: "disabled"}, "play_arrow")))));
                };
                App = __decorate([
                    reduxify(function (state) { return ({
                        gist: state.gist,
                        hasLoaded: state.hasLoaded,
                        activeSub: state.activeSub,
                        files: state.files,
                        activeFileName: state.activeFileName,
                        logs: state.logs,
                        error: state.error,
                        scriptStatus: state.scriptStatus
                    }); }, function (dispatch) { return ({
                        updateGist: function (gist) { return dispatch({ type: 'GIST_CHANGE', gist: gist }); },
                        updateSource: function (fileName, content) { return dispatch({ type: 'SOURCE_CHANGE', fileName: fileName, content: content }); },
                        selectFileName: function (activeFileName) { return dispatch({ type: 'FILE_SELECT', activeFileName: activeFileName }); },
                        raiseError: function (error) { return dispatch({ type: 'ERROR_RAISE', error: error }); },
                        clearError: function () { return dispatch({ type: 'ERROR_CLEAR' }); },
                        logToConsole: function (logs) { return dispatch({ type: 'CONSOLE_LOG', logs: logs }); },
                        setScriptStatus: function (scriptStatus) { return dispatch({ type: 'SCRIPT_STATUS', scriptStatus: scriptStatus }); }
                    }); })
                ], App);
                return App;
            }(React.Component));
            qsGist = servicestack_client_1.queryString(location.href)["gist"] || "efc71477cee60916ef71d839084d1afd";
            store.dispatch({ type: 'GIST_CHANGE', gist: qsGist });
            ReactDOM.render(React.createElement(react_redux_1.Provider, {store: store}, React.createElement(App, null)), document.getElementById("app"));
        }
    }
});
//# sourceMappingURL=app.js.map