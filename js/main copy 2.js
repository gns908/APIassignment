let targetURL = new URL('https://newsapi.org/v2/top-headlines?');

const selectedOption = document.querySelector('#selectedOption');
const qInput = document.querySelector('.qInput');
const pageSizeInput = document.querySelector('.pageSizeInput');
const searchButton = document.querySelector('.searchButton');
const summarySpan = document.querySelector('main .summary span');
const summaryP = document.querySelector('main .summary p');

// const pagination = document.querySelector('.pagination');
const pagination = document.querySelectorAll('.pagination');

// const firstbutton = document.querySelector('.firstbutton');
// const prevbutton = document.querySelector('.prevbutton');
// const pageinput = document.querySelector('.pageinput');
// const nextbutton = document.querySelector('.nextbutton');
// const lastbutton = document.querySelector('.lastbutton');

const firstbutton = document.querySelectorAll('.firstbutton');
const prevbutton = document.querySelectorAll('.prevbutton');
const pageinput = document.querySelectorAll('.pageinput');
const nextbutton = document.querySelectorAll('.nextbutton');
const lastbutton = document.querySelectorAll('.lastbutton');

const items = document.querySelector('.items');

let category;
let q;
let pageSize;

let totalResults;

let currentpage;

let firstpage;
let prevpage;
let nextpage;
let lastpage;

let firstCallStatus = true;

let Bottom = false;

searchButton.addEventListener('click', () => {
  firstCall();
});

async function firstCall() {
  category = selectedOption.textContent;
  q = qInput.value;
  pageSize = pageSizeInput.value;

  targetURL = new URL('https://newsapi.org/v2/top-headlines?');
  targetURL.searchParams.append('country', 'kr');
  targetURL.searchParams.append('category', category);
  // targetURL.searchParams.append('sources', '');
  targetURL.searchParams.append('q', q);
  targetURL.searchParams.append('pageSize', pageSize);
  targetURL.searchParams.append('page', '1');
  // targetURL.searchParams.append('page', '1');
  targetURL.searchParams.append('apiKey', '1feed83e7d584c02b087162156455bfc');
  // targetURL.searchParams.append('apiKey', '');

  firstCallStatus = true;

  currentpage = 1;

  await fetchFunction();
}

async function fetchFunction() {
  const response = await fetch(targetURL);
  const data = await response.json();

  let before = 0;
  let after = 0;

  if (Bottom) {
    before = pageinput[1].getBoundingClientRect().top;
  }

  summarySpan.innerText = `현재 상태 : ${data.status}`;

  summaryP.innerHTML = `category : ${category}`;
  if (q === '') {
    summaryP.innerHTML += `<br />q : 없음`;
  } else {
    summaryP.innerHTML += `<br />q : ${q}`;
  }
  summaryP.innerHTML += `<br />pageSize : ${pageSize}`;

  if (data.status === 'error') {
    summaryP.innerHTML += `<br /><br />${data.message}`;
    items.innerHTML = '';
    // pagination.style.display = 'none';
    pagination.forEach((item) => {
      item.style.display = 'none';
    });
  } else if (data.totalResults === 0) {
    summaryP.innerHTML += `<br /><br />검색 조건에 맞는 기사가 없습니다.`;
    items.innerHTML = '';
    // pagination.style.display = 'none';
    pagination.forEach((item) => {
      item.style.display = 'none';
    });
  } else {
    totalResults = data.totalResults;

    summaryP.innerHTML += `<br /><br />${totalResults}건의 기사가 검색되었습니다.<br />기사를 클릭 시 출처가 새 탭에서 열립니다.`;

    items.innerHTML = data.articles
      .map((item) => {
        return createHTML(item);
      })
      .join('');
    // pagination.style.display = 'block';
    pagination.forEach((item) => {
      item.style.display = 'block';
    });

    if (Bottom) {
      after = pageinput[1].getBoundingClientRect().top;
      window.scrollBy(0, after - before);
    }

    if (firstCallStatus) {
      firstpageopen();
    } else {
      pageChange();
    }
  }
}

function createHTML(item) {
  let urlToImage = item.urlToImage ? item.urlToImage : '../img/noimg.png';
  let publishedAt = item.publishedAt
    ? new Date(item.publishedAt).toISOString().slice(0, 10)
    : '';

  return `<li class="item">
  <div class="imgArea">
    <img src="${urlToImage}" alt="" />
  </div>
  <span class="sourceName">${item.source.name}</span>
  <div class="sub">
    <span class="author">${item.author}</span>
    <span class="publishedAt">${publishedAt}</span>
  </div>
  <p class="title">
    ${item.title}
  </p>
  <p class="desc">
    ${item.description}
  </p>
  <a href="${item.url}" target="_blank"></a>
</li>`;
}

document.getElementById('dropdown').style.display = 'none';
document.getElementById('selectedOption').innerText = 'general';

