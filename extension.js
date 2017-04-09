const St = imports.gi.St;
const Main = imports.ui.main;
const Soup = imports.gi.Soup;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Clutter = imports.gi.Clutter;
const PanelMenu = imports.ui.panelMenu;
const Util = imports.misc.util;
const GObject = imports.gi.GObject;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;

let _httpSession;
const CPUFreqIndicator = new Lang.Class({
Name: 'CPUFreqIndicator',
Extends: PanelMenu.Button,

_init: function () {
this.parent(0.0, "CPU Freq Indicator", false);
this.buttonText = new St.Label({
text: _("Loading..."),
y_align: Clutter.ActorAlign.CENTER
});
this.actor.add_actor(this.buttonText);
this._refresh();
},


_refresh: function () {
this._loadData();
this._removeTimeout();
this._timeout = Mainloop.timeout_add_seconds(2, Lang.bind(this, this._refresh));
return true;
},

_removeTimeout: function () {
			if (this._timeout) {
				Mainloop.source_remove(this._timeout);
				this._timeout = null;
			}
		},

_TimeoutId: null,
	_FirstTimeoutId: null,
	_updateProcess_sourceId: null,
	_updateProcess_stream: null,
	_updateProcess_pid: null,

	_checkUpdates: function() {
		if(this._updateProcess_sourceId) {
			return;
		}
		try {
			let [parseok, argvp] = GLib.shell_parse_argv( '/usr/bin/sh .local/share/gnome-shell/extensions/CPU_Freq@madhavanmalolan.com/cpufreq.sh');
			if (!parseok) { throw 'Parse error' };
			let [res, pid, in_fd, out_fd, err_fd]  = GLib.spawn_async_with_pipes(null, argvp, null, GLib.SpawnFlags.DO_NOT_REAP_CHILD, null);
			this._updateProcess_stream = new Gio.DataInputStream({
base_stream: new Gio.UnixInputStream({fd: out_fd})
});
this._updateProcess_sourceId = GLib.child_watch_add(0, pid, Lang.bind(this, function() {this._checkUpdatesRead()}));
this._updateProcess_pid = pid;
} catch (err) {
	log(err.message.toString());
        this.buttonText.set_text(err.message.toString());
}
},


_checkUpdatesRead: function() {
			   [out, size] = this._updateProcess_stream.read_line_utf8(null);
			   this.buttonText.set_text(out);
			   this._updateProcess_sourceId = null;
		this._updateProcess_stream.close(null);
		this._updateProcess_stream = null;
		GLib.source_remove(this._updateProcess_sourceId);
		this._updateProcess_sourceId = null;
this._updateProcess_pid = null;
			   Util.spawnCommandLine( "kill " + this._updateProcess_pid );
		   },



_loadData: function () {
		   this._checkUpdates();
	   },


});

let cpuItem;

function init() {
}

function enable() {
	cpuItem = new CPUFreqIndicator;
	Main.panel.addToStatusArea('cpu-freq-indicator', cpuItem);
}

function disable() {
	cpuItem.destroy();
}
