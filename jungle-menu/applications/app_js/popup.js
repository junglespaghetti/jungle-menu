
chrome.storage.local.get("menu_list", value => {

  //testMessage()

  //alert(JSON.stringify(splitNestObject("a,b,c,d", "," )))

  chrome.storage.local.remove("menu_target")

  var menu_list = value.menu_list && value.menu_list.length > 0 ? value.menu_list : initmenu();
  
  menuLoader(menu_list)

  //title bar icon event

  setTargetEvent("header-setting-button", {

    click: e => {

      executeMenuItem("settings")

    }

  })

  setTargetEvent("header-menu-button", {

    click: e => {

      executeMenuItem("menus")

    }

  })

  toggleIconButton("edit-togle-button", e => {

    e.stopPropagation()

    tggleEditMode()

  })

});

// menu list on chenge event

chrome.storage.onChanged.addListener((changes, ns) => {

  if (ns == "local" && changes.menu_list && changes.menu_list.newValue && changes.menu_list.newValue !== changes.menu_list.oldValue) {

    clearChildList("menu-list-ul")
    
    menuLoader(changes.menu_list.newValue)

  }

})

function menuLoader(menu_list){
  
  return new Promise((resolve, reject) => {
    
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {

      createListMenu(menu_list, tabs).then(val => {

        chrome.storage.local.get("edit_mode", mode => {

          let ul = document.getElementById("menu-list-ul")

          if (mode.edit_mode && !ul.lastElementChild.classList.contains("Edit-message")) {

            appendTargetChild(ul, addPopupDnDHandlers(createElement({ li: { innerHTML: "Edit mode", className: "Edit-message" } })))

          }

        })
  
      })
      
    })
    
  })
  
}

// menu create

function createListMenu(list, tabs, target) {

  if (list && list instanceof Array) {

    const promiseAll = Promise.all(list.map((value) => {

      return new Promise((resolve, reject) => {

        chrome.storage.local.get(value.id, async (item) => {

          let ret = {}
          //if(value.id == "settings") alert(JSON.stringify(JSON.parse(item[value.id].content.jsonEdit)))
          //if(value.id == "settings") alert(JSON.stringify(setJsonData(JSON.parse(item[value.id].content.jsonEdit),"aaa","efg")))

          if (item[value.id].menu.documentUrlPatterns && item[value.id].popup.popupVisible) {

            item[value.id].popup.popupVisible = testUrl(tabs[0].url, item[value.id].menu.documentUrlPatterns)

          }

          ret.id = item[value.id].menu.id

          createListElement(item[value.id], value, tabs, target)

          if (value.list) {

            ret.list = await createListMenu(value.list, tabs, value.id)

          }

          resolve(ret)

        })

      })

    }))

    return promiseAll;


  }else{
    
    return new Promise((resolve, reject) => { })
    
  }

}

function createListElement(item, listItem, tabs, target) {

  let elm = target ? document.getElementById(target + "-list-ul") : document.getElementById("menu-list-ul");

  chrome.storage.local.get("edit_mode", mode => {

    let child = creatMenuItem(item, target ? target : "menu-list-ul")

    if (!item.popup || !item.popup.popupVisible) {

      if (mode.edit_mode) {

        child.style.display = ""

      } else {

        child.style.display = "none"

      }

      child.classList.add("togle-view")

    }

    if (listItem.list) {

      if (item.popup && item.popup.listVisible) {

        child.children[1].style.display = ""

        child.querySelectorAll(".list-close")[0].style.display = "none"

        child.querySelectorAll(".list-open")[0].style.display = ""

      } else {
        //alert(JSON.stringify(item.popup))
        child.children[1].style.display = "none"

      }

      //if(!elm) alert(JSON.stringify(target) + "     " + child.id)

      elm.appendChild(child)

    } else if (child) {

      child.querySelectorAll(".list-visible")[0].style.display = "none"

      elm.appendChild(child)

    }

    if (mode.edit_mode) {

      child.setAttribute("draggable", "true")

      child.querySelectorAll(".item-buttons")[0].style.display = ""

    }

  })

  return true

}

//toggle button

function tggleEditMode() {

  let drag = document.getElementsByClassName("draggable-target-item")

  let ul = document.getElementById("menu-list-ul")

  let toggle = document.getElementsByClassName("togle-view")

  chrome.storage.local.get("edit_mode", mode => {

    if (mode.edit_mode) {

      if (ul.children.length > 0 && ul.lastElementChild.classList && ul.lastElementChild.classList.contains("Edit-message")) {

        ul.removeChild(ul.lastElementChild)

      }

      Object.keys(drag).forEach(key => {

        drag[key].setAttribute("draggable", "false")

      })

      Object.keys(toggle).forEach(key => {

        toggle[key].style.display = "none"

      })

      chrome.storage.local.set({ "edit_mode": false })

    } else {

      if (!ul.lastElementChild.classList.contains("Edit-message")) {

        appendTargetChild(ul, addPopupDnDHandlers(createElement({ li: { innerHTML: "Edit mode", className: "Edit-message" } })))

      }

      Object.keys(drag).forEach(key => {

        drag[key].setAttribute("draggable", "true")

      })

      Object.keys(toggle).forEach(key => {

        toggle[key].style.display = ""

      })

      chrome.storage.local.set({ "edit_mode": true })

    }

  })

}

