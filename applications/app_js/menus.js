
// codemirror setting

const editorList = ["menuOption-htmlEdit", "content-scriptEdit", "content-cssEdit", "content-jsonEdit", "windowContent-scriptEdit", "windowContent-cssEdit", "windowContent-jsonEdit", "tabContent-scriptEdit", "tabContent-cssEdit", "tabContent-jsonEdit", "external-jsonEdit"]

window.addEventListener('load', () => {

  chrome.storage.local.get("menu_list", value => {
  
    appendMenuList(value.menu_list, "menu-list")
  
  });

  setListItemButtons()

  toggleVisibleIconButton()

  //setTargetWindow("menus")

  setEditor(editorList, editorSetting)

  setTargetEvent("menuId", {

    change: e => {

      initFormData(e.target.value);

    }

  })

  setTargetEvent("menuId", {

    click: e => {

      clearForm("menu_form")

    }

  })

  setTargetEvent("appry-button", {

    click: e => {

      setLocalStrage(document.menu_form.menuId.value);

    }

  })

  setTargetEvent("delete-button", {

    click: e => {

      deleteLocalStrage(document.menu_form.menuId.value);

      clearForm("menu_form")

    }

  })

  setTargetEvent("import-button", {

    click: e => {

      importLocalStrage(document.menu_form.menuId.value)

    }

  })

  setTargetEvent("export-button", {

    click: e => {

      editorsSave();

      exportLocalStrage(document.menu_form.menuId.value);

    }

  })

});

chrome.storage.onChanged.addListener((changes, ns) => {

  clearChildList("menu-list")

  if (ns == "local" && changes.menu_list && changes.menu_list.newValue && changes.menu_list.newValue !== changes.menu_list.oldValue) {

    appendMenuList(changes.menu_list.newValue, "menu-list")

  }

})

//foem button click action

function setLocalStrage(menu_id) {

  if (menu_id) {

    getFormData("menu-form").then(val => {

      let command = { id: menu_id }

      command.menu_data = val

      createMenuItem(command).then((val) => window.close())

    })

  }

}

function deleteLocalStrage(menu_id) {

  if (menu_id) {

    deleteMenuItem({ id: menu_id }).then(() => {

      window.close()

    })

  }

}

function importLocalStrage(parent_id) {

  importMenuItem({ parentID: parent_id })

}

function exportLocalStrage(menu_id) {

  if (menu_id) {

    getFormData("menu-form").then(val => {

      let elm = document.getElementById("export-child")

      let command = {

        id: menu_id,

        file_name: menu_id + "_data",

        export_child: elm.checked,

        menu_data: val

      }

      //command.menu_data[menu_id] = val

      exportMenuItem(command).then(value => {

        window.close()

      })

    })

  }

}

//


function selectItemList() {

  chrome.storage.local.get("menu_target", target => {

    if (target.menu_target) {

      initFormData(target.menu_target);

    }

  });

}

function appendMenuList(list, target) {

  let elm = typeof (target) == "string" || target instanceof String ? document.getElementById(target) : target;

  addOption(list, elm)

}

function addOption(list, target) {

  list.forEach(val => {

    if (val.id) {

      appendTargetChild(target, createElement({

        option: {

          value: val.id,

          text: val.id,

          id: target.id + "-" + val.id

        }

      }))

      if (val.list) {

        addOption(val.list, target)

      }

    }

  })

  selectItemList()

}

function setFormListData(obj, key, id, func) {

  if (obj[key] instanceof Array) {

    setOptionList(obj[key], id.replace("_", "-"))

  }

}


function initFormData(target) {

  return new Promise((resolve, reject) => {

    chrome.storage.local.get(target, value => {

      if (value[target]) setFormData(value[target], setFormListData)

    });

  })

}

