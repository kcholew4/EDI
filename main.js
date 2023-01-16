/**
 * Funckcja, która pobiera dane z API mocaroo a następnie je zwraca.
 * Kazdy element zwróconej tablicy jest wierszem w tabeli.
 * @returns {Array} Tablica zawierająca dane pobrane z API
 */
const fetchData = async (source) => {
  //Tutaj wysyłanie jest zapytanie do API (dane są pobierane z pliku JSON)
  let response = await fetch(source);

  //Zamiana obiektu Response na text
  const text = await response.text();

  try {
    //Zamiana tekstu, który jest w formacie json na tablice z obiektami javascriptu
    const data = JSON.parse(text);

    return data;
  } catch (e) {
    //Czasami API mocaroo zamiast json zwraca csv (??)
    //W takim wypadku poczekaj 0.5 s. i odswiez strone
    setTimeout(() => location.reload(), 500);
  }
};

/**
 * Funkcja, która rysuje tabele
 * @param {Array} data Tablica zawierająca dane pobrane z API
 */
const drawTable = (data) => {
  //Element w którym znajdą się nazwy kolumn
  const tableHead = document.querySelector("#table-head");
  //Element w którym znajdzie sie zawartośc tabeli
  const tableBody = document.querySelector("#table-body");

  //Bierzemy nazwy kolumn i umieszczamy je w zmiennej keys
  const keys = Object.keys(data[0]);

  //Iterujemy po kazdej nazwie kolumn i dołączamy ją do nagłówku tabeli
  for (const key of keys) {
    //Tworzymy element <th> w którym znajdzie się nazwa kolumny
    const th = document.createElement("th");
    //Umieszczamy w elemencie <th> nazwe kolumny
    th.innerHTML = key;
    //Umieszczamy stworzony element <th> w #table-head
    tableHead.appendChild(th);
  }

  //Iterujemy po kazdym elemencie data czyli wierszu tabeli
  for (const row of data) {
    //Tworzymy element <tr> czyli table row
    const tr = document.createElement("tr");

    //Iterujemy po wartościach obiektu row czyli komórkach
    for (const value of Object.values(row)) {
      //Tworzymy element <td> czyli table data
      const td = document.createElement("td");
      //Umieszamy w elemencie <td> zawartość komórki
      td.innerHTML = value;
      //Umieszczamy stworzony element <td> w wcześniej stworzonym elemencie <tr>
      tr.appendChild(td);
    }

    //Umieszczamy stworzony element <tr> w #table-body
    tableBody.appendChild(tr);
  }

  //Zwraca funkcję, która czyści tabelę - przydatne gdy się kliknie w przycisk zmiany zrodla danych
  return () => {
    tableBody.innerHTML = "";
    tableHead.innerHTML = "";
  };
};

/**
 * Funkcja zwracająca config do biblioteki chart.js
 * @param {string} type Typ wykresu
 * @param {string} label Nazwa wykresu
 * @param {Map} map Obiekt zawierajacy dane do wykresu
 * @returns {Object} Config potrzebny do narysowania wykresu
 */
const createChartConfig = (type, label, map) => {
  //Obiekt zawierający config
  const config = {
    type,
    data: {
      labels: [...map.keys()],
      datasets: [
        {
          label,
          data: [...map.values()],
        },
      ],
    },
  };

  //W zalezności od typu wykresu dodajemy wartości do configu
  if (type === "pie") {
    config.data.datasets[0].hoverOffset = 4;
  } else if (type === "bar") {
    config.data.datasets[0].borderWidth = 1;
    config.options = {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };
  }

  return config;
};

/**
 * Funkcja renderująca wykres z państwami
 * @param {Array} data Tablica zawierająca dane pobrane z API
 */
