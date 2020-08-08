
const editorList = ["settings-jsonEdit", "menus-jsonEdit", "languages-jsonEdit", "editor-jsonEdit"]

window.addEventListener('load', () => {

  chrome.storage.local.get("languages", value => {
    //alert(JSON.stringify(value.languages.content.jsonEdit))

    if (value && value.languages && value.languages.content && value.languages.content.jsonEdit) {
      //alert(JSON.stringify(value.languages.content.jsonEdit))
      setEditor(editorList, editorSetting).then(editors=>{setFormData(value.languages.content.jsonEdit)})
    }
  })

  //setListItemButtons()

  //toggleVisibleIconButton()

  //setTargetWindow("language")//移動

  setTargetEvent("enter-button", {

    click: e => {

      setLocalStrage();

    }

  })

  setTargetEvent("reset-button", {

    click: e => {

      deleteLocalStrage();

    }

  })

  setTargetEvent("import-button", {

    click: e => {

      importMenuJson({ id: "languages" })

    }

  })

  setTargetEvent("export-button", {

    click: e => {

      editorsSave();

      exportLocalStrage();

    }

  })

})


chrome.storage.onChanged.addListener((changes, ns) => {

  if (ns == "local" && changes.languages && changes.languages.newValue && changes.languages.newValue !== changes.languages.oldValue) {
alert(JSON.stringify(changes.languages.newValue))
    setFormData(changes.languages.newValue.languages.content.jsonEdit)

  }

})

function setLocalStrage(close) {

  let command = { id: "languages" }

  getFormData("languages-form", "_").then(form_data => {
    //alert(JSON.stringify(form_data))
    command.data = form_data

    command.data_key = "content.jsonEdit"

    setJsonData(command).then((val) => {alert(JSON.stringify(val)); if (!close) window.close() })
    
  })

}

function deleteLocalStrage(name) {

  clearForm("languages-form")

  setLocalStrage(true)

}

function exportLocalStrage(menu_id) {

  let command = {

    id: "languages",

    file_name: "languages",

    data_key: "content.jsonEdit",

    menu_data: getFormData("languages-form", "_")

  }

  exportMenuJson(command).then(value => {

    window.close()

  })

}
