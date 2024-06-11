const worker = new Worker(new URL('./worker.js', import.meta.url))

const input = document.querySelector('input')
const list = document.getElementById('list') as HTMLElement

const items = Array.from({length: 1000}).map((_i, index) => index);
const itemHeight = 36;
const listHeight = list?.offsetHeight || 0;
const itemsVisible = Math.floor(listHeight / itemHeight);

const itemsHeight = itemHeight * items.length;
const visibleArea = itemsVisible * itemHeight;
let scrollTop = 0;
let startElement = 0;
let endElement = itemsHeight - startElement - visibleArea;



function createStartElement(height: number) {
  const element = document.createElement('div');
  element.style.height = height + "px";

  return element
}

function createEndElement(height: number) {
  const element = document.createElement('div');
  element.style.display = 'block'
  element.style.height = height + "px";

  return element
}

list?.addEventListener('scroll', event => {
  let {scrollTop} = (event.target as HTMLUListElement);
  startElement = scrollTop;
  endElement = itemsHeight - startElement - visibleArea;

  const previousItems = Math.ceil(scrollTop / itemHeight);
  const startIndex = previousItems;
  const endIndex = startIndex + itemsVisible//Math.floor((scrollTop % listHeight) / itemsVisible)

  // console.log({scrollTop, startIndex, endIndex})

  render(startIndex, endIndex)
});

function render(startIndex: number, endIndex: number) {
  list.innerHTML = "";

  list?.append(createStartElement(startElement))
  const currentItems = items.slice(startIndex, endIndex);
  // const currentItems = items.slice(0, itemsVisible);
  // const currentItems = items

  currentItems.forEach((index) => {
    const el = document.createElement('li')
    el.style.height = itemHeight + 'px';
    el.append(String(index))
    list?.appendChild(el)
  })

  list?.append(createEndElement(endElement))
}

console.log({listHeight, itemsVisible})
render(0, itemsVisible)








input?.addEventListener('change', event => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  file.stream()
    .pipeThrough(new TextDecoderStream())
    .pipeTo(new WritableStream({
      write(chunk) {
        worker.postMessage({type: "CHUNK", data: chunk})
      },
      close() {
        worker.postMessage({type: "END"})
      }
    }))
})

function renderItem(item: Record<any, any>) {
  const itemList = document.createElement('li');
  const listKeyElement = document.createElement('span')

  listKeyElement.append(item.key)
  itemList.append(listKeyElement);
  itemList.append(":");
  const itemValue = document.createElement('span');
  itemValue.append(String(item.value));
  itemList.append(itemValue)

  return itemList
}

function itemValue(item: Record<any, any>) {
  // if(["ARRAY_START", "ARRAY_END", "OBJECT_START", "OBJECT_END"].includes(item.type)) {

  //   return item.value
  // }
}

worker.onmessage = function (event: MessageEvent<Record<any, any>[]>) {
  
  const data = event.data;
  data.forEach(item => {
    list?.append(renderItem(item))
  });
}