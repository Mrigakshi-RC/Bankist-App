'use strict';
import { USERS } from './data.js';

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');
let userNo;
let usersCopy = [...USERS];
let [inSum, outSum] = [0, 0];

//CALCULATES TOTAL IN AND OUT AMOUNTS
const calculateInOut = movements => {
  movements.forEach(mov => {
    if (mov > 0) inSum += mov;
    else outSum += mov;
  });
  outSum = Math.abs(outSum);
  labelSumIn.innerText = inSum + '₹';
  labelSumOut.innerText = outSum + '₹';
};

// 5-MINUTE TIMER FUNCTIONS STARTS HERE
let totalTime=300;
let timeLeft = totalTime;
let timerInterval;

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
}

function updateTimerDisplay() {
  labelTimer.textContent = formatTime(timeLeft);
}

function startTimer() {
  clearInterval(timerInterval); // Clear any existing intervals
  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      labelTimer.textContent = '00:00'; // Timer finished
      location.reload();
    }
  }, 1000);
}
// ENDS HERE

// FINDS THE USER'S INDEX IN THE DATA BASED ON PIN
const checkUserNo = pin => {
  let index;
  usersCopy.forEach((item, idx) => {
    if (pin == item.pin) {
      index = idx;
    }
  });
  return index;
};

// FINDS THE USER'S INDEX IN THE DATA BASED ON USERNAME
const findUserIndex = user => {
  let index;
  usersCopy.forEach((item, idx) => {
    if (user == item.owner) {
      index = idx;
    }
  });
  return index;
};

// DETERMINES WHAT IS SUPPOSED TO HAPPEN AFTER LOGIN
const initiateLogin = (event, pin) => {
  event.preventDefault();
  userNo = checkUserNo(pin);
  if (userNo || userNo === 0) {
    containerApp.style.opacity = 1;
    labelWelcome.style.opacity = 0;
    startTimer();
    displayMovements(usersCopy[userNo].movements);
    updateCurrentBalance(usersCopy[userNo].movements);
  }
};

// DETERMINES WHAT IS SUPPOSED TO HAPPEN AFTER USER DECIDES TO CLOSE THE ACCOUNT
const initiateDeactivation = (event, user, pin) => {
  event.preventDefault();
  const size = usersCopy.length;
  usersCopy = usersCopy.filter(item => item.owner !== user && item.pin != pin);
  const newSize = usersCopy.length;
  if (size !== newSize) {
    containerApp.style.opacity = 0;
  }
};

// CALCULATION FOR DISPLAYING TODAY'S DATE BEGINS HERE
const today = new Date();
const yyyy = today.getFullYear();
let mm = today.getMonth() + 1; // Months start at 0!
let dd = today.getDate();

if (dd < 10) dd = '0' + dd;
if (mm < 10) mm = '0' + mm;

labelDate.innerText = dd + '/' + mm + '/' + yyyy;
// ENDS HERE

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
  calculateInOut(movements);
};

const displayNewMovements = movements => {
  usersCopy[userNo].noOfMovements += 1;
  movements.forEach(mov => {
    const type = getType(mov);
    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${usersCopy[userNo].noOfMovements} ${type}</div>
    <div class="movements__value">${mov}</div>
  </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
  calculateInOut(movements);
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
  if (type === 'withdrawal') {
    const transferToUser = findUserIndex(inputTransferTo.value);
    if (!transferToUser) {
      return;
    } else {
      usersCopy[transferToUser].currentBalance += Number(amount);
    }
    inputTransferTo.value="";
    inputTransferAmount.value="";
  }
  updateCurrentBalance(newMovement);
  displayNewMovements(newMovement);
};

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