function toggleDropdown(event) {
  event.stopPropagation();
  var dropdownContent = document.getElementById('dropdown');
  if (dropdownContent.style.display === 'none') {
    dropdownContent.style.display = 'block';
  } else {
    dropdownContent.style.display = 'none';
  }
}

function selectOption(value) {
  document.getElementById('selectedOption').innerText = value;
  document.getElementById('dropdown').style.display = 'none';
}

document.addEventListener('click', function (event) {
  var dropdownContent = document.getElementById('dropdown');
  dropdownContent.style.display = 'none';
});

async function pageJump(page, position) {
  if (page >= firstpage && page <= lastpage) {
    targetURL.searchParams.set('page', `${page}`);
    firstCallStatus = false;
    currentpage = page;
    if (position == 'bottom') {
      Bottom = true;
    } else {
      Bottom = false;
    }
    await fetchFunction();
  } else {
    // pageinput.value = currentpage;
    pageinput.forEach((item) => {
      item.value = currentpage;
    });
  }
}

async function pageButton(page, position) {
  targetURL.searchParams.set('page', `${page}`);
  firstCallStatus = false;
  currentpage = page;
  if (position == 'bottom') {
    Bottom = true;
  } else {
    Bottom = false;
  }
  await fetchFunction();
}

function firstpageopen() {
  firstpage = 1;
  prevpage = 0;
  currentpage = 1;
  nextpage = 2;
  lastpage = Math.ceil(totalResults / pageSize);

  // firstbutton.textContent = `${firstpage}`;
  firstbutton.forEach((item) => {
    item.textContent = `${firstpage}`;
  });
  // prevbutton.textContent = `${prevpage}`;
  prevbutton.forEach((item) => {
    item.textContent = `${prevpage}`;
  });
  // pageinput.value = `${currentpage}`;
  pageinput.forEach((item) => {
    item.value = currentpage;
  });
  // nextbutton.textContent = `${nextpage}`;
  nextbutton.forEach((item) => {
    item.textContent = `${nextpage}`;
  });
  // lastbutton.textContent = `${lastpage}`;
  lastbutton.forEach((item) => {
    item.textContent = `${lastpage}`;
  });

  disabledButton(firstbutton);
  disabledButton(prevbutton);
  // pageinput
  if (nextpage <= lastpage) {
    enabledButton(nextbutton);
  } else {
    disabledButton(nextbutton);
  }
  if (currentpage != lastpage) {
    enabledButton(lastbutton);
  } else {
    disabledButton(lastbutton);
  }
}

function pageChange() {
  // firstpage = 1;
  prevpage = currentpage - 1;
  // currentpage = 1;
  nextpage = Number(currentpage) + 1;
  // lastpage = Math.ceil(totalResults / pageSize);

  // firstbutton.textContent = `${firstpage}`;
  // prevbutton.textContent = `${prevpage}`;
  prevbutton.forEach((item) => {
    item.textContent = `${prevpage}`;
  });
  // pageinput.value = `${currentpage}`;
  pageinput.forEach((item) => {
    item.value = currentpage;
  });
  // nextbutton.textContent = `${nextpage}`;
  nextbutton.forEach((item) => {
    item.textContent = `${nextpage}`;
  });
  // lastbutton.textContent = `${lastpage}`;

  if (currentpage != firstpage) {
    enabledButton(firstbutton);
  } else {
    disabledButton(firstbutton);
  }
  if (currentpage != prevpage && prevpage != 0) {
    enabledButton(prevbutton);
  } else {
    disabledButton(prevbutton);
  }
  // pageinput
  if (currentpage != nextpage && nextpage <= lastpage) {
    enabledButton(nextbutton);
  } else {
    disabledButton(nextbutton);
  }
  if (currentpage != lastpage) {
    enabledButton(lastbutton);
  } else {
    disabledButton(lastbutton);
  }
}

function enabledButton(button) {
  // button.removeAttribute('disabled');
  // button.style.opacity = '1';
  button.forEach((item) => {
    item.removeAttribute('disabled');
    item.style.opacity = '1';
  });
}

function disabledButton(button) {
  // button.setAttribute('disabled', '');
  // button.style.opacity = '0';
  button.forEach((item) => {
    item.setAttribute('disabled', '');
    item.style.opacity = '0';
  });
}

function Gototop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

window.onscroll = function () {
  testFunction();
};

function testFunction() {
  // console.log('gogo');
  // document.body.scrollTop = document.body.scrollHeight;
  // document.documentElement.scrollTop = document.documentElement.scrollHeight;
  document.querySelector('.test').textContent = `
  ${document.body.scrollHeight}
  ${document.documentElement.scrollHeight}
  상대 위치 ${pageinput[1].getBoundingClientRect().top}
  스크롤 위치 ${window.scrollY}
  `;
}