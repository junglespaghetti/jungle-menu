
chrome.storage.local.get("languages", value => {

  document.documentElement.lang = "en"

  var meta = document.createElement('meta');

  meta.charset = "utf-8";

  document.getElementsByTagName('head')[0].appendChild(meta);

})


window.addEventListener('load', () => {

  let param = getUrlParameters()
  //  if(param.menu_id)alert(JSON.stringify(param.menu_id))
  if (param && param.menu_id) {
    //  alert(JSON.stringify(param))
    //setTargetWindow(param.munu_id)

    menuLanguage(param.menu_id)

    chrome.storage.local.get(param.menu_id, item => {
      //alert(JSON.stringify(item[param.menu_id][param.type + "Content"]))
      let content = item[param.menu_id][param.type + "Content"]

      if (content && (content.cssList || content.cssEdit)) {

        setMenuCssList(content.cssList, content.cssEdit)

      }

    })

  }

})

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

function setLanguageAndEncoding() {


}

function menuLanguage(menu_id) {

  return new Promise((resolve, reject) => {

    chrome.storage.local.get("languages", value => {


      //alert(JSON.stringify(value))
      if (value && value.languages && value.languages.content && value.languages.content.jsonEdit) {

        let jsonData = value.languages.content.jsonEdit

        if (jsonData[menu_id] && jsonData[menu_id].jsonEdit) {
          //alert(JSON.stringify(jsonData[menu_id].jsonEdit))
          Object.keys(jsonData[menu_id].jsonEdit).forEach(key => {
            //alert(key)
            let elm = document.getElementById(key)

            if (elm) {

              if (elm.tagName == "LABEL" || elm.tagName == "OPTION" || elm.tagName == "BUTTON" || elm.tagName == "SPAN") {

                elm.innerText = jsonData[menu_id].jsonEdit[key]

              } else if (elm.tagName == "INPUT" || elm.tagName == "TEXTAREA") {

                elm.placeholder = jsonData[menu_id].jsonEdit[key]

              }

            }

          })

        } else {

          let elm = Array.from(document.getElementsByClassName("multi-lang"))

          let obj = {}

          elm.forEach(e => {

            if (e.tagName == "LABEL" || e.tagName == "OPTION" || e.tagName == "BUTTON" || e.tagName == "SPAN") {

              obj[e.id] = e.innerText

            } else if (e.tagName == "INPUT" || e.tagName == "TEXTAREA") {

              obj[e.id] = e.placeholder
            }

          })
          //alert(JSON.stringify(obj))
          //jsonData[menu_id] = obj
          value.languages.content.jsonEdit[menu_id] = {}

          value.languages.content.jsonEdit[menu_id].jsonEdit = obj

          //alert(JSON.stringify(value))

          chrome.storage.local.set(value, () => alert(value.languages[menu_id]))

        }

      } else if (value && value.lunguage && (value.lunguage.content || value.lunguage.content.jsonEdit)) {

      }

    })

  })

}

function setMenuCssList(arr, css) {

  if (arr) {

    for (i = 0; i < arr.length; i++) {

      let menu_css = document.createElement("link")

      menu_css.type = "text/css"

      menu_css.rel = "stylesheet"

      menu_css.href = arr[i]

      if (i == arr.length - 1 && css) {

        menu_css.onload = setMenuCss(css)

      }

      document.body.appendChild(menu_css)

    }

  } else if (css) {

    setMenuCss(css)

  }

}


// window data save

function setTargetWindow(target) {

  window.addEventListener("resize", event => {

    chrome.storage.local.get(target, value => {

      value[target].window.width = window.outerWidth

      value[target].window.height = window.outerHeight

      chrome.storage.local.set(value)

    })

  })

  var position = setInterval(() => {

    chrome.storage.local.get(target, value => {

      value[target].window.left = window.screenX

      value[target].window.top = window.screenY

      chrome.storage.local.set(value)

    })

  }, 3000)

  window.addEventListener("beforeunload", event => {

    clearInterval(position)

  })

}


