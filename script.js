'use strict';
import { USERS } from './data.js';

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');
const currentUser = 0;
let usersCopy = [...USERS];

const checkUserNo = pin => {
  let index;
  usersCopy.forEach((item, idx) => {
    if (pin == item.pin) {
      index = idx;
    }
  });
  return index;
};

const initiateLogin = (event, pin) => {
  event.preventDefault();
  const userNo = checkUserNo(pin);
  if (userNo || userNo === 0) {
    containerApp.style.opacity = 1;
    displayMovements(usersCopy[userNo].movements);
    updateCurrentBalance(usersCopy[userNo].movements);
  }
};

const initiateDeactivation = (event, user, pin) => {
  event.preventDefault();
  const size = usersCopy.length;
  usersCopy = usersCopy.filter(item => item.owner !== user && item.pin != pin);
  const newSize = usersCopy.length;
  if (size !== newSize) {
    containerApp.style.opacity = 0;
  }
};

const today = new Date();
const yyyy = today.getFullYear();
let mm = today.getMonth() + 1; // Months start at 0!
let dd = today.getDate();

if (dd < 10) dd = '0' + dd;
if (mm < 10) mm = '0' + mm;

labelDate.innerText = dd + '/' + mm + '/' + yyyy;

const getType = n => {
  if (n > 0) return 'deposit';
  else return 'withdrawal';
};

const displayMovements = movements => {
  containerMovements.innerHTML = '';
  movements.forEach((mov, i) => {
    const type = getType(mov);
    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__value">${mov}</div>
  </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const displayNewMovements = movements => {
  usersCopy[currentUser].noOfMovements += 1;
  movements.forEach(mov => {
    const type = getType(mov);
    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${usersCopy[currentUser].noOfMovements} ${type}</div>
    <div class="movements__value">${mov}</div>
  </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const updateCurrentBalance = movements => {
  const sum = movements.reduce((acc, curr) => acc + curr, 0);
  const symbol = labelBalance.innerText.at(-1);
  labelBalance.innerText =
    Number(labelBalance.innerText.slice(0, labelBalance.innerText.length - 1)) +
    sum;
  labelBalance.innerText = String(labelBalance.innerText) + symbol;
};
const handleTransaction = (event, amount, type) => {
  event.preventDefault();
  amount = type === 'withdrawal' ? amount * -1 : Number(amount);
  const newMovement = [amount];
  updateCurrentBalance(newMovement);
  displayNewMovements(newMovement);
};

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

btnLogin.addEventListener('click', event =>
  initiateLogin(event, inputLoginPin.value)
);
btnTransfer.addEventListener('click', event =>
  handleTransaction(event, inputTransferAmount.value, 'withdrawal')
);
btnLoan.addEventListener('click', event =>
  handleTransaction(event, inputLoanAmount.value, 'deposit')
);
btnClose.addEventListener('click', event =>
  initiateDeactivation(event, inputCloseUsername.value, inputClosePin.value)
);
