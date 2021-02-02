module.exports = {
    apiUrl: "https://eu115.chat-api.com/instance12345/", // URL адрес для обращений к API
    token: "t1o2k3e4n5", // Токен для работы с API из личного кабинета
    spreadid:"1M6fyEhv64ug7zILRz86H1PBKEKHUgKV9pWSW2m_r4SI",  // ID google таблицы

    
    menuText: `This is a demo bot for https://chat-api.com/ with google sheets api.
Commands:
    1. insert Name Phone - Write data to the cells of the sheet.
    2. info [A1:C2] - Get data from a range of cells. If no cell is specified, return the range A2:D2.
    3. bulk - Send messages to contacts from the sheet.
    4. file - get file from a table cell
    5. help - Get a list of commands.`
}