// menu commands

function createMenuItem(command) {

  return new Promise((resolve, reject) => {

    chrome.storage.local.get("menu_list", async value => {

      let list_item

      if (command.menu_data) {

        list_item = {
          id: command.id
        }

        if (command.parentId) list_item.parentId = command.parentId

        if (command.list) list_item.list = command.list

        let menu_data = {}

        command.menu_data.menu.id = command.menu_data.menu.id ? command.menu_data.menu.id : command.id

        command.menu_data.menu.title = command.menu_data.menu.title ? command.menu_data.menu.title : command.menu_data.menu.id

        menu_data[command.id] = command.menu_data
        //alert(JSON.stringify(list_item))
        await chrome.storage.local.set(menu_data)

      } else {

        if (command.id == command.parentId) delete command.parentId

        list_item = getListData(value.menu_list, command.id)

        if (list_item && command.parentId && command.parentId != list_item.parentId) {

          await chrome.storage.local.get(command.id, menu_data => {

            if (menu_data) {

              if (command.parentId) {

                menu_data[command.id].menu.parentId = command.parentId

              } else if (!command.parentId) {

                delete menu_data[command.id].menu.parentId

              }

            } else {

              menu_data = {}

              menu_data[command.id] = {
                menu: {
                  id: command.id,
                  title: command.id
                }
              }

              if (command.parentId) menu_data[command.id].menu.parentId = command.parentId

            }

            chrome.storage.local.set(menu_data)

          })

        }

        list_item = list_item ? list_item : {
          id: command.id
        }

        if (command.parentId) {

          list_item.parentId = command.parentId

        } else if (!command.parentId) {

          delete list_item.parentId

        }

      }

      let newList = setMenuList(value.menu_list, list_item, command.after_id, command.befor_id)

      chrome.storage.local.set({
        menu_list: newList
      });

      resolve(list_item)

    })

  })

}

function commandKeyFilter(command) {

  if (!command.id && command.menu_id) command.id = command.menu_id

  if (!command.parentId && command.parent_id) command.parentId = command.parent_id

  return command

}

function moveMenuItem(command) {

  return new Promise((resolve, reject) => {

    createMenuItem(command).then(() => {

      resolve("move menu")

    }).catch(err => {

      resolve(err)

    })

  })

}

function duplicateMenuItem(command) {

  return new Promise((resolve, reject) => {

    chrome.storage.local.get("menu_list", list => {

      chrome.storage.local.get(command.id, item => {

        let newItem = setSequence(list.menu_list, item, command.id)

        let newID = Object.keys(newItem)[0]

        let newCommand = getListData(list.menu_list, command.id)

        newCommand = Object.assign(newCommand, command)

        newCommand.id = newID

        newCommand.menu_data = newItem[newID]

        if (command.parentId) {

          newItem[newID].menu.parentId = command.parentId

        } else {

          delete newItem[newID].menu.parentId

          delete newCommand.parentId

        }

        duplicateChildMenu(list.menu_list, newCommand.list, newID).then(newList => {

          if (newList) newCommand.list = newList
          //alert(JSON.stringify(newCommand))
          createMenuItem(newCommand).then(val => {

            resolve(val)

          })

        })

      })

    })

  })

}

function duplicateChildMenu(menu_list, list, parent_id) {

  if (list) {

    const promiseAll = Promise.all(list.map((list_item) => {

      return new Promise((resolve, reject) => {

        chrome.storage.local.get(list_item.id, item => {

          let newItem = setSequence(menu_list, item, list_item.id)

          let newID = Object.keys(newItem)[0]

          newItem[newID].menu.parentId = parent_id

          list_item.id = newID
          //alert(JSON.stringify(newItem))
          list_item.parentId = parent_id

          chrome.storage.local.set(newItem)

          if (list_item.list) {

            list_item.list = duplicateChildMenu(menu_list, list_item.list, newID)

          }

          resolve(list_item)

        })

      })

    }))


    return promiseAll

  } else {

    return new Promise((resolve, reject) => {
      resolve(undefined)
    })

  }

}

