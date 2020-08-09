
const editorSetting = {

  scriptEdit: {

    mode: "javascript",

    theme: "paraiso-light",

    autorefresh: true,

    lineWrapping: true

  }, cssEdit: {

    mode: "css",

    theme: "paraiso-light",

    lineWrapping: true,

    autorefresh: true

  }, jsonEdit: {

    mode: "json",

    theme: "paraiso-light",

    lineWrapping: true,

    autorefresh: true

  }, htmlEdit: {

    mode: "html",

    theme: "paraiso-light",

    lineWrapping: true,

    autorefresh: true

  }
}

// form helper

function getFormData(form, separator) {

  editorsSave()

  return new Promise((resolve, reject) => {

    let obj = {};

    form = typeof (form) == "string" || form instanceof String ? document.forms[form] : form;

    if (form) {

      for (let i = 0; i < form.length; i++) {

        if ((form[i].tagName == "INPUT" || form[i].tagName == "TEXTAREA" || form[i].tagName == "SELECT") && form[i].value && form[i].name) {

          let arr = !separator || separator != "-" ? form[i].name.split("_") : form[i].id.split("-")

          if (arr.length > 1) {

            obj[arr[0]] = obj[arr[0]] ? obj[arr[0]] : {};

            obj[arr[0]][arr[1]] = getElementData(form[i], obj[arr[0]][arr[1]])

          } else {

            obj[form[i].name] = getElementData(form[i], obj[form[i].name])

          }

        }

      }

    }

    resolve(obj)

  })

}

function splitNestObject(arr, separator, val) {

  if (!(arr instanceof Array)) arr = arr.split(separator ? separator : ",")

  if (arr instanceof Array) {

    arr.unshift("")

    return arr.reverse().reduce((o, v, i, a) => {

      if (isObject(o)) {

        let nest = {}

        nest[a[i - 1]] = o

        return nest

      } else {

        let nest = {}

        nest[a[i - 1]] = val ? val : ""

        return nest

      }

    })

  }

  return arr

}

function getElementData(elm, arr) {

  if (elm.classList.contains("list-item") === true) {

    arr = arr ? arr : []

    return arr.push(elm.value)

  } else if (elm.type == "checkbox") {

    if (elm.checked) return true

    return false

  } else if (elm.type == "number") {

    return parseInt(elm.value)

  } else if (elm.name.slice(-8) == "jsonEdit") {

    return JSON.parse(elm.value);

  } else {

    return elm.value

  }

}

function setFormData(obj, callback, name) {

  return new Promise((resolve, reject) => {

    Object.keys(obj).forEach(key => {

      let elm_name = name ? name + "_" + key : key

      if (isObject(obj[key]) && key !== "jsonEdit") {

        setFormData(obj[key], callback, elm_name)

      } else {

        setElementData(obj, key, elm_name, callback)

      }

    })
    
  })

}

function setElementData(obj, key, name, callback) {

  return new Promise((resolve, reject) => {

    if (obj[key] instanceof Array && typeof callback === 'function') {

      callback(obj, key, name)

    } else if (key.slice(-4) == "Edit") {

      let editors = document.querySelectorAll(".CodeMirror")

      if (key == "jsonEdit") {
        //alert(JSON.stringify(name) + editorList.indexOf(name.replace("_", "-")))
        editors[editorList.indexOf(name.replace("_", "-"))].CodeMirror.setValue(JSON.stringify(obj[key]))

      } else {

        editors[editorList.indexOf(name.replace("_", "-"))].CodeMirror.setValue(obj[key])

      }

    } else if (document.getElementsByName(name)) {

      let elm = document.getElementsByName(name)[0];

      if (elm) {

        if (elm.type == "checkbox") {

          elm.checked = obj[key] && obj[key] === true ? true : false;


        } else if (elm.type == "select") {

          var option = document.getElementById(name + "_" + obj[key]);

          option.selected = true;

        } else {

          elm.value = obj[key];

        }

      }

    }

    resolve(name)

  })

}

//codemirror

function setEditor(editorList, editorSetting) {
  
  return new Promise((resolve, reject) => {

    let editors = []

    for (let i = 0; i < editorList.length; i++) {

      let type = editorList[i].split("-")

      editors[i] = CodeMirror.fromTextArea(document.getElementById(editorList[i]), editorSetting[type[1]])

      editors[i].setSize("100%", 60);

    }
    
    resolve(editors)
    
  })

}

function editorsSave() {

  let editors = document.querySelectorAll(".CodeMirror")

  Object.keys(editors).forEach(key => {

    editors[key].CodeMirror.save();

  })

}

function clearForm(target) {

  document.forms[target].reset();

  clearEditor()

  clearListItem("append-list")

}

function clearEditor() {

  let editor = document.querySelectorAll(".CodeMirror")

  if (editor) {

    Object.keys(editor).forEach(key => {

      editor[key].CodeMirror.setValue("")

      editor[key].CodeMirror.clearHistory()

    })

  }

}

function clearListItem(target) {

  let lists = document.getElementsByClassName(target);

  Object.keys(lists).forEach(key => {

    clearChildList(lists[key])

  })

}

function clearChildList(target) {

  let elm = typeof (target) == "string" || target instanceof String ? document.getElementById(target) : target;

  if (elm) {

    elm.textContent = null

  }

}

// elsement helper

function createElement(options) {

  let elm

  if (options) {

    Object.keys(options).forEach(name => {

      elm = document.createElement(name);

      Object.keys(options[name]).forEach(key => {

        elm[key] = options[name][key];

      });

    });

  }

  if (elm && arguments.length > 1) {

    for (var i = 1; i < arguments.length; i++) {

      if (arguments[i]) {

        elm.appendChild(arguments[i]);

      }

    };

  }

  return elm

}

