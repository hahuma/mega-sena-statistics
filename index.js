import { mkdir, writeFile } from "node:fs/promises";
import megaDaViradaFrequencies from "./megaDaViradaNumbers.json" assert { type: "json" };
import path from "node:path";

async function fetchData() {
  const data = await fetch(
    "https://loteriascaixa-api.herokuapp.com/api/megasena"
  );

  console.log(
    await (await fetch("https://loteriascaixa-api.herokuapp.com/api")).json()
  );

  /**
   * @type array
   */
  const jsonResonse = await data.json();

  /**
   * @type array<string[]>
   */
  const winningNumbers = jsonResonse.map((data) => [
    ...data.dezenasOrdemSorteio,
  ]);

  return winningNumbers.reduce(
    (accum, curr) => {
      curr.forEach((value) => {
        accum[+value] = (accum[+value] || 0) + 1;
      });

      return accum;
    },
    { ...megaDaViradaFrequencies }
  );
}

const saveData = async (data) => {
  const dirPath = path.join(".", "calls");
  const filePath = path.join(dirPath, `data-${Date.now()}.json`);

  await mkdir(dirPath, { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 4), {
    encoding: "utf-8",
  });
  console.log(`Dados salvos em ${filePath}`);
};

function order(obj, sortType = "keys") {
  const sortedEntries = Object.entries(obj).sort((a, b) => {
    if (sortType === "keys") {
      return b[0] - a[0];
    }
    if (sortType === "values") {
      return b[1] - a[1];
    }
  });

  let sortedObj = {};

  if (sortType === "keys") {
    sortedEntries.forEach((entry) => {
      sortedObj[+entry[0]] = entry[1];
    });
  }

  if (sortType === "values") {
    sortedEntries.forEach((entry) => {
      sortedObj[entry[1]] = entry[0];
    });
  }

  return sortedObj;
}

try {
  const data = await fetchData();
  const ordenedDataByKeys = order(data);
  const ordenedDataByValues = order(data, "values");

  await saveData({
    ordenedDataByKeys,
    ordenedDataByValues,
  });
} catch (err) {
  console.error(err);
}
