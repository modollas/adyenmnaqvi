const express = require('express');
const router = express.Router();
const path = require('path');
const handlebars = require('express-handlebars');
const cookieParser = require('cookie-parser');
const { Client, Config, CheckoutAPI, Adyen } = require('@adyen/api-library');
var cors = require('cors');
var bodyParser = require('body-parser');
const app = express();

const PORT = process.env.PORT || 8081;

// const paymentsrouter = require(getPaymentMethods)

// Parse JSON bodies
// app.use(express.json());
// Parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Parse cookie bodies, and allow setting/getting cookies
// app.use(cookieParser());

app.use(cors());

// app.use('/getPaymentMethod', require('./getPaymentMethods'));
// app.use('/initiatePayment', require('./initiatePayment'));
// app.use('/handleShopperRedirect', require('./handleShopperRedirect'));
// app.use('/submitAdditionalDetails', require('./submitAdditionalDetails'));

// Adyen Node.js API library boilerplate (configuration, etc.)
// const config = new Config();
// config.apiKey = "AQEyhmfxK4zJbBZDw0m/n3Q5qf3VaY9UCJ1+XWZe9W27jmlZiniYHPZ+YtXG9dYfNdwN0H8QwV1bDb7kfNy1WIxIIkxgBw==-uA2G0DS73SlmB4EHi/YNndhli7KlCMjXHbMmm8stboc=-djvcdM2gNHq9dSvC";
// const client = new Client({ config });
// client.setEnvironment("TEST");
// const checkout = new CheckoutAPI(client);

// Use Handlebars as the view engine
app.set('view engine', 'handlebars');

//Sets handlebars configurations (we will go through them later on)
app.engine(
  'handlebars',
  handlebars({
    layoutsDir: __dirname + '/views/layouts',
  })
);

app.use(express.static(path.join(__dirname, '/public')));

// console.log(response);

// function callServer(url, data) {
//   return fetch(url, {
//     method: "POST",
//     body: JSON.stringify(data),
//     headers: {
//       "Content-Type": "application/json"
//     }
//   }).then(res => res.json());
// }
// function handleServerResponse(res, dropin) {
//   if (res.action) {
//     dropin.handleAction(res.action);
//   } else {
//     switch (res.resultCode) {
//       case "Authorised":
//         window.location.assign = "/success";
//         break;
//       case "Pending":
//         window.location.assign = "/pending";
//         break;
//       case "Refused":
//         window.location.assign = "/failed";
//         break;
//       default:
//         window.location.assign = "/error";
//         break;
//     }
//   }
// }

// function handleSubmission(state, component, url) {
//   callServer(url, state.data)
//     .then(res => handleServerResponse(res, component))
//     .catch(error => {
//       throw Error(error);
//     });
// }

const config = new Config();
// Set your X-API-KEY with the API key from the Customer Area.
config.apiKey =
  'AQEyhmfxK4zJbBZDw0m/n3Q5qf3VaY9UCJ1+XWZe9W27jmlZiniYHPZ+YtXG9dYfNdwN0H8QwV1bDb7kfNy1WIxIIkxgBw==-uA2G0DS73SlmB4EHi/YNndhli7KlCMjXHbMmm8stboc=-djvcdM2gNHq9dSvC ';
config.merchantAccount = 'TestAccountNY';
const client = new Client({ config });
client.setEnvironment('TEST');
const checkout = new CheckoutAPI(client);

app.get('/', function (req, res) {
  console.log(req.get('host'));
  const paymentsResponse = checkout
    .paymentMethods({
      amount: {
        currency: 'EUR',
        value: 1000,
      },
      countryCode: 'NL',
      shopperLocale: 'nl-NL',
      channel: 'Web',
      merchantAccount: config.merchantAccount,
    })
    .then((data) => {
      console.log(data);
      res.render('main', { layout: 'index', data: JSON.stringify(data) });
    });
});

app.post('/payment', (req, res) => {
  console.log('post request made');
  console.log(req.body.data.paymentMethod);
  console.log(JSON.stringify(req.body.data.paymentMethod));
  console.log(config.merchantAccount);

  const checkoutResponse = checkout
    .payments({
      amount: { currency: 'EUR', value: 1000 },
      paymentMethod: req.body.data.paymentMethod,
      reference: '12345',
      merchantAccount: config.merchantAccount,
      returnUrl: 'https://' + req.get('host') + '/checkout',
    })
    .then((data) => {
      console.log(data);
      res.send(JSON.stringify(data));
    });
});

app.post('/payment/details', (req, res) => {
  console.log('post request details made');
  console.log(req.body.data.paymentMethod);
  console.log(JSON.stringify(req.body.data.paymentMethod));
  console.log(config.merchantAccount);

  const checkoutResponse = checkout
    .payments({
      amount: { currency: 'EUR', value: 1000 },
      paymentMethod: req.body.data.paymentMethod,
      reference: '12345',
      merchantAccount: config.merchantAccount,
      returnUrl: 'https://' + req.get('host') + '/checkout',
    })
    .then((data) => {
      console.log(data);
      res.send(JSON.stringify(data));
    });
});

app.get('/checkout', (req, res) => {
  console.log('checkout');
  console.log(req.query.resultCode);
  if (
    req.query.resultCode == 'received' ||
    req.query.resultCode == 'authorised'
  ) {
    res.send('Your Payment Was Processed');
  } else {
    res.send('Your Payment Was Not Processed');
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
