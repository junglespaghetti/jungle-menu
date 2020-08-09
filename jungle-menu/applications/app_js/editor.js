/*jshint esversion: 6 */

window.addEventListener('load', () => {

  editor = CodeMirror.fromTextArea(document.getElementById("content-cssEdit"),

    {

      mode: "javascript",

      lineNumbers: true,// 行番号を表示する

      theme: "paraiso-light",

      lineWrapping: true,// 行を折り返す

      autorefresh: true,

      gutters: ["CodeMirror-lint-markers"],

      autoCloseBrackets: true,

      lint: true,

      extraKeys: {

        "Ctrl-.": "autocomplete",

        "Ctrl-E": function (cm) { CodeMirror.commands.autocomplete(cm); },

      }

    });

  setTargetEvent("open-file", {

    click: async e => {

      let file = await fileUpLoader('.*,text/plain')

      alert(JSON.stringify(file.content))

    }

  })

  setEditorSize()

})


function setEditorSize() {

  window.addEventListener("resize", event => {

    let editors = document.querySelectorAll(".CodeMirror")

    Object.keys(editors).forEach(key => {

      editors[key].CodeMirror.setSize("100%", "100%")

      let footer = document.querySelectorAll("#footer-contents")[0]

      footer.innerHTML = window.innerHeight

    })

  })

}