const drawCountriesChart = (data) => {
  //Zmienna countries zawiera zbiór elementów typu: klucz - wartość
  //Klucz to nazwa państwa, wartość to liczba graczy
  const countries = new Map();

  //Iterujemy po kazdym elemencie tablicy data czyli po kazdym wierszu tabeli
  data.forEach((element) => {
    //Bierzemy nazwe panstwa z ktorego jest gracz
    const label = element.country;

    //Jezeli countries juz zawiera element o kluczu, ktorym jest nazwa panstwa...
    if (countries.has(label)) {
      //Zwiększamy liczbe graczy z tego państwa o 1
      countries.set(label, countries.get(label) + 1);
    } else {
      //W przeciwnym wypadku ustalamy liczbe graczy z tego państwa na 1
      countries.set(label, 1);
    }
  });

  //Bierzemy element w ktorym ma zostac narysowany wykres
  const ctx = document.getElementById("countries-chart");
  //Tworzymy config
  const config = createChartConfig("bar", "# of players", countries);
  //I rysujemy wykres
  return new Chart(ctx, config);
};

/**
 * Funkcja renderująca wykres z graczami wg. płci
 * @param {Array} data Tablica zawierająca dane pobrane z API
 */
const drawGenderChart = (data) => {
  //Zmienna genders zawiera zbiór elementów typu: klucz - wartość
  //Klucz to nazwa płci, wartość to liczba graczy
  const genders = new Map();

  //Iterujemy po kazdym wierszu tabeli
  data.forEach((element) => {
    //Bierzemy nazwe płci jakiej jest gracz
    const label = element.gender;

    //Jezeli genders juz zawiera element o kluczu, ktorym jest nazwa płci...
    if (genders.has(label)) {
      //Zwiększamy liczbe graczy z tą płcią o 1
      genders.set(label, genders.get(label) + 1);
    } else {
      //W przeciwnym wypadku ustalamy liczbe graczy z tą płcią na 1
      genders.set(label, 1);
    }
  });

  //Bierzemy element, tworzymy config i rysujemy wykres
  const ctx = document.getElementById("gender-chart");
  const config = createChartConfig("pie", "Players gender", genders);
  return new Chart(ctx, config);
};

/**
 * Funkcja renderująca wykres z playtime wg. płci
 * @param {Array} data Tablica zawierająca dane pobrane z API
 */
const drawPlayTimeChart = (data) => {
  //Zmienna playtime zawiera zbiór elementów typu: klucz - wartość
  //Klucz to nazwa płci, wartość to playtime
  const playtime = new Map();

  //Iterujemy po kazdym wierszu tabeli
  data.forEach((element) => {
    //Bierzemy nazwe płci jakiej jest gracz
    const label = element.gender;
    //Klucz to playtime, tylko trzeba usunąć "h" na końcu
    const key = +element.playtime.slice(0, -1);

    //Jezeli playtime juz zawiera element o kluczu, ktorym jest nazwa płci...
    if (playtime.has(label)) {
      //Zwiększamy całkowity playtime o playtime gracza
      playtime.set(label, playtime.get(label) + key);
    } else {
      //W przeciwnym wypadku ustalamy całkowity playtime na playtime gracza
      playtime.set(label, key);
    }
  });

  //Bierzemy element, tworzymy config i rysujemy wykres
  const ctx = document.getElementById("playtime-chart");
  const config = createChartConfig("pie", "Playtime by gender", playtime);
  return new Chart(ctx, config);
};

const showData = async (source) => {
  //Wywolujemy funcje ktora zwraca dane pobrane z API i zapisujemy je w zmiennej
  //await - czyli czekamy az dane zostana pobrane z API
  const data = await fetchData(source);

  //Renderujemy tabele, cleanTable to funkcja która czyści tabele
  const clearTable = drawTable(data);

  //Renderujemy wykresy
  const charts = [drawCountriesChart(data), drawGenderChart(data), drawPlayTimeChart(data)];

  //Zwraca funkcję która czyści tabele i wykresy
  return () => {
    charts.forEach((chart) => chart.destroy());
    clearTable();
  };
};

const sourceButtons = document.querySelectorAll(".source-btn");

let clearData = await showData("EDI.json");

sourceButtons.forEach((button) => {
  button.addEventListener("click", async (event) => {
    clearData();
    //event.target.dataset.source to atrybut data-source w buttonie w html
    clearData = await showData(event.target.dataset.source);
  });
});
