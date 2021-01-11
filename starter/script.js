'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-01-01T17:01:17.194Z',
    '2021-01-03T23:36:17.929Z',
    '2021-01-06T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
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

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  //These will only be executed if all other conditionals above return false
  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();

  // return `${day}/${month}/${year}`;
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = ` 
    <div class="movements">
      <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
     <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
    </div>
  `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  //Display Movements
  displayMovements(acc);
  //Display Balance
  calcDisplayBalance(acc);
  //Display Summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, '0');
    const sec = String(Math.trunc(time % 60)).padStart(2, '0');
    // In each call, print the remaining time to the UI
    labelTimer.textContent = `${min}:${sec}`;

    // When time is at 0, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    // Decrease 1s
    time--;
  };
  // Set time to five minutes
  let time = 120;
  // Call timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

//EVENT HANDLERS

let currentAccount, timer;

// // FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

//Experimenting with API
// const now = new Date();
// const options = {
//   hour: 'numeric',
//   minute: 'numeric',
//   day: 'numeric',
//   month: 'long',
//   year: 'numeric',
//   weekday: 'long',
// };
// const locale = navigator.language;

// labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(now);

// BACK TO REGULARLY SCHEDULED PROGRAMMING

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  //Optional chaining with ?
  if (currentAccount?.pin === +inputLoginPin.value) {
    //Display UI and welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Display date upon login
    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };
    // const locale = navigator.language;
    // locale coming from browser

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    //Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //Start logout timer

    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    //UPDATE UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);

    //Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      //Add movement to current account
      currentAccount.movements.push(amount);

      //Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      //Update UI
      updateUI(currentAccount);

      //Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);

    //Delete account
    accounts.splice(index, 1);

    //Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted); // Always do whatever the opposite of the current state is when the button is clicked
  sorted = !sorted; //Make sure to toggle the variable as well, saving the state of the 'sorted' boolean
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

//Parsing
// console.log(Number.parseInt('30px', 10)); //30
// console.log(Number.parseInt('e23', 10)); //NaN
// //For parseInt to work, a number has to come first
// //Use 10 as the second argument when using base 10, 2 when using binary
// console.log(Number.parseFloat('        2.5ren       ')); //2.5

// Check is value is NaN
// console.log(Number.isNaN(20)); //false
// console.log(Number.isNaN('20')); //false
// console.log(Number.isNaN(+'20x')); //true
// console.log(Number.isNaN(23 / 0)); //false (Infinity)

// console.log(Number.isFinite(20)); //true
// console.log(Number.isFinite('20')); //false
// console.log(Number.isFinite(+'20x')); //false
// console.log(Number.isFinite(23 / 0)); //false
// //isFinite is the best method for checking if something is truly a number

// console.log(Math.sqrt(25)); //5
// console.log(25 ** (1 / 2)); //5
// console.log(8 ** (1 / 3)); // 2 //The only way to calculate a cubic root
// console.log(Math.max(5, 18, 23, 11, 2)); // 23 // return max value
// console.log(Math.max(5, 18, '23', 11, 2)); // 23 // does type coersion
// console.log(Math.max(5, 18, '23px', 11, 2)); // NaN // does not parse
// console.log(Math.min(5, 18, 23, 11, 2)); // 2 // self explanitory
// console.log(Math.PI); //3.141592653589793
// console.log(Math.PI * Number.parseFloat('10px') ** 2); //314.1592653589793 //calculate the radius
// console.log(Math.random()); //Gives a number between 0 and 1
// console.log(Math.trunc(Math.random() * 6)); //highest number here can be 5
// console.log(Math.trunc(Math.random() * 6) + 1); //values between 1 and 6

// const randomInt = (min, max) =>
//   Math.floor(Math.random() * (max - min) + 1) + min;
// //should always return a number between 10 and 20

// console.log(randomInt(10, 20));

// // Rounding integers
// console.log(Math.trunc(23.3)); //23
// console.log(Math.round(23.9)); //24
// console.log(Math.ceil(23.3)); //24
// console.log(Math.ceil(23.9)); //24
// console.log(Math.floor(23.3)); //23
// console.log(Math.floor(23.9)); //23
// //Floor and Trunc do the same thing when working with positive numbers, but they will continue to round down and cut off decimals, respectively, on negative numbers, producing different results
// console.log(Math.floor(-23.3)); //-24
// console.log(Math.trunc(-23.3)); //-23

