class MenuManager {

    static addMainMenuItem() {
        chrome.contextMenus.create({
            id: `NavSelect`,
            title: 'Navigate selectionText',
            contexts: ['selection']
        })
    }

    static addContextMenuItem(refObj) {

        chrome.contextMenus.create({
            id: `NavSelect_${refObj.id}`,
            title: refObj.name,
            contexts: ['selection'],
            parentId: 'NavSelect'
        })
    }

    static createMenu() {

        MenuManager.addMainMenuItem();

        chrome.storage.sync.get({
            siteRefs: [],
        }, function (items) {
            for (var siteRef of items.siteRefs)
                MenuManager.addContextMenuItem(siteRef);
        });
    }

    static updateMenu() {
        chrome.contextMenus.removeAll();
        MenuManager.createMenu();
    }

    static contextClick(info, tab) {
        const { menuItemId } = info

        if (menuItemId.startsWith('NavSelect_')) {

            chrome.storage.sync.get({
                siteRefs: [],
            }, function (items) {

                var siteRef = items.siteRefs.find(el => menuItemId == `NavSelect_${el.id}`);

                var newURL = siteRef.ref.replace('${selectionText}', info.selectionText);
                chrome.tabs.create({ url: newURL });
            });
        }
    }
}

class SettingsManager {

    static getSettings() {
        return new Promise((resolve, reject) => {

            chrome.storage.sync.get({
                siteRefs: [],
            }, function (items) {
                resolve(items.siteRefs)
            });
        });
    }

    static setSetttings(siteRefs) {

        return new Promise((resolve, reject) => {

            chrome.storage.sync.set({
                siteRefs: siteRefs,
            }, function () {
                MenuManager.updateMenu();
                resolve();
            });
        });
    }
}

class Commands {
    
    static getSettings() {
        return SettingsManager.getSettings();
    }

    static setSettings(settings) {
        SettingsManager.setSetttings(settings);
    }
}

chrome.runtime.onInstalled.addListener(function () {

    var defaultSettings =
        [{ id: 0, name: 'Cambridge.Dic', ref: 'https://dictionary.cambridge.org/ru/%D1%81%D0%BB%D0%BE%D0%B2%D0%B0%D1%80%D1%8C/%D0%B0%D0%BD%D0%B3%D0%BB%D0%BE-%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9/${selectionText}' }
            , { id: 1, name: 'Ya', ref: 'https://yandex.ru/search/?text=${selectionText}' }];

    SettingsManager
        .setSetttings(defaultSettings)
        .then(() => MenuManager.createMenu());
});

chrome.contextMenus.onClicked.addListener(MenuManager.contextClick)

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        if (request.cmd) {
            //var res = await Commands[request.cmd](request.args);
            Commands[request.cmd](request.args).then(res => sendResponse(res));
            
        }
        return true;
    }
);


