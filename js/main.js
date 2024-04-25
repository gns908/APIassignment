let targetURL = new URL('https://newsapi.org/v2/top-headlines?');

const selectedOption = document.querySelector('#selectedOption');
const qInput = document.querySelector('.qInput');
const pageSizeInput = document.querySelector('.pageSizeInput');
const searchButton = document.querySelector('.searchButton');
const summarySpan = document.querySelector('main .summary span');
const summaryinputStatus = document.querySelector('main .summary .inputStatus');
const summarymessage = document.querySelector('main .summary .message');

const pagination = document.querySelectorAll('.pagination');
const maxPage = document.querySelectorAll('.pagination span');

const firstbutton = document.querySelectorAll('.firstbutton');
const prevbutton = document.querySelectorAll('.prevbutton');
const pageinput = document.querySelectorAll('.pageinput');
const nextbutton = document.querySelectorAll('.nextbutton');
const lastbutton = document.querySelectorAll('.lastbutton');

const items = document.querySelector('.items');

const keys = [
  '1feed83e7d584c02b087162156455bfc',
  'c3235c33e294408fbdbb2375586a17bb',
];

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

let TestMode = false;

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
  targetURL.searchParams.append('q', q);
  targetURL.searchParams.append('pageSize', pageSize);
  targetURL.searchParams.append('page', '1');
  targetURL.searchParams.append('apiKey', '');

  firstCallStatus = true;

  currentpage = 1;

  await fetchFunction();
}

async function fetchFunction() {
  let response;
  let data;

  outer: for (let i = 0; i < keys.length; i++) {
    targetURL.searchParams.set('apiKey', keys[i]);

    for (let j = 0; j < 3; j++) {
      try {
        response = await fetch(targetURL);

        if (!response.ok) {
          if (response.status === 400) {
            throw new Error(
              'The request was unacceptable, often due to a missing or misconfigured parameter.'
            );
          } else if (response.status === 401) {
            throw new Error(
              'Your API key was missing from the request, or wasnt correct.'
            );
          } else if (response.status === 429) {
            throw new Error(
              'You made too many requests within a window of time and have been rate limited. Back off for a while.'
            );
          } else if (response.status === 500) {
            throw new Error('Something went wrong on our side.');
          } else {
            throw new Error('미정의 에러');
          }
        }

        break outer;
      } catch (error) {
        console.error(
          'There has been a problem with your fetch operation: ',
          error
        );
        if (
          response.status === 400 ||
          response.status === 401 ||
          response.status === 429
        ) {
          break;
        }
      }
    }
  }

  data = await response.json();

  summarySpan.innerText = `현재 상태 : ${data.status}`;

  summaryinputStatus.innerHTML = `category : ${category}`;
  if (q === '') {
    summaryinputStatus.innerHTML += `<br />q : 없음`;
  } else {
    summaryinputStatus.innerHTML += `<br />q : ${q}`;
  }
  summaryinputStatus.innerHTML += `<br />pageSize : ${pageSize}`;

  summarymessage.innerHTML = '';

  if (data.status === 'error') {
    summarymessage.innerHTML += `${data.message}`;
    items.innerHTML = '';
    pagination.forEach((item) => {
      item.style.display = 'none';
    });
  } else if (data.totalResults === 0) {
    summarymessage.innerHTML += `검색 조건에 맞는 기사가 없습니다.`;
    items.innerHTML = '';
    pagination.forEach((item) => {
      item.style.display = 'none';
    });
  } else {
    totalResults = data.totalResults;

    summarymessage.innerHTML += `${totalResults}건의 기사가 검색되었습니다.<br />기사를 클릭 시 출처가 새 탭에서 열립니다.`;

    items.innerHTML = data.articles
      .map((item) => {
        return createHTML(item);
      })
      .join('');
    pagination.forEach((item) => {
      item.style.display = 'block';
    });

    document.querySelector('.summary').scrollIntoView({ behavior: 'smooth' });

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
  if (page >= firstpage && page <= lastpage && page != currentpage) {
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
    pageinput.forEach((item) => {
      item.value = currentpage;
    });
    maxPage.forEach((item) => {
      item.textContent = lastpage;
    });
  }
}

async function pageButton(Class, position) {
  let page;
  switch (Class) {
    case 'firstbutton':
      page = firstpage;
      break;
    case 'prevbutton':
      page = prevpage;
      break;
    case 'nextbutton':
      page = nextpage;
      break;
    case 'lastbutton':
      page = lastpage;
      break;
  }
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

  pageinput.forEach((item) => {
    item.value = currentpage;
  });
  maxPage.forEach((item) => {
    item.textContent = lastpage;
  });

  disabledButton(firstbutton);
  disabledButton(prevbutton);

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
  prevpage = currentpage - 1;

  nextpage = Number(currentpage) + 1;

  pageinput.forEach((item) => {
    item.value = currentpage;
  });
  maxPage.forEach((item) => {
    item.textContent = lastpage;
  });

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
  button.forEach((item) => {
    item.removeAttribute('disabled');
  });
}

function disabledButton(button) {
  button.forEach((item) => {
    item.setAttribute('disabled', '');
  });
}

function Gototop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

let keysPressed = {};

document.addEventListener('keydown', (event) => {
  keysPressed[event.key] = true;
  if (keysPressed['t'] && keysPressed['e'] && keysPressed['s']) {
    testToggle();
  }
});

document.addEventListener('keyup', (event) => {
  delete keysPressed[event.key];
});

function testToggle() {
  if (TestMode) {
    TestMode = false;
    document.querySelector('.test').textContent = '';
  } else {
    TestMode = true;
    document.querySelector('.test').textContent = 'TestMode';
  }
}
