const startBtn = document.querySelector("#startGame");
const WIDTH = 6;
const HEIGHT = 5;
let categories = [];

/** Get NUM_CATEGORIES random category from API.
 * Returns array of category ids
 */
const getCategoryIds = () => {
  let randomNum = Math.round(Math.random() * 100);
  const res = axios.get(
    `https://jservice.io/api/categories?count=${WIDTH}&offset=${randomNum}`
  );
  return Promise.resolve(res).then((categories) => {
    return categories.data.map((category) => category.id);
  });
};

/** Return object with data about a category:
 *  Returns { title: "Math", clues: clue-array }
 */
const getCategory = (catId) => {
  const result = axios.get(`https://jservice.io/api/clues?category=${catId}`);
  return Promise.resolve(result).then(({ data }) => {
    let clues;
    if (data.length > 5) {
      // (data.length - HEIGHT) to make sure # does not exceed data.length
      let randomNum = Math.round(Math.random() * (data.length - HEIGHT));
      // start at randomNum, add HEIGHT to randomNum for desired # data
      clues = data.slice(randomNum, randomNum + HEIGHT); // random data
    } else {
      clues = data;
    }
    hideLoadingView(); // only place that works
    return { title: clues[0].category.title, clues };
  });
};

/** Fill the HTML table#jeopardy with the categories & cells for questions. */
const fillTable = (categories) => {
  // showLoadingView();
  const thead = document.querySelector("thead tr");
  const tbody = document.querySelector("tbody");
  let count = 0;

  for (const [index, category] of categories.entries()) {
    const th = document.createElement("th");
    const tr = document.createElement("tr");

    th.innerText = category.title;
    thead.append(th);

    let i = 0;
    while (i < WIDTH) {
      const question = categories[i].clues[count].question;
      const answer = categories[i].clues[count].answer;

      const td = document.createElement("td");
      td.innerText = "?";
      td.setAttribute("data-question", question);
      td.setAttribute("data-answer", answer);
      tr.appendChild(td);
      i++;
    }

    // 1 less row as cats are = to HEIGHT(5)
    if (index < HEIGHT) {
      tbody.append(tr);
      count++;
    }
  }

  // hideLoadingView(); // not working
};

/** Handle clicking on a clue: show the question or answer. */
const handleClick = (evt) => {
  const el = evt.target;
  if (el.classList.contains("question")) {
    el.classList.remove("question");
    el.innerText = el.dataset.answer;
    el.classList.add("answer");
  } else if (el.classList.contains("answer")) {
    return;
  } else {
    el.innerText = el.dataset.question;
    el.classList.add("question");
  }
};

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */
const showLoadingView = () => {
  document.querySelector("button").innerText = "Loading...";
  document.querySelector("i").classList.remove("hide");
  document.querySelector("thead tr").innerHTML = "";
  document.querySelector("tbody").innerHTML = "";
};

/** Remove the loading spinner and update the button used to fetch data. */
const hideLoadingView = () => {
  document.querySelector("button").innerText = "Restart";
  document.querySelector("i").classList.add("hide");
};

/** Start game */
const setupAndStart = async () => {
  const categoryIds = await getCategoryIds();

  const categories = [];
  for (const categoryId of categoryIds) {
    const category = await getCategory(categoryId);
    categories.push(category);
  }

  await fillTable(categories);

  // await hideLoadingView(); // not working
};

/** On click of start / restart button, set up game. */
startBtn.addEventListener("click", () => {
  showLoadingView();
  setupAndStart();
  // hideLoadingView(); // not working
});

/** On page load, add event handler for clicking clues */
document.addEventListener("DOMContentLoaded", () => {
  const board = document.querySelector("#board");
  board.addEventListener("click", (evt) => {
    if (evt.target.tagName == "TD") handleClick(evt);
  });
});