function toggleIconButton(target, callback) { //visible icon button

  let elm = typeof (target) == "string" || target instanceof String ? document.getElementById(target) : target;

  setTargetEvent(elm, {

    click: e => {

      let icon = elm.children;

      Object.keys(icon).forEach(key => {

        if (icon[key].style.display) {

          icon[key].style.display = ""

        } else {

          icon[key].style.display = "none"

        }

      })

      callback(e)

    }

  })

  return elm

}

function toggleListItem(e) { // visible child

  e.stopPropagation()

  let elm = e.target.closest("LI")

  if (elm.children[1].style.display) {

    elm.children[1].style.display = ""

    setListVisible(e.target.closest("LI").id, true)

  } else {

    elm.children[1].style.display = "none"

    setListVisible(e.target.closest("LI").id, false)

  }

}

function setListVisible(id, val) { // save visible

  chrome.storage.local.get(id, value => {

    if (value[id]) {

      value[id].popup = value[id].popup ? value[id].popup : {}

      value[id].popup.listVisible = val

      chrome.storage.local.set(value)

    }

  })

}

// list click event

function listEventHandlers(elm, value) {

  elm.addEventListener("click", e => {

    e.stopPropagation()

    chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {

      executeMenuItem(value.menu.id, tab.id)

    })

  })

}

//list button event

function copyListItem(e) {

  e.stopPropagation()

  let elm = e.target.closest("LI")

  let parentId = elm.parentNode.parentNode.tagName == "LI" ? elm.parentNode.parentNode.id : undefined

  duplicateMenuItem({ id: elm.id, parentId: parentId })

}

function deleteListItem(e) {

  e.stopPropagation()

  let elm = e.target.closest("LI")

  deleteMenuItem({ id: elm.id })

}

function openMenuWindow(e) {

  chrome.storage.local.remove("menu_target")

  e.stopPropagation()

  chrome.storage.local.set({ menu_target: e.target.closest("LI").id }, () => {

    executeMenuItem("menus")

  })

}

//execute helper

function executeMenuItem(id, tab_id) {

  let obj = { execute_menu: { id: id } }

  if (tab_id) obj.execute_menu.tab_id = tab_id

  sendMenuCommand(obj).then(response => {

    //alert(JSON.stringify(response))

    if (response && response.close) {

      window.close();

    }

  }).catch(err => {

    alert(err)

  })

}

// draggeble

function addPopupDnDHandlers(elm) {

  elm.addEventListener('dragstart', e => {

    e.stopPropagation()

    e.dataTransfer.effectAllowed = 'move';

    e.currentTarget.classList.add("draged-item");

    e.currentTarget.style.opacity = "0.4";

    if ((e.currentTarget.children[1].tagName == "UL" || e.currentTarget.children[1].tagName == "OL") && e.currentTarget.children[1].children.length > 0) {

      targetChildMark(e.currentTarget.children[1].children)

    }

    //e.currentTarget.parentNode.classList.add("draged-parent");

  });

  elm.addEventListener('dragover', e => {

    e.stopPropagation()

    if (e.preventDefault) {

      e.preventDefault();

    }

    if (e.currentTarget && !e.currentTarget.classList.contains("draged-item") && !e.currentTarget.classList.contains("draged-item-child") && (e.currentTarget.parentNode.tagName == "OL" || e.currentTarget.parentNode.tagName == "UL")) {

      e.currentTarget.style.borderTop = "2px solid green";

      if (!e.currentTarget.parentNode.lastElementChild.classList.contains("drop-current")) {

        removeListMassege()

        appendTargetChild(e.currentTarget.children[1], addPopupDnDHandlers(createElement({ li: { innerHTML: "Drop Item", className: "drop-current" } })))
        //if(e.currentTarget.parentNode.id == null) contentConsoleLog(e.currentTarget.tagName)
        if (e.currentTarget.parentNode.id != "menu-list-ul") {

          appendTargetChild(e.currentTarget.parentNode, addPopupDnDHandlers(createElement({ li: { innerHTML: "Drop Item", className: "drop-parent" } })))

        }

      }

      //open list

      if (e.currentTarget.id && e.currentTarget.children[1].style.display == "none") {

        e.currentTarget.children[1].style.display = ""

        e.currentTarget.querySelectorAll(".list-close")[0].style.display = "none"

        e.currentTarget.querySelectorAll(".list-open")[0].style.display = ""

      }

    }

    e.dataTransfer.dropEffect = 'move';

  });

  elm.addEventListener('dragleave', e => {

    e.currentTarget.style.borderTop = "";

  })

  elm.addEventListener('drop', e => {

    e.stopPropagation();

    if (!e.currentTarget.classList.contains("draged-item") && !e.currentTarget.classList.contains("draged-item-child") && (e.currentTarget.parentNode.tagName == "OL" || e.currentTarget.parentNode.tagName == "UL")) {

      let command = {}

      command.id = document.getElementsByClassName("draged-item")[0].id

      if (e.currentTarget.id && (e.currentTarget.id != "menu-list-ul" || e.currentTarget.id != "menu-list")) {

        command.befor_id = e.currentTarget.id

      }

      if (e.currentTarget.parentNode.parentNode.tagName == "LI") {

        command.parentId = e.currentTarget.parentNode.parentNode.id

      }

      moveMenuItem(command)

    }

    e.currentTarget.style.borderTop = ""

  })

  elm.addEventListener('dragend', e => {

    e.stopPropagation()

    removeListMassege()

    var elm = document.getElementsByClassName("draged-item")[0];

    if (elm) {

      elm.style.opacity = "";

      elm.classList.remove("draged-item");

    }

    var child = document.getElementsByClassName("draged-item-child");

    if (child) {

      Object.keys(child).forEach(key => {

        if (child[key] && child[key].classList) {

          child[key].classList.remove("draged-item-child");

        }

      })

    }

  });

  return elm

}

