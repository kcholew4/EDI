function x(){
fetch('https://my.api.mockaroo.com/edi.json?key=08ed3400').then(response => response.json()).then(data => createTable(data)).catch(error=>console.log(error))

    const createTable = (data) => {
    const tableData = data;
        
    const headerData = Object.keys(tableData[0]);

    const table = document.getElementById('tablica');

    const tr = table.insertRow(-1);

    for(let i=0; i<headerData.length; i++){
        const th = document.createElement('th');
        th.innerHTML = headerData[i];
        tr.appendChild(th)
    }

    for(let i=0; i<tableData.length; i++){
        const tr = table.insertRow(-1);
            const obj = tableData[i];
        for(let key in obj) {
            const td = document.createElement('td');
        td.innerHTML = obj[key];
        tr.appendChild(td);
        }
    }

      document.body.appendChild(table);
    }
}