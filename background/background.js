/*

*/

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  requestListener(request, sender, sendResponse)

  return true

})

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {

  requestListener(request, sender, sendResponse)

  //contentConsoleLog("message")

  return true

})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

  if (changeInfo.status == "loading") {
    //contentConsoleLog(tabId)
    let target = sessionStorage.getItem("tab_" + tabId)

    if (target) {

      sessionStorage.removeItem("tab_" + tabId)

    }

  }

});

chrome.storage.onChanged.addListener((changes, ns) => {

  //clearChildList("menu-list")

  if (ns == "local" && changes.menu_list && changes.menu_list.newValue && changes.menu_list.newValue !== changes.menu_list.oldValue) {

    chrome.contextMenus.removeAll(() => {

      chrome.contextMenus.create({

        title: "Jungle menu",

        id: "jungle_menu",

        type: "normal",

        contexts: ["all"]

      }, () => { refreshContextMenu(changes.menu_list.newValue) })

    })

  }

})

chrome.contextMenus.onClicked.addListener(contextClickEvent)

function refreshContextMenu(list) {

  if (list) {

    list.forEach(item => {

      chrome.storage.local.get(item.id, value => {

        chrome.contextMenus.create(value[item.id].menu)

      })

      if (item.list && item.list.length > 0) {

        refreshContextMenu(item.list)

      }

    })

  }

}

function requestListener(request, sender, sendResponse) {

  var response

  switch (request.type) {

    case 'menu_request':

      contentConsoleLog(request.info)

      delete request.type

      if (request) {

        executeMenuCommand(request.menu_command, sender).then(res => sendResponse(res))

      }

      break;

    case 'content_ready':

      let scriptList = JSON.parse(sessionStorage.getItem("tab_" + sender.tab.id))

      if (scriptList) {

        scriptList.forEach(item => {

          if (item.status === "load") {

            chrome.storage.local.get(item.id, value => {

              //contentConsoleLog(getLoader(value[item.id],item))

              setMenuLoader(scriptList, value[item.id], item.type, sender.tab.id)

              //chrome.tabs.executeScript(sender.tab.id,{code:getLoader(value[item.id],item)})

              response = { status: "OK" }

            })

            item.status = "loaded"

          }

        })

        sessionStorage.setItem("tab_" + sender.tab.id, scriptList)

      } else {

        response = { status: "Failure" }

      }

      sendResponse(response)

      break;

    default:


      break;

  }

  return

}

function executeMenuCommand(commands, sender) {

  commands = commands instanceof Array && commands.length == 1 ? commands[0] : commands

  if (commands instanceof Object && (commands.length > 1 || Object.keys(commands).length > 0)) {

    if (commands instanceof Array && commands.length > 1) {

      return (async () => {

        let arr = []

        for (let com of commands) {

          if (isObject(com) && Object.keys(com).length > 1) {

            arr.push(await Promise.all(getAsyncAllArray(com, sender)))

          } else if (isObject(com)) {

            arr.push(await menuRequestListener(Object.keys(com)[0], com, sender))

          }

        }

        return await arr

      })()

    } else if (isObject(commands) && Object.keys(commands).length > 1) {

      return Promise.all(getAsyncAllArray(commands))

    } else {

      return menuRequestListener(Object.keys(commands)[0], commands)

    }

  } else {

    //reject("error:No command")

  }

}

function getAsyncAllArray(commands, sender) {

  let promiseArray = []

  if (commands) {

    Object.keys(commands).forEach(key => {

      if (isObject(commands[key])) {

        promiseArray.push(menuRequestListener(key, commands, sender))

      }

    })

  }

  return promiseArray

}