function deleteMenuItem(command) {

  return new Promise((resolve, reject) => {

    chrome.storage.local.get("menu_list", list => {

      let itemList = getListData(list.menu_list, command.id)

      itemList.list = itemList.list ? itemList.list : ["non_child"]

      deleteChildMenu(itemList.list).then(val => {

        chrome.storage.local.remove(command.id, () => {

          let newList = setMenuList(list.menu_list, {
            id: command.id,
            item_delete: true
          })

          let res = {
            "menu_id": command.id
          }

          if (val[0]) res.delete_child = val
          alert(JSON.stringify(newList))
          chrome.storage.local.set({
            menu_list: newList
          })

          resolve(res)

        })

      })

    })

  })

}

function deleteChildMenu(list) {

  const promiseAll = Promise.all(list.map((item) => {

    return new Promise((resolve, reject) => {

      if (item == "non_child") {

        resolve(undefined)

      } else if (item.list) {

        deleteChildMenu(item.list).then(value => {

          chrome.storage.local.remove(item.id, value => {

            val = {}

            val[item.id] = value

            resolve(val)

          })

        })

      } else {

        chrome.storage.local.remove(item.id, () => {

          resolve(item.id)

        })

      }

    })

  }))

  return promiseAll;

}

function getChildMenu(command) {

  return new Promise((resolve, reject) => {

    chrome.storage.local.get("menu_list", list => {

      let list_item = {}

      if (command.id) {

        List_item = getListData(list.menu_list, command.id)

      } else {

        list_item.list = list.menu_list

      }

      if (list_item.list) {

        getChildData(command, list_item.list).then(val => {

          list_item.list = val

          resolve({
            list_item: list_item
          })

        })

      } else {

        resolve({
          list_item: list_item
        })


      }

    })

  })

}

function getChildData(command, menu_list) {

  const promiseAll = Promise.all(menu_list.map((item) => {

    return new Promise((resolve, reject) => {

      chrome.storage.local.get(item.id, async value => {

        item.menu_data = command.key ? serchJsonData(value, key) : value

        if (item.list) {

          item.list = await getChildData(command, item.list)

        }

        resolve(item)

      })

    })

  }))

  return promiseAll;

}

function setChildMenu(command, menu_list) {

  return new Promise((resolve, reject) => {

    chrome.storage.local.get("menu_list", list => {

      let list_item = getListData(list.menu_list, command.id)

      if (list_item.list) {

        setChildData(command, list_item.list).then(val => {

          resolve({
            list_item: list_item,
            menu_data: val
          })

        })

      } else {

        resolve({
          list_item: list_item
        })


      }

    })

  })

}

function setChildData(command, menu_list) {

  const promiseAll = Promise.all(list.map((item) => {

    return new Promise(async (resolve, reject) => {

      if (item.list) {

        item.list = await setChildData(command, item.list)

      }

      if (item.menu_data) {

        chrome.storage.local.set(item.menu_data, () => {

          delete item.menu_data

          resolve(item)

        })

      } else {

        resolve(item)

      }

    })

  }))

  return promiseAll;

}

function setJsonData(command) {

  return new Promise((resolve, reject) => {

    chrome.storage.local.get(command.id, value => {

      let newData = {}
      //alert(JSON.stringify(value[command.id].content.jsonEdit))
      newData[command.id] = command.data_key ? insertJsonData(value[command.id], command.data_key, command.data) : command.data
      //contentConsoleLog(data)
      //alert(JSON.stringify(newData))
      chrome.storage.local.set(newData, () => resolve(newData))

    })

  })

}

function getAllMenu() {

  return new Promise((resolve, reject) => {

    chrome.storage.local.get("menu_list", value => {
      //alert(JSON.stringify(value.menu_list))
      getChildData({}, value.menu_list).then(val => {

        resolve(val)

      })

    })

  })

}

function setAllMenu(data) {

  return new Promise(async (resolve, reject) => {

    setChildData({}, data).then(val => {

      chrome.storage.local.set({
        "menu_list": val
      }, () => {

        resolve(val)

      })

    })

  })

}

