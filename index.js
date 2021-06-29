let Discord = require('discord.js');
let https = require('https');
let fs = require('fs');

let client = new Discord.Client();

client.once('ready', () => {
    console.log('QuickMafs is online!');
});

client.on('message', async message => {
    if (message.content.startsWith('$') &&
        message.content.endsWith('$') &&
       !message.author.bot
    ) {
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
                message.channel.send(imageUrl);
            });
        });
        request.on('error', error => {
            console.error(error);
        });

        // TODO(chuck): Uhhh, how should this actually be wrapped?
        let formula = message.content.slice(1, -1);
        console.log('formula', formula);
        let wrappedFormula = `\\setlength{\\fboxsep}{.5em}
\\renewcommand\\fbox{\\fcolorbox{black}{black}}\\color{white}
\\fbox{
    \\begin{center}
    ${formula} \\nonumber
    \\end{center}
}`;
        console.log('wrapped formula', wrappedFormula);
        let formData = {
            formula: wrappedFormula,
            fsize: '50px',
            mode: '0',
            out: '1',
            remhost: 'quicklatex.com',
            preamble: `\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{mhchem}
\\usepackage{xcolor}`,
        };
        let fusedPairs = [];
        for (let [k, v] of Object.entries(formData)) {
            fusedPairs.push(k + '=' + v);
        }
        // TODO(chuck): Shouldn't this be encoded somehow? What if the formula
        // contains & characters?
        let fusedRequest = fusedPairs.join('&');
        console.log('fused request', fusedRequest);
        request.write(fusedRequest);
        request.end();
    }
});

let bot_token = fs.readFileSync('bot_token.txt');
client.login(bot_token.toString().trim());