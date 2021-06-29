let Discord = require('discord.js');
let https = require('https');
let fs = require('fs');

let client = new Discord.Client();

client.once('ready', () => {
    console.log('QuickMafs is online!');
});

client.on('message', async message => {
    let prefix = '$';
    if (message.content.startsWith(prefix) && !message.author.bot) {
        // TODO(chuck): Uhhh, how should this actually be wrapped?
        let formula = `\\begin{align*}
${message.content.substr(prefix.length)}
\\end{align*}`;
        console.log('formula', formula);

        let params = new URLSearchParams({
            fcolor: 'ffffff',
            formula,
            fsize: '36px',
            mode: '0',
            out: '1',
            remhost: 'quicklatex.com',
            preamble: `\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}`,
        });
        let request = https.request({
            hostname: 'quicklatex.com',
            port: 443,
            path: '/latex3.f/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }, response => {
            response.on('data', data => {
                /*
                NOTE(chuck): Funky format it returns is:

                    0
                    https://quicklatex.com/cache3/82/ql_0676ade0cd04eda37aeb3d0bcd427682_l3.png 0 147 53

                */
                let imageUrl = data.toString().split('\n')[1].split(' ')[0];
                let embed = new Discord.MessageEmbed()
                    .setImage(imageUrl);
                message.channel.send(embed);
            });
        });
        request.on('error', error => {
            console.error(error);
        });
        request.write(params.toString());
        request.end();
    }
});

let bot_token = fs.readFileSync('bot_token.txt');
client.login(bot_token.toString().trim());