// // Floating decimals
// console.log((2.7).toFixed(0)); // '3'
// //toFixed will always return a string and not a number
// console.log((2.7).toFixed(3)); //'2.700'
// console.log((2.34566).toFixed(2)); // '2.35'
// console.log(+(2.345).toFixed(2)); // 2.35 (converts the string returned by toFixed to a number)

// // REMAINDER OPERATOR
// console.log(5 % 2); // 1 (THIS IS THE REMAINDER)
// console.log(5 / 2); // 2.5 // 5 = 2 * 2 + 1
// console.log(8 % 3); // 2
// console.log(8 / 3); // 2.666666666 // 8 = 3 * 2 + 2
// console.log(6 % 2); // 0
// console.log(7 % 2); // 1

// const isEven = n => n % 2 === 0;

// console.log(isEven(8)); // true
// console.log(isEven(23)); // false
// console.log(isEven(514)); // true

// labelBalance.addEventListener('click', function () {
//   [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
//     if (i % 2 === 0) row.style.backgroundColor = 'orangered';
//     //every other row
//     if (i % 3 === 0) row.style.backgroundColor = 'blue';
//     //every third row
//   });
// });
// //If you ever need to do something every Nth time, the remainder operator is a great choice

// // BigInt
// console.log(2 ** 53 - 1); //9007199254740991
// //This is the biggest number JS can safely represent
// //2 because we are working with base 2
// console.log(Number.MAX_SAFE_INTEGER); //9007199254740991
// //With numbers any larger than this, we lose accuracy
// //We need a way to safely deal with large numbers, esp. when dealing with database IDs
// console.log(67536725637352478589283578723573825763275); //6.753672563735248e+40
// console.log(67536725637352478589283578723573825763275n); //67536725637352478589283578723573825763275n
// //n transforms a regular number to a BigInt number
// console.log(BigInt(67536725637352478589283578723573825763275)); // 67536725637352479016211155172962013806592n
// //BigInt as a function instead of n gives a different result

// //Operations
// console.log(10000n + 10000n); //20000n //Operations work the same
// console.log(4895789437589743895783n * 100000000n); //489578943758974389578300000000n

// const huge = 824758748578937258973285782375823n;
// const num = 23;
// // console.log(huge * num); // Cannot mix BigInt and other types, use explicit conversions

// //Comparison operators work between bigint and regular numbers
// console.log(huge * BigInt(num)); //18969451217315556956385572994643929n
// //Here's where you might use the BigInt operator
// console.log(28n > 15); // true
// console.log(20n === 20); // false
// // === does not do type coersion, and bigint and regular numbers have different primitive types
// console.log(20n == 20); //true

// console.log(huge + ' is REALLY big!');
// // 824758748578937258973285782375823 is REALLY big!

// //Divisions
// console.log(10n / 3n); //3n
// //with BigInt it just returns the closest bigint

// // Create a date

// const now = new Date();
// console.log(now); //Wed Jan 06 2021 23:05:53 GMT-0500 (Eastern Standard Time)
// // (When I did this)

// console.log(new Date('Jan 06 2021 23:05:53'));
// //Wed Jan 06 2021 23:05:53 GMT-0500 (Eastern Standard Time)
// //Automatically parse the time
// console.log(new Date('December 24, 2015'));
// // Thu Dec 24 2015 00:00:00 GMT-0500 (Eastern Standard Time)
// // JS is pretty good at parsing out the time, but it is generally unsafe to do this as it can be unreliable
// console.log(new Date(account1.movementsDates[0])); //Mon Nov 18 2019 16:31:17 GMT-0500 (Eastern Standard Time)
// // This is safe to do since it is JS itself generating the date
// console.log(new Date(2037, 10, 19, 15, 23, 5)); //Thu Nov 19 2037 15:23:05 GMT-0500 (Eastern Standard Time)
// // Month is 0 based, so Nov is 10
// console.log(new Date(2037, 10, 31)); //Tue Dec 01 2037 00:00:00 GMT-0500 (Eastern Standard Time)
// //JS Autocorrects our date, where Nov only has 30 days
// console.log(new Date(0));
// // Wed Dec 31 1969 19:00:00 GMT-0500 (Eastern Standard Time)
// // Something to do with unix
// console.log(new Date(3 * 24 * 60 * 60 * 1000));
// // Sat Jan 03 1970 19:00:00 GMT-0500 (Eastern Standard Time)
// // Three days later