function getJsonData(command) {

  return new Promise((resolve, reject) => {

    chrome.storage.local.get(command.id, value => {

      let data = command.data_key ? serchJsonData(value[command.id], command.data_key, command.delete) : value

      resolve(data)

    })

  })

}

function deleteJsonData(command) {

  if (command.delete) command.delete = true

  return getJsonData(command)

}

function copyJsonData(command) {

  return (async () => {

    const data = await getJsonData(command)

    command.data = data

    command.id = command.new_key

    const value = setJsonData(command)

    return value

  })

}

function moveJsonData(command) {

  if (command.delete) command.delete = true

  return copyJsonData(command)

}

function exportMenuJson(command) {

  return new Promise((resolve, reject) => {

    if (command.file_name) {

      getJsonData(command).then(data => {
        alert(JSON.stringify(data))
        let newData = {}

        newData.id = command.id

        newData.data_key = command.data_key

        newData.data = Object.assign(data, command.data)

        fileDownloader(command.file_name + ".json", JSON.stringify(newData), 'text/plain')

      })

    }

  })

}

function exportMenuItem(command) {

  return new Promise((resolve, reject) => {

    if (command.export_child) {

      getChildMenu(command).then(val => {

        val.menu_id = command.id ? command.id : "export_all"

        val.menu_data = command.menu_data

        fileDownloader(command.file_name + ".json", JSON.stringify(val), 'text/plain');

      })

    } else {

      let obj = {
        id: command.id,
        list_item: {
          id: command.id
        },
        menu_data: command.menu_data
      }

      fileDownloader(command.file_name + ".json", JSON.stringify(obj), 'text/plain');

    }

  })

}

function exportAllMenu() {

  return new Promise((resolve, reject) => {

    getAllMenu().then(val => {

      fileDownloader("menu_config.json", JSON.stringify(val), 'text/plain');

      resolve(val)

    })

  })

}

function inportAllMenu() {

  return new Promise(async (resolve, reject) => {

    const file = await fileUpLoader('.json, text/plain')

    let importData = JSON.parse(file.content);

    clearAllstrage().then(() => {

      setAllMenu(importData).then(val => {

        resolve(val)

      })

    })

  })

}

function importMenuJson(command) {

  return new Promise(async (resolve, reject) => {

    if (command.id) {

      const file = await fileUpLoader('.json, text/plain')

      let importData = JSON.parse(file.content);

      if (importData && isObject(importData)) {

        importData.id = command.id ? command.id : importData.id

        importData.data_key = command.data_key ? command.data_key : importData.data_key

        if (command.data) importData.data = Object.assing(importData.data, command.data)

        setJsonData(importData)

      }

    }

  })

}

function importMenuItem(command) {

  return new Promise((resolve, reject) => {

    chrome.storage.local.get("menu_list", async list => {

      const file = await fileUpLoader('.json, text/plain')

      let importData = JSON.parse(file.content);

      let newItem = setSequence(list.menu_list, importData.menu_data)

      let newID = Object.keys(newItem)[0]

      let newCommand = Object.assign(importData.list_item, command)

      newCommand.id = newID

      newCommand.menu_data = newItem[newID]

      newCommand.list_item = importData.list_item

      if (command.parentId) {

        newItem[newID].menu.parentId = command.parentId

      } else {

        delete newItem[newID].menu.parentId

        delete newCommand.parentId

      }

      if (!importData.list_item.list) importData.list_item.list = ["non_list"]

      importChildMenu(list.menu_list, importData.list_item.list, newID).then(newList => {

        if (newList) newCommand.list_item.list = newList
        //alert(JSON.stringify(newList))
        createMenuItem(newCommand).then(val => {

          resolve(val)

        })

      })

    })

  })

}

