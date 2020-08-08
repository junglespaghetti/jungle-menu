
//initialData

async function initmenu() {

  var menu_list = [{

    id: "settings",

    list: [{ id: "menus", parentId: "settings" }, { id: "editor", parentId: "settings" }, { id: "languages", parentId: "settings" }]

  }];

  await chrome.storage.local.set(getSettingsJson());

  await chrome.storage.local.set(getMenuJson());

  await chrome.storage.local.set(getEditorJson());

  await chrome.storage.local.set(getLanguageJson());

  await chrome.storage.local.set({ menu_list: menu_list });

  return menu_list

}

function getSettingsJson() {

  return {
    settings: {

      menu: {

        id: "settings",

        title: "設定",

        visible: false

      },

      popup: {

        icon: "settings",

        popupVisible: true

      },

      window: {

        url: "applications/settings.html",

        type: 'popup',

        width: 250,

        height: 530

      },
      
      content:{
        
        jsonEdit:{}
        
      }

    }

  }

}

function getMenuJson() {

  return {

    menus: {

      menu: {

        id: "menus",

        title: "Menus",

        parentId: "settings",

        visible: false

      },

      popup: {

        icon: "list_alt",

        popupVisible: true

      },

      window: {

        url: "applications/menus.html",

        type: 'popup',

        width: 250,

        height: 530

      }

    }

  }

}

function getEditorJson() {

  return {

    editor: {

      menu: {

        id: "editor",

        title: "Editor",

        parentId: "settings",

        visible: false

      },

      popup: {

        icon: "code",

        popupVisible: true

      },

      window: {

        url: "applications/editor.html",

        type: 'popup',

        width: 400,

        height: 300

      }

    }

  }

}

function getLanguageJson() {

  return {

    languages: {

      menu: {

        id: "languages",

        title: "language",

        parentId: "settings",

        visible: false

      },

      popup: {

        icon: "language",

        popupVisible: true

      },

      window: {

        url: "applications/languages.html",

        type: 'popup',

        width: 400,

        height: 300

      },
      
      content:{
        
        jsonEdit:{}
        
      }

    }

  }

}