// const future = new Date(2037, 10, 19, 15, 23);
// console.log(future);
// // console.log(future.getFullYear()); // 2037
// // console.log(future.getMonth()); // 10 (Remember, month is 0 based)
// // console.log(future.getDate()); // 19
// // console.log(future.getDay()); // 4 (Will give us day of the week)
// // console.log(future.getHours()); // 15
// // console.log(future.getMinutes()); // 23
// // console.log(future.getSeconds()); // 0
// // console.log(future.toISOString()); // 2037-11-19T20:23:00.000Z
// // // Useful to convert and object to a string which you can then store somewhere

// console.log(future.getTime()); // 2142274980000
// // Milliseconds that have passed since 1 Jan 1970
// console.log(new Date(2142274980000)); //Thu Nov 19 2037 15:23:00 GMT-0500 (Eastern Standard Time)
// console.log(Date.now()); // 1610045974330
// future.setFullYear(2040);
// console.log(future); // Mon Nov 19 2040 15:23:00 GMT-0500 (Eastern Standard Time)

// const future = new Date(2037, 10, 19, 15, 23);
// console.log(+future); //2142274980000 //Timestamp in milliseconds

// const calcDaysPassed = (date1, date2) =>
//   Math.abs((date2 - date1) / (1000 * 60 * 60 * 24));

// const days1 = calcDaysPassed(new Date(2037, 3, 4), new Date(2037, 3, 14));
// console.log(days1); //10 // 10 days
// const days2 = calcDaysPassed(
//   new Date(2037, 3, 4),
//   new Date(2037, 3, 14, 10, 8)
// ); // Adding hours and minutes
// console.log(days2); //10.422222222222222

// const options = {
//   style: 'unit',
//   unit: 'mile-per-hour',
// };

// const num = 7456178465714.23;
// console.log('US: ', new Intl.NumberFormat('en-US').format(num));
// // US:  7,456,178,465,714.23
// console.log('GERMANY: ', new Intl.NumberFormat('de-DE').format(num));
// // GERMANY:  7.456.178.465.714,23
// console.log('SYRIA: ', new Intl.NumberFormat('ar-SY').format(num));
// // SYRIA:  ٧٬٤٥٦٬١٧٨٬٤٦٥٬٧١٤٫٢٣
// console.log('BROWSER: ', new Intl.NumberFormat(navigator.language).format(num));
// // BROWSER:  7,456,178,465,714.23
// console.log(
//   'BROWSER: ',
//   new Intl.NumberFormat(navigator.language, options).format(num)
// );
// // BROWSER:  7,456,178,465,714.23 mph
// console.log('GERMANY: ', new Intl.NumberFormat('de-DE', options).format(num));
// // GERMANY:  7.456.178.465.714,23 mi/h

// TIMERS

// setTimeout(() => console.log('Here is your pizza 🍕'), 3000);
// console.log('Waiting...');
//Waiting...
//Here is your pizza 🍕
//(This is asyncronous JS)
// setTimeout(
//   (ing1, ing2) =>
//     console.log(`Here is your pizza  with ${ing1} and ${ing2} 🍕`),
//   1000,
//   'olives',
//   'spinach'
// );
//Here is your pizza  with olives and spinach 🍕
//The first argument is the callback funtion, the second is the timer, and any arguments after that are what the callback function accepts

// const ingredients = ['olives', 'spinach'];
// const pizzaTimer = setTimeout(
//   (ing1, ing2) =>
//     console.log(`Here is your pizza  with ${ing1} and ${ing2} 🍕`),
//   1000,
//   ...ingredients
// );
// if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// setInterval
// setInterval(function () {
//   const now = new Date();
//   console.log(now);
// }, 1000);

// setInterval(() => {
//   const now = new Date();
//   const hour = `${now.getHours()}`.padStart(2, 0);
//   const min = `${now.getMinutes()}`.padStart(2, 0);
//   const sec = `${now.getSeconds()}`.padStart(2, 0);
//   console.log(`${hour}:${min}:${sec}`);
// }, 1000);