function menuRequestListener(command, commands) {

  let com = commands[command]

  switch (command) {

    case 'execute_menu':

      return new Promise((resolve, reject) => {

        chrome.storage.local.get(com.id, value => {

          if (chrome.runtime.lastError) {

            console.error(chrome.runtime.lastError.message);

            reject(chrome.runtime.lastError.message);

          } else {

            resolve(executeMenu(value[com.id], com))

          }

        })

      })

      break;

    case 'create_menu':

      if (com.menu_id || com.data.menu.id) {

        return createMenuItem(com)

      }

      break;

    case 'import_menu':

      return importMenuItem(com)

      break;

    case 'export_menu':

      return exportMenuItem(com)

      break;

    case 'duplicate_menu':

      return duplicateMenuItem(com)

      break;

    case 'move_menu':

      return moveMenuItem(com)

      break;

    case 'delete_menu':

      return deleteMenuItem(com)

      break;

    case 'get_childs':

      return getChildMenu(com)

      break;

    case 'set_data':

      return setJsonData(com)

      break;

    case 'get_data':

      return getJsonData(com)

      break;

    case 'move_data':

      return moveJsonData(com)

      break;

    case 'copy_data':

      return copyJsonData(com)

      break;

    case 'delete_data':

      return deleteJsonData(com)

      break;

    case 'post_content':

      return new Promise((resolve, reject) => {

        let tabId = sessionStorage.getItem(com.menu_id + "_" + com.menu_type)

        if (com.append_data) {

          executeMenuCommand(request.menu_command, sender).then(

            res => {

              let data = com.menu_data

              data.append_data = res

              chrome.tabs.sendMessage(tabId, data, function (respose) {

                resolve(respose)

              })

            }

          )

        } else {

          chrome.tabs.sendMessage(tabId, com.menu_data, function (respose) {

            resolve(respose)

          })

        }

      })

      break;

    case 'post_message':

      return new Promise((resolve, reject) => {

        let tabId = sessionStorage.getItem(com.menu_id + "_" + com.menu_type)

        chrome.tabs.executeScript(tabId, { code: "(window.postMessage(" + JSON.stringify(com.data) + ',"*"))()' })

      })

      break;

    case 'post_external':

      return new Promise((resolve, reject) => {

        let tabId = sessionStorage.getItem(com.menu_id + "_" + com.menu_type)

        if (com.append_data) {

          executeMenuCommand(request.menu_command, sender).then(

            res => {

              let data = com.menu_data

              data.append_data = res

              chrome.runtime.sendMessage(extensionId, data, function (respose) {

                resolve(respose)

              })

            }

          )

        } else {

          chrome.runtime.sendMessage(extensionId, com.menu_data, function (respose) {

            resolve(respose)

          })

        }

      })

      break;

    case 'on_updete':

      break;

    case 'on_change':

      break;

    case 'upload_data':

      return new Promise(async (resolve, reject) => {

        const file = await fileUpLoader(com.file_mime)

        resolve(JSON.parse(file.content))

      })

      break;

    case 'download_data':

      return new Promise(async (resolve, reject) => {

        fileDownloader(command.file_name, JSON.stringify(objcommand.data), com.file_mime)

      })

      break;

    case 'menu_command':

      break;

    default:

      return new Promise((resolve, reject) => { resolve(command + " : There was no command.") })

  }

}

function contextClickEvent(info, tab) {

  contentConsoleLog(info)

  executeMenu(request, tab) // request?

}

function executeMenu(menu_item, command) {

  if (menu_item) {

    let arr = []

    if (menu_item.content) {

      if (menu_item.tab_id) {

        arr.push(pageRequest(menu_item, "menu", command.tab_id))

      } else {

        arr.push(currentRequest(menu_item, "menu"))

      }

    }

    if (menu_item.window && menu_item.window.url) {

      if (menu_item.windowOption && menu_item.windowOption.duplicate) {

        arr.push(windowRequest(menu_item))

      } else {

        let id = sessionStorage.getItem(command.id + "_window")

        if (id) {

          arr.push(pageRequest(menu_item, "window", id))

        } else {

          arr.push(windowRequest(menu_item))

        }

      }


    }

    if (menu_item.tab && menu_item.tab.url) {

      if (menu_item.tabOption && menu_item.tabOption.duplicate) {

        arr.push(tabRequest(menu_item))

      } else {

        let id = sessionStorage.getItem(command.id + "_tab")

        if (id) {

          arr.push(pageRequest(menu_item, "tab", id))

        } else {

          arr.push(tabRequest(menu_item))

        }

      }

    }

    const promiseAll = Promise.all(arr)

    return promiseAll

    //contentConsoleLog(tab)
  }

}


function pageRequest(request, type, tab_id) {

  return new Promise((resolve, reject) => {

    if (!checkUrl(request.window.url) && !checkUrl(request.tab.url)) {

      insertContentFile(request, type, tab_id)

      chrome.tabs.get(tab_id, tab => {

        resolve(tab)

      })

    }

  })

}

function currentRequest(request, type) {

  return new Promise((resolve, reject) => {

    chrome.tabs.query({ active: true, currentWindow: true }, current => {

      if (!checkUrl(request.window.url) && !checkUrl(request.tab.url)) {

        insertContentFile(request, type, current[0].id)

        resolve(current)

      } else {

        resolve("menu_app")

      }

    })

  })

}

function windowRequest(request) {

  return new Promise((resolve, reject) => {

    request.window.url += "?menu_id=" + request.menu.id + "&type=window"
    //alert(request.window.url)
    if (request.windowOption && request.windowOption.paramList) {

      request.windowOption.paramList.map(key => {

        let val = serchJsonData(request, key)

        if (val) request.window.url += "&" + key + "=" + val

      })

    }

    chrome.windows.create(initWindow(request), win => {

      if (!checkUrl(request.window.url)) {

        insertContentFile(request, "window", win.tabs[0].id)

        resolve(win.tabs[0])

      } else {

        resolve("menu_app")

      }

    })

  })

}

