<main class="colored-area" data-color="gray" itemscope="itemscope" itemtype="http://schema.org/Article"><link itemprop="mainEntityOfPage" href="https://chat-api.com/"> <link itemprop="image" href="https://chat-api.com/img/googlesheets/en/whatsapp-bot-google-sheets-en.jpg"> <meta itemprop="dateModified" content="2021-02-01">

<article class="container is-relative d-flex align-items-start" itemprop="articleBody">

<div class="content-radius">

In this guide, we will look at the bot’s functionality and learn how to set up Google Sheets API. You will also learn to create a WhatsApp bot on NodeJS using our gateway connected to Google Sheets.

<div class="nav-content mb-35">

<nav>

*   [Setting up Google services](#Google)
*   [Module for working with Google API](#Googleapi)
*   [Working with WhatsApp API](#waapi)
*   [Webhook](#weebhook)
*   [Whatsapp bot + Google Sheets is ready](#final)

</nav>

</div>

In our example, the bot will react to commands in the form of regular WhatsApp messages by either replying to them or executing commands. Don’t forget to download the ready-to-use bot from our repository and use it in your work!

### What Functions Does the Bot Have?

1.  Adding data to a sheet;
2.  Reading data from a sheet;
3.  Sending messages to phone numbers from a sheet;
4.  Sending files from sheet cells;

<div class="anchor-box" id="Google">

## Preparation and Setting Up Google Services

The example of working with API we offer below is based on the official article [Node.js Quickstart from Google](https://developers.Google.com/sheets/api/quickstart/nodejs)

### Setting Up an Account to Work with API

First of all, go to the [developer’s website](https://console.developers.Google.com/) and create a new project.

This done, open the _Library_ tab

You will see a list from which you need to select _Google Sheets API_. Next, click on the _Enable_ button.

At this point, you will be redirected to the page with settings for the API. This is where you will need to create credentials. Click on the _Create credentials_ button.

In the resulting window, choose the settings for the service account and press on the _Select the credentials type_ button. We recommend you use the credentials shown in the screenshot:

Then you will need to choose the name and role for the account. Select the **Editor** role.

Select the type of the key - _JSON_. After that, download a JSON file with data. Save the file to the folder with the project and rename it to **keys.json** so that it would be handy to use it in the project.

Your account is almost set up. All that is left to do now is enable the account as _Editor_ in Google Sheets. To do this, open the sheet and press the _Access Settings_ button.

We need to add the account that we created as the editor of this table. Now look up the email address of the account in the [developers console](https://console.developers.Google.com/) in the Credentials tab and copy it.

Your services are now ready to go! Let’s move on to the project itself.

</div>

<div class="anchor-box" id="Googleapi">

## Creating a Module for Google API

To begin with, create a **config.js** file where you will keep configuration data for your bot. Add the ID of your Google sheet to it. You can find the ID in the address bar.

### **config.js**

    module.exports = {
        spreadid:"1M6fyEhv64ug7zILRz86H1PBKEKHUgKV9pWSW2m_r4SI",  // Google sheet ID
    }

Next, create a **Googleapi.js** file to keep all the functions and data related to your Google API. First of all, you will need to install a Google API module for NodeJS.  
To install the module, enter the command **npm install Googleapis@39 --save** in the terminal. You will also need to import dependencies in the file itself.

    const config = require("./config.js");
    const {Google} = require('Googleapis');
    const keys = require('./keys.json');

Next, create a client object for authentication in Google.

    const client = new Google.auth.JWT(
        keys.client_email,
        null,
        keys.private_key,
        ['https://www.Googleapis.com/auth/spreadsheets']
    ) //Json Web Token

The parameters that the _JWT_ function takes include:

*   The email address from the JSON file with credentials;
*   The path to the file with a private key (which is null since we don’t send it);
*   The private key from the JSON file with credentials;
*   A list of access permissions. In our case, it is only Google Sheets. If necessary, you can add other Google APIs to the list.

The next step is to call the function that allows you to be authenticated in the system.

    client.authorize(function(err, tokens) {
        if (err){
            console.log(err);
            return;
        }

        console.log('Connected Google Sheets Api!');
        gsrun(client);
    });

    let gsapi;

    async function gsrun(cl){
        gsapi = Google.sheets({version:'v4', auth:cl})
    }

If everything goes well, output _Connected Google Sheets API!_ to the console and add the _Sheets_ class into a _gsapi_ object. The _Sheets_ class takes as parameters the version of the API used and the _Client_ object that we have created before.

### **The Method of Receiving Data**

    async function getValues(range)
    {
        const opt = {
            spreadsheetId: config.spreadid,
            range : range
        }

        let data = await gsapi.spreadsheets.values.get(opt);
        let dataArray = data.data.values;

        return dataArray;
    }

In order to receive data from the sheet, you will need to write a function. (As a parameter, it takes a cell range with the following format: **List1!A1:B2**) where List1 is the name of your list in the sheet. Be careful when you specify the parameter.

**opt** - a dictionary of parameters that we send as a request to the Google API.

*   _spreadsheetId_ - the sheet ID;
*   _range_ - the range of values from where to extract data;

To extract data from the spreadsheet, you need to send _opt_ to the _gsapi.spreadsheets.values.get(opt)_ method;

The method returns all the information about the request. As for the data itself, it is stored in _data.values_.

Now it’s time to write a method allowing us to insert data into the spreadsheet. To add data to the end of the sheet, you need to first find out the number of the last line. Since API does not let us do so directly, let us first define the method that will return the number of the last line, and then add the data.

    async function getLastRow() // Get the number of the last row in the table
    {
        const opt = {
            spreadsheetId: config.spreadid,
            range: 'Data!A1:A'
        }
        let response = await gsapi.spreadsheets.values.get(opt);
        return response.data.values.length;
    }

The method consists in receiving all data from the A1:1 range, that is, to the end of the table, and then returning the length of the resulting array.

### **The Method of Writing Data**

    async function updateSheet(name, phone) // Write in the last row of the table the data.
    {
        let lastRow = await getLastRow() + 1;
        const opt = {
                spreadsheetId : config.spreadid,
                range: 'Data!A' + lastRow,
                valueInputOption:'USER_ENTERED',
                resource: {values: [[name, phone]]}
        }
        await gsapi.spreadsheets.values.update(opt);
    }

The method accepts the name and the phone number as parameters (you will store them in the sheet). Also, the _opt_ dictionary now includes additional parameters, that is, your data. Mind that _values_ is an array of arrays. Thus, we can send a range of data, not just one line. To record data, use the _update_ method.

<div class="row">

<div class="col-lg-6">

At this point, your work with the Google API is over. All that is left for you to do is export methods of working with the API so that you could call them from another class.

</div>

<div class="col-lg-6">

    module.exports.updateSheet = updateSheet;
    module.exports.getValues = getValues;
    module.exports.getLastRow = getLastRow;

</div>

</div>

</div>

<div class="anchor-box" id="waapi">

## Working with the WhatsApp API

<div class="is-relative">

<div class="note is-absolute">

<div class="note__title">Note!</div>

<div class="note__text">For the bot to work, your phone must be connected to the internet and must not be used for Whatsapp Web.</div>

</div>

</div>

<div class="d-flex flex-column flex-lg-row align-items-start mb-25">

<div class="">

The first thing you should do is to connect WhatsApp to our script so that you could check the bot’s work while you are writing the code. To do this, go to your [user account](https://app.chat-api.com) and get the QR code. Then open WhatsApp on your mobile phone and go to _Settings_ -> _WhatsApp Web_ -> _Scan the QR code_.

<div>[<span>Get access to WhatsApp API</span>](https://app.chat-api.com)</div>

</div>

</div>

To work with the WhatsApp API, you will need a _token_ and _Uri_ from your user account. You can find them in the header of your instance.

Add them to the configuration file:

    module.exports = {
        apiUrl: "https://eu115.chat-api.com/instance12345/",
        token: "1hi0xwfzaxsews12345", // Token for working with API from personal cabinet
        spreadid:"1M6fyEhv64ug7zILRz86H1PBKEKHUgKV9pWSW2m_r4SI",  // Google table ID
    }

Next, create an **index.js**js file. It will contain all the bot logic as well as a server processing Webhook requests. Import all dependencies.

    const config = require("./config.js");
    const Googleapi = require("./Googleapi.js");
    const token = config.token, apiUrl = config.apiUrl;
    const menu_text = config.menuText;
    const app = require('express')();
    const bodyParser = require('body-parser');
    const fetch = require('node-fetch');

*   _node-fetch_ makes it possible to make requests to the API, while config will load your data from another file;
*   _token_ and _apiUrl_ are your data (from the configuration file) that allow you to address the WA API;
*   The _Express_ module is necessary for deploying a web server that will process requests;
*   _body-parser_ allows for easy extraction of incoming request;
*   _Googleapi_ is our Google API module;

<div class="row">

<div class="col-lg-6">

Now we need to tell the server that we are going to parse _Json_data:

</div>

<div class="col-lg-6">

    app.use(bodyParser.json());

</div>

</div>

<div class="row">

<div class="col-lg-6">

Add an error handler:

</div>

<div class="col-lg-6">

    process.on('unhandledRejection', err => {
        console.log(err)
    });

</div>

</div>

Then describe the function that will work with the WhatsApp API.

    async function apiChatApi(method, params){
        const options = {};
        options['method'] = "POST";
        options['body'] = JSON.stringify(params);
        options['headers'] = { 'Content-Type': 'application/json' };

        const url = `${apiUrl}/${method}?token=${token}`;

        const apiResponse = await fetch(url, options);
        const jsonResponse = await apiResponse.json();
        return jsonResponse;
    }

This function takes as a parameter the method that needs to be executed and the object with parameters that we will send with the request. Inside the function, create the _options_ object _with two values: json and method_. In the first one, you will send parameters necessary for the API, and, in the second, — specify the method which you call and from which you want to get a response. Next, define the constant — our URL for addressing the API. It will contain the URL itself (from the config), the method, and the token. After that, send a request to the Chat API.

Now that your function is ready, you can describe the main bot logic. Describe the handler where the _webhook_ will send data.

    app.post('/', async function (req, res) {
        const data = req.body;
    }

The function and the handler are one and the same thing; they process POST requests at the server’s main address ('/' path is responsible for that). **data** is the received JSON file.

To figure out what particular JSON will come to the server, use the following [testing tools](https://app.chat-api.com/testing).

    app.post('/', async function (req, res) {
        const data = req.body;
        for (var i in data.messages) {
            const body = String(data.messages[i].body.toLowerCase());
            const chatId = data.messages[i].chatId;
            splitBody = body.split(' ');
            command = splitBody[0];

            if(data.messages[i].fromMe)
                return;

            if(command == 'help')
            {
                await apiChatApi('sendMessage', {chatId:chatId, body: menu_text});
            }
            else if (command == 'insert')
            {
                name = splitBody[1];
                phone = splitBody[2];
                await Googleapi.updateSheet(name, phone)
                await apiChatApi('sendMessage', {chatId:chatId, body: 'Successfully recorded'})
            }

            else if (command == 'info')
            {
                let result;
                if (splitBody.length == 1){
                    result = await getInfoDataFromSheet('A2:D2');
                }
                else{
                    result = await getInfoDataFromSheet(splitBody[1]);
                }
                x = await apiChatApi('sendMessage', {chatId:chatId, body: result})
                console.log(x);
            }

            else if (command == 'file')
            {
                linkFile = (await Googleapi.getValues('Data!D2'))[0][0];
                x = await apiChatApi('sendFile', {chatId:chatId, body: linkFile, 'filename':'testfile'})
            }

            else if (command == 'bulk'){
                lastRow = await Googleapi.getLastRow() + 1;
                dataAll = await Googleapi.getValues('Data!A2:D' + lastRow);
                dataAll.forEach(async function(entry){
                    await apiChatApi('sendMessage', {phone:entry[1], body: `Hi, ${entry[0]}, its a test mailing.`});
                });
            }

            else
            {
                await apiChatApi('sendMessage', {chatId:chatId, body: menu_text})
            }
        }
        res.send('Ok');
    });

In the handler, perform the actions corresponding to the received commands. Now, let us look at each of the actions separately and see the results of their testing.

#### Filling the sheet cells

To insert data to the spreadsheet, we need to split the message by using the split method and pass the name and the phone number to the function that we wrote for the Google API.

     else if (command == 'insert'){
        name = splitBody[1];
        phone = splitBody[2];
        await Googleapi.updateSheet(name, phone)
        await apiChatApi('sendMessage', {chatid:chatId, body: 'Successfully recorded'})
    }

#### Reading data from the cell, receiving data

To receive data, we must either send the incoming cell range from the message, or, if the used has not sent the range, send the standard A2:D2.

     else if (command == 'info'){
        let result;
        if (splitBody.length == 1){
            result = await getInfoDataFromSheet('A2:D2');
        }
        else{
            result = await getInfoDataFromSheet(splitBody[1]);
        }
        await apiChatApi('sendMessage', {chatId:chatId, body: result})
    }

The _GetInfoDataFromSheet_ function simply forms the line out of the data arrays that GoogleApi returned to us.

    async function getInfoDataFromSheet(range){
        data = await Googleapi.getValues('Data!' + range);
        result = "";
        data.forEach(function(entry) {
            result += entry.join(' ') + "\n"
        });
        return result;
    }

#### Sending files to WhatsApp

To send a file, (get) the direct link to the file from the sheet cell and send it using the _sendFile_ method.

     else if (command == 'file'){
        linkFile = (await Googleapi.getValues('Data!D2'))[0][0];
        x = await apiChatApi('sendFile', {chatId:chatId, body: linkFile, 'filename':'testfile'})
    }

<div class="is-relative">

#### WhatsApp Bulk Messaging

To bulk message in WhatsApp, all you need to do is go over the whole spreadsheet and send messages to specified numbers. In our example, to test bulk messaging, we added our own number to two of the lines.

<div class="note is-absolute">

<div class="note__title">Warning!</div>

<div class="note__text">We urge our customers not to send unwanted messages, make mass marketing mailings. Otherwise your account can be blocked by WhatsApp anti-spam system! Contact our tech.support to clarify recommendations.</div>

</div>

</div>

    else if (command == 'bulk'){
        lastRow = await Googleapi.getLastRow() + 1;
        dataAll = await Googleapi.getValues('Data!A2:D' + lastRow);
        dataAll.forEach(async function(entry){
            await apiChatApi('sendMessage', {phone:entry[1], body: `Hi, ${entry[0]}, its a test mailing.`});
        });
    }

All the tests were successful. Now we can upload our bot to the server and install the Webhook.

</div>

<div class="anchor-box" id="weebhook">

## Weebhook

A webhook helps prevent pauses in answering incoming messages. Without it, our bot would have to constantly, at regular intervals, send requests for incoming data to the server. That would slow the response time and increase the server load.

But if you specify the webhook’s address, you are spared this problem. The servers will send notifications about incoming changes as soon as they appear. The webhook, in its turn, will receive and process them correctly, thus implementing the bot’s logic. You can specify either the domain name or the IP address.

Now you need to upload the bot to a hosting (dedicated server) and launch it. This done, specify the domain or IP address as a webhook in the user account and test the bot.

Once you have launched the bot, you will see a notification about a successful connection:

</div>

<div class="anchor-box" id="final">

## Whatsapp bot in conjunction with Google Sheets is ready

So, we described the work of a simple whatsapp chatbot and posted the source code with ready-to-use functionality on github.

The entire code and guide will be available at the link: [https://github.com/chatapi/whatsapp-google-sheets-bot-en](https://github.com/chatapi/whatsapp-google-sheets-bot-en "whatsapp bot using Google sheets api")

![How to Create a WhatsApp Bot with NodeJS Using Google Sheets API](https://chat-api.com/img/googlesheets/en/whatsapp-bot-google-sheets-en.jpg)

You only need to substitute in the code your token from your personal account and instance number.

<div class="mb-35">[<span>Get a WhatsApp API token</span>](https://app.chat-api.com)</div>

Now you need to upload server together with the bot to the hosting and specify your domain as the webhook. With each incoming message the server will receive and process the data. If you have any questions, you can always contact our technical support!

<div itemprop="author" itemscope="itemscope" itemtype="http://schema.org/Person"><link itemprop="sameAs" href="https://chat-api.com/"> ![](/img/logo_small.jpg) <span style="display: none;" itemprop="name">ChatAPI</span></div>

<div itemprop="publisher" itemscope="itemscope" itemtype="http://schema.org/Organization"><link itemprop="sameAs" href="https://chat-api.com/">

<div itemprop="logo" itemscope="itemscope" itemtype="https://schema.org/ImageObject"><link itemprop="url image" href="/img/logo_small.jpg"></div>

<meta itemprop="name" content="Chat-API.com"></div>

<time itemprop="datePublished">2021-02-01</time></div>

</div>

<div class="nav-content is-aside sticky-sidebar">

<nav>

*   [Setting up Google services](#Google)
*   [Module for working with Google API](#Googleapi)
*   [Working with WhatsApp API](#waapi)
*   [Webhook](#weebhook)
*   [Whatsapp bot + Google Sheets is ready](#final)

</nav>

</div>

</article>

</main>