function importChildMenu(menu_list, item_list, parent_id) {

  const promiseAll = Promise.all(item_list.map(item => {

    return new Promise((resolve, reject) => {

      if (item != "non_list") {

        let newItem = setSequence(menu_list, item.menu_data)

        let newID = Object.keys(newItem)[0]

        let list_item = {
          id: newID,
          parentId: parent_id
        }

        newItem[newID].menu.parentId = parent_id

        chrome.storage.local.set(newItem)

        if (item.list) {

          list_item.list = importChildMenu(menu_list, item.list, newID)

        }

        resolve(list_item)

      } else {

        resolve(undefined)

      }

    })

  }))

  return promiseAll

}

function clearAllstrage() {

  return new Promise((resolve, reject) => {

    sessionStorage.clear()

    chrome.storage.local.clear(() => {
      resolve("clear all storage")
    })


  })

}

// Send menu command

function sendMenuCommand(command, callback) {

  return new Promise(function (resolve, reject) {

    chrome.runtime.sendMessage({

      type: "menu_request",

      menu_command: command

    }, response => {

      if (chrome.runtime.lastError) {

        console.error(chrome.runtime.lastError.message);

        reject(chrome.runtime.lastError.message);

      } else if (response && typeof callback === 'function') {

        resolve(callback(response))

      } else {

        resolve(response)

      }

    })

  })

}

//list item

function setMenuList(menu_list, list_item, after_id, befor_id) {

  let insert_id

  let befor

  if (befor_id) {

    befor = true

    insert_id = befor_id

  } else if (after_id) {

    insert_id = after_id

  }

  let newList = findParentNode(menu_list, list_item, insert_id, befor)

  if (!list_item.parentId && !list_item.item_delete) {

    let index = newList.findIndex(item => item.id === insert_id)

    if (index >= 0) {

      newList.splice(index, 0, list_item)

    } else {

      newList.push(list_item)

    }

  }

  return newList

}

function findParentNode(arr, obj, insert, befor) {

  arr = arr.filter(v => v.id !== obj.id)

  arr.forEach(val => {

    if (val.id == obj.parentId) {

      if (val.list) {

        val.list = findParentNode(val.list, obj, insert, befor)

        if (insert) {

          let index = val.list.findIndex(item => item.id === insert)

          index = befor ? index : index + 1

          if (index >= 0) val.list.splice(index, 0, obj)

        } else {

          val.list.push(obj)

        }

        if (val.list.length < 1) {

          delete val.list

        }

      } else {

        val.list = [obj]

      }

    } else if (val.list) {

      val.list = findParentNode(val.list, obj, insert, befor)

      if (val.list.length < 1) {

        delete val.list

      }

    }

  })

  return arr

}

function getListData(arr, find) {

  let index = arr.findIndex(item => item.id === find)

  let obj

  if (index > -1) {
    //alert(JSON.stringify(arr[index]))
    obj = arr[index]

  } else {

    arr.forEach(val => {

      if (val.list) {

        val = getListData(val.list, find)

        if (val) obj = obj ? obj : val

      }

    })

  }

  return obj

}

// add sequence numbar

function setSequence(list, obj) {

  let menu_id = Object.keys(obj)[0]

  let sequence = idSequence(list, obj[menu_id].menu.id, obj[menu_id].menu.title)

  if (sequence.id !== obj[menu_id].menu.id) {

    obj[menu_id].menu.id = sequence.id

    obj[menu_id].menu.title = sequence.title

    obj[sequence.id] = obj[menu_id]

    delete obj[menu_id]

    menu_id = sequence.id

  }

  return obj

}

function idSequence(list, id, title) {

  let obj = {}

  let num = id.slice(id.lastIndexOf("(") + 1, id.lastIndexOf(")")) * 1

  let new_id = id

  let mew_title = title

  if (num && isFinite(num)) {

    new_id = id.slice(0, id.lastIndexOf("("))

    mew_title = title.slice(0, title.lastIndexOf("("))

  } else {

    num = 0

  }

  let serch = getListData(list, id)

  while (serch) {

    new_id = id.slice(0, id.lastIndexOf("("))

    new_id = new_id + "(" + (++num) + ")"

    serch = getListData(list, new_id)

  }

  obj.id = new_id

  obj.title = mew_title

  if (num > 0) obj.title = obj.title + "(" + num + ")"

  return obj

}