function targetChildMark(list) {

  Object.keys(list).forEach(key => {

    list[key].classList.add("draged-item-child");

    if (list[key].children[1].children.length > 0) {

      targetChildMark(list[key].children[1].children)

    }

  })

  return

}

function removeListMassege() {

  let target = document.getElementsByTagName("UL")

  Object.keys(target).forEach(item => {

    let current = target[item].getElementsByClassName("drop-current");

    Object.keys(current).forEach(key => {


      if (current[key]) {

        current[key].parentNode.removeChild(current[key])

      }

    })

    let parent = target[item].getElementsByClassName("drop-parent");

    Object.keys(parent).forEach(key => {

      if (parent[key]) {

        parent[key].parentNode.removeChild(parent[key])

      }

    })

  })

}

// element

function creatMenuItem(value, target) {

  if (value) {

    let elm = addPopupDnDHandlers(

      createElement({

        li: {

          id: value.menu.id,

          className: target.slice(0, 13) + "li draggable-target-item li-" + value.menu.id,

        }

      },

        createMenuContent(value, target),

        createElement({

          ul: {

            id: value.menu.id + "-list-ul",

            className: "item-list-ul",

          }

        })

      )

    )

    listEventHandlers(elm, value);

    return elm

  }

}

function createMenuContent(value, target) {

  let obj = createElement({

    div: {

      id: "title-" + value.menu.id,

    }

  },

    createElement({

      div: {

        id: "list-hader",

        className: "list-item-heder"

      }

    }, toggleIconButton(createElement({

      div: {

        className: "list-visible",

        style: "float:left;"

      }

    }, createIcon("arrow_right", {

      i: {

        className: "small-size"

      },

      span: {

        className: "menu-icon list-close icon-" + value.menu.id

      }

    }), createIcon("arrow_drop_down", {

      i: {

        className: "small-size"

      },

      span: {

        className: "menu-icon list-open icon-" + value.menu.id,

        style: "display:none;"

      }

    })),

      toggleListItem

    ),

      createElement({

        div: {

          className: "togle-view item-buttons",

          style: "float: right;display:none;"

        }


      },

        createIcon("account_tree", {

          i: {

            className: "small-size"

          },

          span: {

            className: "item-button item-copy-icon icon-" + value.menu.id

          }

        }, {

          click: copyListItem

        }),

        createIcon("delete_forever", {

          i: {

            className: "small-size"

          },

          span: {

            className: "item-button item-delete-icon icon-" + value.menu.id

          }

        }, {

          click: deleteListItem

        }),

        createIcon("launch", {

          i: {

            className: "small-size"

          },

          span: {

            className: "item-button item-edit-icon icon-" + value.menu.id

          }

        }, {

          click: openMenuWindow

        })),

      createElement({

        div: {

          className: "title-span"

        }

      },

        createIcon(value.popup && value.popup.icon ? value.popup.icon : undefined, {

          i: {

            className: "small-size"

          },

          span: {

            className: "menu-icon icon-" + value.menu.id

          }

        }),

        createElement({

          span: {

            innerHTML: value.menu.title,

            className: "item-title item-title-" + value.menu.id

          }

        })

      )

    ),

    createElement({

      div: {

        id: "item-content",

        innerHTML: value.menuOption && value.menuOption.htmlEdit ? value.menuOption.htmlEdit : ""

      }

    }

    )

  )

  return obj

}