function tabRequest(request) {

  return new Promise((resolve, reject) => {

    request.tab.url += "?menuId=" + request.menu.id + "&type=tab"

    if (request.tabOption && request.tabOption.paramList) {

      request.tabOption.paramList.map(key => {

        let val = serchJsonData(request, key)

        if (val) request.tab.url += "&" + key + "=" + val

      })

    }

    chrome.tabs.create(request.tab, tabs => {

      if (!checkUrl(request.tab.url)) insertContentFile(request, "tab", tabs[0].id)

      resolve(tabs[0])

    })

  })

}


function transferGoogle(url, lang, encode) {

  return 'https://translate.google.co.' + lang + '/translate?sl=ja&tl=auto&js=n&prev=_t&hl=ja&ie=' + encode + '&u=' + encodeURIComponent(url) + '&act=url'

}

function checkUrl(url) {

  return testUrl(url, ["applications/*", "background*", "background/*", "content/*"])

}


function insertContentFile(request, type, tabId) {

  return new Promise((resolve, reject) => {

    let item = {

      type: type,

      status: "load",

      id: request.menu.id

    }

    let scriptList = sessionStorage.getItem("tab_" + tabId)

    if (scriptList) {

      scriptList.push(item)

      setMenuLoader(scriptList, request, type, tabId, befor)

    } else {

      scriptList = []

      scriptList.push(item)

      sessionStorage.setItem("tab_" + tabId, JSON.stringify(scriptList))

      sessionStorage.setItem(request.menu.id + "_" + type, tabId)

      let file = { file: "content/content.js", runAt: "document_start" }

      chrome.tabs.executeScript(tabId, file)

    }

  })

}

function setMenuLoader(scriptList, request, type, tabId) {

  return new Promise((resolve, reject) => {

    if (scriptList.same(listItem => (listItem["status"] == "loaded" && listItem.id == request.menu.id && listItem.type == type))) {

      chrome.tabs.executeScript(tabId, { code: request[type + "Content"].scriptEdit })

    } else {

      chrome.tabs.executeScript(tabId, { code: getLoader(request, type) })

    }

  })

}

function setTabUpdateEvent() {

  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

    if (changeInfo.status == "loading") {
      //contentConsoleLog(tabId)
      let target = sessionStorage.getItem(tabId)

      if (target) {

        sessionStorage.removeItem(tabId)

      }

    }

  });

}

function initWindow(request) {

  chrome.windows.getCurrent(async w => {

    request.window.width = request.window.width ? request.window.width : 300;

    request.window.height = request.window.height ? request.window.height : 200;

    request.window.top = request.window.top ? request.window.top : await w.screenTop;

    request.window.left = request.window.left ? request.window.left : await w.width - request.window.width;

  })

  return request.window

}

function getLoader(request, type) {

  let obj = request[type + "Content"]

  let loader = ""

  if (obj.scriptList || obj.cssList || obj.cssEdit) {
    loader += "(function(f,a"
    if (obj.cssList || obj.cssEdit) loader += ",b,c"
    if (obj.scriptList) loader += ",d,e"
    loader += "){"
    if (obj.cssList) {
      loader += "b=" + strArrayList(obj.cssList)
      loader += ';for(a=0;a<b.length;a++)c=document.createElement("link"),c.type="text/css",c.rel="stylesheet",c.href=b[a],'
      if (!obj.scriptList && !obj.cssList && obj.scriptEdit) loader += 'a==b.length-1&&(c.onload=function(){f()}),'
      loader += "document.body.appendChild(c);"
    }
    if (obj.cssEdit) {
      loader += 'c=document.createElement("link");c.type="text/css";c.rel="stylesheet";c.innerHTML="'
      loader += obj.cssEdit
      loader += '"'
      if (!obj.scriptList && obj.scriptEdit) loader += ';c.onload=function(){f()}'

      loader += ";document.body.appendChild(c);"
    }
    if (obj.scriptList) {
      loader += "d=" + strArrayList(obj.scriptList)
      loader += ';for(a=0;a<d.length;a++)e=document.createElement("script"),e.src=d[a],'
      if (obj.scriptEdit) {
        loader += 'a==d.length-1&&(e.onload=function(){f()}),'
      }
      loader += 'document.body.appendChild(e);'
    }
    loader += '})('
    if (obj.scriptEdit) loader += "function(){"
  }
  if (obj.scriptEdit) loader += obj.scriptEdit + ';'
  if (request.window.url) loader += 'window.postMessage({ type: "menu_content_ready", id: "' + request.menu.id + '" }, "' + request.window.url + '");'
  if (obj.scriptList || obj.cssList || obj.cssEdit) {
    if (obj.scriptEdit) loader += "}"
    loader += ")";
  }
  return loader;
}

function strArrayList(arr) {
  if (arr.length > 0) {
    return '["' + arr.join('","') + '"]';
  } else {
    return "";
  }
}
