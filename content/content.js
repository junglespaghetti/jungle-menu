/*

*/

chrome.runtime.sendMessage({ type: "content_ready" }, response => {

  if (response.menu_session) {

    messageListener(response.menu_session)

  }

});

function messageListener(session) {

  window.addEventListener("message", event => {

    if (event.source != window) return;

    if (event.data.type && (event.data.type == "menu_request" && menu_session == session)) {

      sendMenuCommand(event.data).then(response => {

        window.postMessage({ type: "menu_respose", menu_respose: response, message_id: event.data.message_id }, event.origin)

      }).catch(err => {

        window.postMessage({ type: "menu_respose", menu_respose: err, message_id: event.data.message_id }, event.origin)

      })

    }

  }, false)

}

function getInfo() {

  var current = document.activeElement;

  let info = {

    "editable": current.isContentEditable,

    "tagName": current.tagName,

    "id": current.id,

    "cullas": current.className

  }

  return info

}

function myMessage() {
  console.log("myMessage")
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

function sendManuCommandMessage(command, callback) {

  if (typeof callback === 'function') return "non function"

  let session = getUrlParameters("session")

  let id = command.id ? command.id + getRndStr(16) : getRndStr(16)

  window.postMessage({ type: "menu_request", menu_command: command, menu_session: session, message_id: id }, "*")

  window.addEventListener("message", function (event) {

    if (event.source != window) return;

    if (event.data.type && (event.data.type == "menu_response" && message_id == id)) {

      callback(event.data.menu_response)

    }

  })

  return "post message"

}

function getUrlParameters(key) {

  let arg = {}

  let pair = location.search.substring(1).split('&')

  for (let i = 0; pair[i]; i++) {

    let kv = pair[i].split('=')

    arg[kv[0]] = kv[1]

  }

  if (key) return aug[key]

  return arg

}

function sendCommandMessage(command, id, url) {

  let session = getUrlParameters("session")

  if (url) url = "*"

  window.postMessage({ type: "menu_request", menu_command: command, menu_session: session, message_id: id }, "*")

}

function menuResponseListener(callback) {

  window.addEventListener("message", function (event) {

    if (event.source != window) return;

    if (typeof callback === 'function' && event.data.type && (event.data.type == "menu_response")) {

      callback(event.data.menu_response)

    }

  })

}

function serchJsonData(obj, target, del) {

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

      ret = { message: name + " was not found" }

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

      ret = ret ? ret : { message: name + " was not found" }

    }

  }

  return ret

}

function insertJsonData(obj, target, data) {

  let name = isString(target) && target.split(".").length > 1 ? target.split(".") : target

  name = target instanceof Array ? target.shift() : target

  if (target instanceof Array) {

    if (Object.keys(obj).some(key => key == name)) {

      if (target.length === 0) {
        //contentConsoleLog(data)
        obj[name] = data

      } else {

        obj[name] = setJsonData(obj[name], target, data)

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

          obj[key] = setJsonData(obj[key], target, data)

        }

      })

    }

  }

  return obj

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

