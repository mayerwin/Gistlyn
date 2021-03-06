System.register(['react'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var React;
    var Console;
    return {
        setters:[
            function (React_1) {
                React = React_1;
            }],
        execute: function() {
            Console = (function (_super) {
                __extends(Console, _super);
                function Console() {
                    _super.apply(this, arguments);
                }
                Console.prototype.componentDidUpdate = function () {
                    if (!this.consoleScroll)
                        return;
                    this.consoleScroll.scrollTop = this.consoleScroll.scrollHeight;
                };
                Console.prototype.render = function () {
                    var _this = this;
                    return (React.createElement("div", {id: "console", className: "section", ref: function (el) { return _this.consoleScroll = el; }}, React.createElement("b", {className: "noselect", style: { background: "#444", color: "#fff", padding: "1px 0px 1px 8px", position: "absolute", right: "3px", margin: "-22px 0" }}, "console", React.createElement("i", {className: "material-icons noselect", style: { fontSize: 16, padding: "0 4px 0 4px", verticalAlign: "sub", cursor: "pointer" }, onClick: function (e) { return _this.props.showDialog("console-viewer"); }}, "open_in_new")), React.createElement("i", {className: "material-icons clear-btn", title: "clear console", onClick: function (e) { return _this.props.onClear(); }}, "clear"), React.createElement("div", {className: "scroll"}, React.createElement("table", {style: { width: "100%" }, className: "console"}, React.createElement("tbody", {style: { font: "13px/18px monospace", color: "#444" }}, this.props.logs.map(function (log) { return (React.createElement("tr", null, React.createElement("td", {style: { padding: "2px 8px", tabSize: 4 }}, React.createElement("pre", {className: log.cls}, log.msg)))); }))))));
                };
                return Console;
            }(React.Component));
            exports_1("default", Console);
        }
    }
});
//# sourceMappingURL=Console.js.map