const UrlData = "./data/data.json";
const body = document.querySelector("body");
const divForTable = document.querySelector(".divForTable");
const config = {
  //обьект для всяких настроек
  columnsName: ["Имя", "Фамилия", "Описание", "Цвет глаз"], //все названия колонок
  exclusion: ["id", "phone"], //что не нужно выводить из файла
  columns: ["firstName", "lastName", "about", "eyeColor"], //название свойств обьеков в json не должны повтарятся, даже внутри разных обьектов!!
  pageNow: 0, //чтобы при удалении или добавлении столбцов страница сохранялась
  arrData: [], //
};

const readJson = (UrlJson) => {
  // запрос файла
  fetch(UrlJson)
    .then((response) => {
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    })
    .then((json) => {
      config.arrData = json.map((elem) => elem);
      createTable(config.arrData);
      //после удачного запроса запускается функция с прорисовкой таблицы
      createButtonChangePage(divForTable);
      createButtonChangeColumns(divForTable);
    })
    .catch(function () {
      this.dataError = true;
    });
};

const createLine = (location, obj) => {
  //фунция по созданию строки в уже созданной таблице
  let tr = document.createElement("tr");
  tr.addEventListener("click", () => createForm(obj));
  getProp(obj);
  function getProp(o) {
    // рекурсивная функция для перебора вложенностей обьекта
    for (let prop in o) {
      if (typeof o[prop] === "object") {
        getProp(o[prop]);
      } else {
        if (config.exclusion.indexOf(prop) !== -1) {
          //исключение , чтобы не выводить id в таблиццу
          continue;
        }
        let td = document.createElement("td");
        if (prop === "eyeColor") {
          td.style.backgroundColor = o[prop];
        } else {
          td.textContent = o[prop];
        }
        td.setAttribute("class", prop);
        tr.append(td);
      }
    }
  }
  location.appendChild(tr);
};

const createTable = () => {
  //функция по создани таблицы
  let table = document.createElement("table"); //создаем таблицу
  table.setAttribute("class", "content"); // даём таблице класс content
  divForTable.prepend(table); //добавляем таблицу в файл
  let thead = document.createElement("thead"); //создаем заголовок

  let columnsName = document.createElement("tr");
  let tbody = document.createElement("tbody"); //создаем тело таблицы

  for (let key of config.columnsName) {
    if (
      config.exclusion.indexOf(
        config.columns[config.columnsName.indexOf(key)]
      ) !== -1
    ) {
      continue;
    }
    let td = document.createElement("td");
    td.textContent = key;
    td.addEventListener("click", () => {
      sortedRows(config.columns[config.columnsName.indexOf(key)]);
      let table = document.querySelector("table");
      table.remove();
      config.pageNow = 0;
      createTable();
    });
    columnsName.appendChild(td);
  }

  thead.appendChild(columnsName);
  table.appendChild(thead); //добавляем заголовок таблицы
  table.appendChild(tbody);
  createPage(arrChunk(config.arrData, 10)[config.pageNow], tbody);

  // createButtonChangePage(json, divForTable);
};

readJson(UrlData); //запуск постройки таблицы

function sortedRows(columnName) {
  function getPath(object, key) {
    let path = [];
    function iter(o, p) {
      if (typeof o === "object") {
        return Object.keys(o).some(function (k) {
          return iter(o[k], p.concat(k));
        });
      }
      if (p[p.length - 1] === key) {
        path = p;
        return true;
      }
    }

    iter(object, []);
    return path;
  }

  let path = getPath(config.arrData[0], columnName); //узкое место, тут преполагаеи что обьекты в json файле одинаковы

  config.arrData.sort((objA, objB) => {
    let a = path.reduce(
      (sumObj, currentValue) => (sumObj = sumObj[currentValue]),
      objA
    );
    let b = path.reduce(
      (sumObj, currentValue) => (sumObj = sumObj[currentValue]),
      objB
    );
    return a.localeCompare(b);
  });
}

function createForm(person) {
  // if (!document.querySelectorAll("form").length) {
  //   body.insertAdjacentHTML(
  //     "beforeend",
  //     `<div class="change-content ">
  //     <form action="/" method="POST" name="${person.id}" >
  //       <label for="firstName">Изменить имя:</label><br>
  //       <input type="text" id="firstName" name="firstName" ><br>
  //       <label for="lastName">Изменить фамилию:</label><br>
  //       <input type="text" id="lastName" name="lastName" ><br>
  //       <label for="about">Изменить описание:</label><br>
  //       <textarea name="about" id="about" cols="40" rows="12" ></textarea><br>
  //       <label for="eyeColor">Изменить цвет глаз):</label><br>
  //       <input type="text" id="eyeColor" name="eyeColor" ><br>
  //     <button>Submit</button>
  //     </form>
  //     <button>Закрыть форму</button>
  //   </div></div>`
  //   );
  // }
}

function arrChunk(arr, chunk) {
  let res = [];
  for (let i = 0; i < arr.length; i += chunk) {
    res.push(arr.slice(i, i + chunk));
  }
  return res;
}

function createPage(arr) {
  let tb = document.querySelector("tbody");
  if (tb.querySelectorAll("tr").length) {
    for (key of tb.querySelectorAll("tr")) {
      key.remove();
    }
  }

  for (let key of arr) {
    createLine(tb, key);
  }
}

function createButtonChangePage(location) {
  let tbody = document.querySelector("tbody");
  const ChangePage = document.createElement("div");
  ChangePage.setAttribute("class", "divChangePage");
  location.appendChild(ChangePage);
  for (let i = 0; i < arrChunk(config.arrData, 10).length; i++) {
    let btn = document.createElement("button");
    btn.setAttribute("class", `btn${i + 1}`);
    btn.textContent = i + 1;
    btn.addEventListener("click", () => {
      config.pageNow = i;
      createPage(arrChunk(config.arrData, 10)[i], tbody);
    });
    ChangePage.appendChild(btn);
  }
}

function createButtonChangeColumns(location) {
  //функция для показа скрытия колонок(и создает сами кнопки)
  const сhangeColumns = document.createElement("div");
  сhangeColumns.setAttribute("class", "divChangeColumns");
  location.appendChild(сhangeColumns);
  let i = 0;
  for (let key of config.columnsName) {
    let btn = document.createElement("button");
    btn.textContent = key;
    btn.addEventListener("click", () => {
      if (
        config.exclusion.indexOf(
          config.columns[config.columnsName.indexOf(key)]
        ) === -1
      ) {
        config.exclusion.push(config.columns[config.columnsName.indexOf(key)]);
      } else {
        config.exclusion.splice(
          config.exclusion.indexOf(
            config.columns[config.columnsName.indexOf(key)]
          ),
          1
        );
      }
      let table = document.querySelector("table");
      table.remove();
      createTable();
    });
    сhangeColumns.appendChild(btn);
    i++;
  }
}
