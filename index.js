const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require('fs');
const neatCsv = require ('neat-csv');
const cron = require('cron');

const prefix = config.prefix;
const date = new Date();

var currentWeek = [];
var embedMessage = new Discord.MessageEmbed()
    .setColor("#f5873b")
    .setTitle("Weekly Assignments")
    .setDescription("@everyone" + "See below for all the assignments due this week!");
var embedArr = [];

var channel;

function dates (current) {
    var week = new Array();

    current.setDate((current.getDate()));

    for (var i = 0; i < 7; i++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);        
    }

    return week;
}


function weeklySchedule(day, month, year) {
    var calcWeek = dates(new Date(year, month, day));
    var type, name, results, dateArr = [];

    var fileContents = fs.readFileSync('./data.csv');
    var lines = fileContents.toString().split('\n');

    for (var i = 0; i < lines.length; i++) {
        var lineArr = lines[i].split(",");
        
        dateArr = lineArr[0].split("/");
        type = lineArr[1];
        name = lineArr[2];

        for (var j = 0; j < calcWeek.length; j++) {
            if((calcWeek[j].getMonth() + 1) == dateArr[0]) {
                if (calcWeek[j].getDate() == dateArr[1]) {
                    if (calcWeek[j].getFullYear() == dateArr[2]) {
                        currentWeek.push({month: dateArr[0], day: dateArr[1], year: dateArr[2], type: type, name: name});
                    }
                }
            }
        }
    }    

    embedArr = [];

    embedArr.push(embedMessage);

    for (var y = 0; y < currentWeek.length; y++) {
        embedArr.push(new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${currentWeek[y].name}`)
            .setDescription(`${currentWeek[y].type}`)
            .addFields(
                { name: '\u200B', value: '\u200B' },
                { name: '__Due Date__', value: `${currentWeek[y].month}/${currentWeek[y].day}/${currentWeek[y].year}`},
            ));
    }
}

client.login(config.token);

let scheduledMessage = new cron.CronJob(`0 8 * * SAT`, () => {
    var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();

    weeklySchedule(day, month, year);

    let channel = client.channels.cache.get(config.channelid);

    for(var i = 0; i < embedArr.length; i++) {
        channel.send(embedArr[i]);
    }

    embedArr = [];

}).start();