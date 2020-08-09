/*

*/

window.addEventListener('load', () => {

  chrome.storage.local.get("settings", value => {

    setFormData(value.settings.content.jsonEdit)

  })

  //setListItemButtons()

  //toggleVisibleIconButton()

  //setTargetWindow("settings")

  setTargetEvent("enter-button", {

    click: e => {

      editorsSave();

      setSettingJsonData();

    }

  })

  setTargetEvent("reset-button", {

    click: e => {

      clearForm("settings-form")

      clearAllstrage().then(()=>{
      
        window.close()
      
      })

    }

  })

  setTargetEvent("import-button", {

    click: e => {

      inportAllMenu()

    }

  })

  setTargetEvent("export-button", {

    click: e => {

      editorsSave();

      exportAllMenu().then(value => {

        //window.close()

      })

    }

  })

});

chrome.storage.onChanged.addListener((changes, ns) => {

  if (ns == "local" && changes.settings && changes.settings.newValue && changes.settings.newValue !== changes.settings.oldValue) {

    setFormData(changes.settings.newValue.settings.content.jsonEdit)

  }

})

function setSettingJsonData() {

  let command = { id: "settings" }

  getFormData("settings-form", "_").then(form_data => {
    //alert(JSON.stringify(form_data))
    command.data = form_data

    command.data_key = "content.jsonEdit"

    setJsonData(command).then((val) => { alert(JSON.stringify(val)); if (!close) window.close() })

  })

}
