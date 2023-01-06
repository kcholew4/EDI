const fetchData = async () => {
  const response = await fetch("https://my.api.mockaroo.com/edi.json?key=08ed3400");

  const text = await response.text();

  const data = JSON.parse(text);

  return data;
};

function drawTable(data) {
  const tableHead = document.querySelector("#table-head");
  const tableBody = document.querySelector("#table-body");

  const keys = Object.keys(data[0]);

  for (const key of keys) {
    const th = document.createElement("th");
    th.innerHTML = key;
    tableHead.appendChild(th);
  }

  for (const row of data) {
    const tr = document.createElement("tr");

    for (const value of Object.values(row)) {
      const td = document.createElement("td");
      td.innerHTML = value;
      tr.appendChild(td);
    }

    tableBody.appendChild(tr);
  }
}

const createChartConfig = (type, label, map) => {
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

const drawCountriesChart = (data) => {
  const countries = new Map();

  data.forEach((element) => {
    const label = element.country;

    if (countries.has(label)) {
      countries.set(label, countries.get(label) + 1);
    } else {
      countries.set(label, 1);
    }
  });

  const ctx = document.getElementById("countries-chart");

  const config = createChartConfig("bar", "# of players", countries);

  new Chart(ctx, config);
};

const drawGenderChart = (data) => {
  const genders = new Map();

  data.forEach((element) => {
    const label = element.gender;

    if (genders.has(label)) {
      genders.set(label, genders.get(label) + 1);
    } else {
      genders.set(label, 1);
    }
  });

  const ctx = document.getElementById("gender-chart");

  const config = createChartConfig("pie", "Players gender", genders);

  new Chart(ctx, config);
};

const drawPlayTimeChart = (data) => {
  const playtime = new Map();

  data.forEach((element) => {
    const label = element.gender;
    const key = +element.playtime.slice(0, -1);

    if (playtime.has(label)) {
      playtime.set(label, playtime.get(label) + key);
    } else {
      playtime.set(label, key);
    }
  });

  const ctx = document.getElementById("playtime-chart");

  const config = createChartConfig("pie", "Playtime by gender", playtime);

  new Chart(ctx, config);
};

const data = await fetchData();

drawTable(data);

drawCountriesChart(data);
drawGenderChart(data);
drawPlayTimeChart(data);