// json helper

function serchJsonData(obj, target, del) {

  target = isString(target) && target.split(".").length > 1 ? target.split(".") : target

  let name = target instanceof Array ? target.shift() : target

  let ret

  if (target instanceof Array) {

    if (Object.keys(obj).some(key => key === name)) {

      if (target.length === 0) {

        ret = obj[name]

        if (del) delete obj[name]

      } else {

        ret = serchJsonData(obj[name], target)

      }

    } else {

      ret = {
        message: name + " was not found"
      }

    }

  } else {

    if (Object.keys(obj).some(key => key === name)) {

      ret = obj[name]

      if (del) delete obj[name]

    } else {

      Object.keys(obj).forEach(key => {

        if (isObject(obj[key])) {

          let r = serchJsonData(obj[key], target)

          if (!r.message || r.message !== name + " was not found") {

            ret = ret ? ret : r

          }

        }

      })

      ret = ret ? ret : {
        message: name + " was not found"
      }

    }

  }

  return ret

}

function insertJsonData(obj, target, data) {

  target = isString(target) && target.split(".").length > 1 ? target.split(".") : target

  let name = target instanceof Array ? target.shift() : target

  if (target instanceof Array) {

    if (Object.keys(obj).some(key => key == name)) {

      if (target.length === 0) {
        //contentConsoleLog(data)
        obj[name] = data

      } else {


        obj[name] = insertJsonData(obj[name], target, data)

      }

    } else {

      let d = data

      let o

      for (let i = 0; i < target.length; i++) {

        o = {}

        o[target[target.length - 1 - i]] = d

        d = o

      }

      obj[name] = d

    }

  } else {

    if (Object.keys(obj).some(key => key === name)) {

      obj[name] = data

    } else {

      Object.keys(obj).forEach(key => {

        if (isObject(obj[key])) {

          obj[key] = insertJsonData(obj[key], target, data)

        }

      })

    }

  }

  return obj

}

//file upload

function fileUpLoader(mime) {

  const showOpenFileDialog = () => {
    return new Promise(resolve => {
      const input = document.createElement('input');
      input.type = 'file';
      if (mime) input.accept = mime;
      input.onchange = event => {
        resolve(event.target.files[0]);
      };
      input.click();
    });
  };

  const readAsText = file => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        resolve(reader.result);
      };
    });
  };

  return (async () => {
    const file = await showOpenFileDialog();
    const content = await readAsText(file);
    let obj = {}
    obj.name = file.name
    obj.size = file.size
    obj.type = file.type
    obj.content = content
    return obj;
  })();

}

//download

function fileDownloader(name, data, mime) {

  var arr = data instanceof Array ? data : [data]

  var blob = new Blob(arr, {
    type: mime
  })

  let link = document.createElement('a')

  link.href = window.URL.createObjectURL(blob)

  link.download = name

  link.click()

}

//etc

function isObject(obj) {

  return obj !== null && Object.prototype.toString.call(obj) == "[object Object]";

}

function isString(str) {

  return typeof (str) == "string" || str instanceof String

}

function contentConsoleLog(message, json) {

  //  let str = json ? JSON.stringify(message) : message

  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, async tabs => {

    chrome.tabs.executeScript(tabs[0].id, {
      code: "console.log(JSON.stringify(" + JSON.stringify(message) + "));"
    })

  })

}

function testUrl(url, pattarn) {

  let flag = false

  if (url, pattarn) {

    pattarn.forEach(val => {

      let regexp = new RegExp(val.replace(/\*/g, ".*") + ".*", "g")

      flag = flag ? flag : regexp.test(url)

    })
  }

  return flag

}


function getRndStr(length) {

  var str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&=~/*-+";

  var len = length;

  var result = "";

  for (var i = 0; i < len; i++) {

    result += str.charAt(Math.floor(Math.random() * str.length));

  }

  return result;

}