function createIconButton(icon, event, option) {

  if (icon) {

    let elmi = createIcon(icon, { i: { style: "font-size:13px" }, span: { class: "iconButton", style: "margin-left: 3px;" } }, event)

    return elm;

  }

}

function createIcon(icon, options, event) {

  if (icon) {

    var text = document.createTextNode(icon);

    var elm = document.createElement("span")

    var elmi = document.createElement("i")

    if (options.span) {

      Object.keys(options.span).forEach(key => {

        elm[key] = options.span[key];

      });

    }

    if (options.i) {

      Object.keys(options.i).forEach(key => {

        elmi[key] = options.i[key];

      });

    }

    if (elmi.classList.contains('material-icons') == false) {

      elmi.classList.add('material-icons')

    }

    elmi.appendChild(text);

    elm.appendChild(elmi);

    if (event) setTargetEvent(elm, event)

    return elm;

  }

}

function appendTargetChild(target) {

  let elm = typeof (target) == "string" || target instanceof String ? document.getElementById(target) : target;

  if (elm && arguments.length > 1) {

    for (var i = 1; i < arguments.length; i++) {

      if (arguments[i]) {

        elm.appendChild(arguments[i]);

      }

    };

  }

}

function setTargetEvent(target, event) {

  let elm = typeof (target) == "string" || target instanceof String ? document.getElementById(target) : target;

  if (elm && event) {

    Object.keys(event).forEach(key => {

      elm.addEventListener(key, event[key]);

    });

  }

}

// toggle icon button

function toggleVisibleIconButton() {

  let target = document.getElementsByClassName("toggle-display-icon");

  Object.keys(target).forEach(name => {

    setTargetEvent(target[name].id + "-toggle-span", {

      click: e => {

        let icon = document.getElementsByClassName(target[name].id + "-toggle-icon");

        Object.keys(icon).forEach(key => {

          if (icon[key].style.display) {

            icon[key].style.display = ""

          } else {

            icon[key].style.display = "none"

          }

        })

        if (target[name].style.display) {

          target[name].style.display = ""

          let editor = document.querySelectorAll(".CodeMirror")

          if (editor) {

            Object.keys(editor).forEach(key => {

              editor[key].CodeMirror.refresh()

              editor[key].CodeMirror.focus()

            })

          }

        } else {

          target[name].style.display = "none"

        }

      }

    })

  })

}

// draggeble list helper

function setOptionList(list, target, func, add) {

  if (list && target && func) {

    let elm = typeof (target) == "string" || target instanceof String ? document.getElementById(target) : target;

    if (elm) {

      if (!add) {

        while (elm.firstChild) {

          elm.removeChild(elm.firstChild);

        }

      }

      func = func ? func : listItemElement

      list.forEach(val => {

        elm.appendChild(addListItem(val, target, func));

      });

    }

  }

}

function setListItemButtons() {

  let lists = document.getElementsByClassName("append-list");

  Object.keys(lists).forEach(key => {

    setTargetEvent(lists[key].id + "-button", {

      click: e => {

        appendTargetChild(lists[key], addListItem("", lists[key].id))

      }

    })

  })

}

function addListItem(val, listName, func) {

  return addDnDHandlers(

    createElement({

      li: {

        draggable: "true"

      }

    },

      func(val, listName),

      createIcon("cancel", {

        i: {

          style: "font-size:13px"

        },

        span: {

          class: "iconButton",

          style: "margin-left: 3px;"

        }

      },

        {
          click: event => {

            let remove = event.target.parentNode.parentNode;

            if (remove.tagName == "LI") {

              remove.parentNode.removeChild(remove);

            }

          }
        })

    )

  );

}


function listItemElement(val, listName) {

  let elm = createElement({

    input: {

      className: "list-item",

      name: listName.replace("-", "_"),

      value: val, style: "width:90%"

    }

  })

  return elm

}

// drag event

function addDnDHandlers(elem) {

  elem.addEventListener('dragstart', handleDragStart, false);

  elem.addEventListener('dragenter', handleDragEnter, false);

  elem.addEventListener('dragover', handleDragOver, false);

  elem.addEventListener('dragleave', handleDragLeave, false);

  elem.addEventListener('drop', handleDrop, false);

  elem.addEventListener('dragend', handleDragEnd, false);

  return elem;

}

function handleDragStart(e) {

  e.stopPropagation()

  e.dataTransfer.effectAllowed = 'move';

  this.classList.add("draged-item");

  this.style.opacity = "0.4";

  if ((this.children[1].tagName == "UL" || this.children[1].tagName == "OL") && this.children[1].children.length > 0) {

    targetChildMark(this.children[1].children)

  }

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

function handleDragEnter(e) {

}

function handleDragOver(e) {

  e.stopPropagation()

  if (e.preventDefault) {

    e.preventDefault();

  }

  if (!this.classList.contains("draged-item") && !this.classList.contains("draged-item-child") && (this.parentNode.tagName == "OL" || this.parentNode.tagName == "UL")) {

    this.style.borderTop = "2px solid green";

  }

  e.dataTransfer.dropEffect = 'move';

  return false;

}

function handleDragLeave(e) {

  //e.stopPropagation()

  this.style.borderTop = "";


}

function handleDrop(e) {

  e.stopPropagation();

  var elm = document.getElementsByClassName("draged-item")[0];

  if (this != elm && !this.classList.contains("draged-item") && !this.classList.contains("draged-item-child") && (this.parentNode.tagName == "OL" || this.parentNode.tagName == "UL")) {

    elm.parentNode.removeChild(elm);

    this.insertAdjacentElement('beforebegin', elm);

    this.style.borderTop = "";

  }

  return false;

}

function handleDragEnd(e) {

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

}
