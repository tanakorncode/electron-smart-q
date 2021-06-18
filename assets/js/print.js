const fs = require("fs")
const _ = require("lodash")
const JsBarcode = require("jsbarcode")
const QRCode = require("qrcode")
const sprintf = require("sprintf-js").sprintf
const path = require("path")
const { ipcRenderer } = require("electron")
const moment = require("moment")
moment.locale("th")

let isPackaged = false

// window.addEventListener("DOMContentLoaded", async () => {
// 	await loadSetting()
// })

async function loadSetting() {
	let settingPath = path.join(__dirname, "setting.json")
	let ticketPath = path.join(__dirname, "ticket.html")
	if (isPackaged) {
		settingPath = path.join(process.resourcesPath, "setting.json")
		ticketPath = path.join(process.resourcesPath, "ticket.html")
	}
	let rawdata = fs.readFileSync(settingPath, { encoding: "utf-8" })
	let ticket = fs.readFileSync(ticketPath, { encoding: "utf-8" })
	let setting = JSON.parse(rawdata)

	let queue = ""
	if (window.localStorage.getItem("queue")) {
		queue = window.localStorage.getItem("queue")
	} else {
		queue = sprintf(`%'0${_.get(setting, "num_digit", 3)}d`, 0)
	}
	const nextQueue = getNextPLNumber(_.get(setting, "prefix", "A"), queue)

	document.getElementById("print-content").innerHTML = replaceTemplate(ticket, nextQueue)
	if (document.getElementById("barcode")) {
		JsBarcode("#barcode", nextQueue, { displayValue: false, height: 80, width: 2, margin: 0 })
	}
	if (document.getElementById("qrcode")) {
		QRCode.toDataURL(nextQueue, { width: 100, margin: 0 }, function (err, url) {
			if (err) console.error(err)
			document.getElementById("qrcode").src = url
		})
	}

	let printCount = 1
	if (window.localStorage.getItem("printCount")) {
		printCount = parseInt(window.localStorage.getItem("printCount")) + 1
	}

	// save last q
	window.localStorage.setItem("queue", nextQueue)
	window.localStorage.setItem("printCount", printCount)
	document.title = nextQueue
}

function getNextPLNumber(prefix, lastNumber) {
	let n = `${prefix}`
	if (lastNumber) {
		const n1 = parseInt(lastNumber.replace(/^\D+/g, "")) + 1
		const strlen = String(lastNumber).replace(prefix, "").length
		const number = sprintf(`%'0${strlen}d`, n1)
		n = `${prefix}${number}`
	}
	return n
}

function replaceTemplate(raw, nextQueue) {
	var d = new Date()
	var y = d.getFullYear() + 543
	return raw
		.replace("{queue}", nextQueue)
		.replace("{printdate}", moment().format("DD MMM ") + y.toString().substr(2) + moment().format(" HH:mm น."))
}

ipcRenderer.on("print", (event, arg) => {
	console.log("print")
	isPackaged = arg
	loadSetting()
})
