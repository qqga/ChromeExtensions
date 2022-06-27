// Saves options to chrome.storage

var tbody = document.querySelector("tbody");
var template = document.querySelector('#row-template');

class Commands {
    
    static getSettings() {
        return new Promise((resolve, e) => { chrome.runtime.sendMessage({ cmd: "getSettings" }, res => resolve(res)); })
    }
    static setSettings(settings) {
        return new Promise((resolve, e) => { chrome.runtime.sendMessage({ cmd: "setSettings", args: settings }, res => resolve(res)); })
    }
}


function save_options() {

    var rows = document.querySelectorAll("tbody tr");
    var siteRefs = [];

    for (row of rows) {

        var refObj = {
            id: row.querySelector('#id').value,
            name: row.querySelector('#name').value,
            ref: row.querySelector('#ref').value
        }
        if (refObj.name || refObj.ref) {
            siteRefs.push(refObj);
        }
    }

    Commands.setSettings(siteRefs).then(function () {

        var status = document.getElementById('status');
        status.textContent = 'Options saved.';          
        setTimeout(function () {
            status.textContent = '';
        }, 1750);

    })
}

async function restore_options() {
    var settings = await Commands.getSettings();//.then((siteRefs) => addSitesRow(siteRefs));
    addSitesRow(settings);
}

function addSitesRow(siteRefs) {
    for (siteRef of siteRefs) {
        addSiteRow(siteRef);
    }
}

function addSiteRow(siteRef) {

    var clone = template.content.cloneNode(true);

    var tr = clone.querySelector('tr');
    clone.getElementById("id").value = siteRef.id;
    clone.getElementById("name").value = siteRef.name;
    clone.getElementById("ref").value = siteRef.ref;
    clone.getElementById("remove").onclick = () => tr.remove();

    tbody.appendChild(clone);
}

async function addClick() {

    var settings = await Commands.getSettings();
    var id = settings.length > 0 ? Math.max(...settings.map(_ => _.id)) + 1 : 1;
    addSiteRow({ id: id, name: '', ref: '' });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('add').addEventListener('click', addClick);

document.getElementById('debug-btn').addEventListener('click', debugClick);

async function debugClick() {
    await restore_options();
}

