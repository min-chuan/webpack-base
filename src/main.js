import "core-js/stable";
import "regenerator-runtime/runtime";

const printMe = () => {
  console.log('hello webpack')
}

function component() {
  const element = document.querySelector('#app');
  const btn = document.createElement('button');
  btn.innerHTML = 'Click me and check the console!';
  btn.onclick = printMe;
  element.appendChild(btn);
  return element;
}

document.body.appendChild(component());