import { printLine } from './modules/print';
import { debounce } from 'lodash';
import axios from 'axios';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");

const tooltip = document.createElement('div');
tooltip.className = 'search-extension-tooltip';
document.body.appendChild(tooltip);
const table = document.createElement('div');
table.className = 'table';
const thead = document.createElement('div');
thead.className = 'table-head';
const tbody = document.createElement('div');
tbody.className = 'table-body';
tooltip.appendChild(table);
table.appendChild(thead);
thead.innerHTML = `
    <div class="table-data">Journalist's Name</div>
    <div class="table-data">Media Name</div>
    <div class="table-data">To pitch?</div>
    <div class="table-data">Info:</div>
    <div class="table-data">Search citations</div>
  `;
table.appendChild(tbody);

const selectionChangeHandler = debounce(
  () => {
    const selection = window.getSelection();
    if (selection.rangeCount <= 0 || !selection.toString()) {
      tooltip.style.opacity = 0;
      return;
    }
    tbody.innerHTML = '';
    const range = selection.getRangeAt(0);
    const boundary = range.getBoundingClientRect();
    axios
      .get('http://localhost:8080/api/data', { params: { search: 'Imo' } })
      .then((res) => {
        res.data.data.forEach((item) => {
          tbody.innerHTML += `<div class="table-row">
              <div class="table-data">${item["Journalist's Name"]}</div>
              <div class="table-data">${item['Media Name']}</div>
              <div class="table-data">${item['To pitch?']}</div>
              <div class="table-data">${item['Info:']}</div>
              <div class="table-data">${item['Search citations']}</div>
            </div>`;
        });
      });
    if (tooltip.style.opacity === '1') {
      tooltip.style.opacity = 0;
      setTimeout(() => {
        tooltip.style.left = `${
          boundary.left + boundary.width / 2 + window.scrollX
        }px`;
        tooltip.style.top = `${
          boundary.top + boundary.height + window.scrollY + 5
        }px`;
        tooltip.style.opacity = 1;
      }, 300);
    } else {
      tooltip.style.left = `${
        boundary.left + boundary.width / 2 + window.scrollX
      }px`;
      tooltip.style.top = `${
        boundary.top + boundary.height + window.scrollY + 5
      }px`;
      tooltip.style.opacity = 1;
    }
  },
  300,
  { leading: false, trailing: true }
);

document.onselectionchange = selectionChangeHandler;
