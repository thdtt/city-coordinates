const rp = require("request-promise")
const fs = require("fs");
const data = require("./data.json")

// console.log(data[0])

// https://simplemaps.com/static/data/country-cities/af/af.csv

let url = data.map(d => {
    const obj = {...d};
    let reg = /\/..-cities/g;
    const city =  d.url.match(reg)[0].replace(/\/|-cities/g,"")
    obj.csvUrl =`https://simplemaps.com/static/data/country-cities/${city}/${city}.csv`
    return obj
})
var logger = fs.createWriteStream('log.txt', {
    flags: 'a' // 'a' means appending (old data will be preserved)
  })

const _get = (url) =>
	rp({
		method: "get",
		url: url.csvUrl,
	})
		.then((d) => {
			let lines = d.split("\n");
			lines.splice(0, 1);
			let data = lines.join("\n");
			fs.writeFileSync(`./result/${url.city}.csv`, data);
            console.log(url.city, "...done");
		})
		.catch((e) => {
			console.log(e);
			logger.write(url.city);
		});

async function main() {
    const batch_size = 10;
    const process = [...url]
    for(let i = 0; i < process.length; i+=batch_size) {
        const reqs = url.splice(0,batch_size).map(_get);
        await Promise.all(reqs);
    }
}

main().then(() => {
    console.log("done");
}).catch(e => {
    console.log(e);
}).finally(() => {
    logger.end()
})