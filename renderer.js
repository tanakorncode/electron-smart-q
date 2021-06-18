// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { remote, ipcRenderer } = require("electron")
const _ = require("lodash")
const fs = require("fs")
const path = require("path")
const { BrowserWindow } = remote
const moment = require("moment")
moment.locale("th")

let isPackaged = false

let setting

var video = videojs("my-video", {
	controls: true,
	autoplay: true,
	preload: "auto",
	muted: true,
	fluid: false,
	loop: true,
	// aspectRatio: "4:3",
	responsive: true,
	height: 350,
	width: 800,
})

function loadSetting() {
	let settingPath = path.resolve(".", "setting.json")
	if (isPackaged) {
		settingPath = path.join(process.resourcesPath, "setting.json")
	}
	let rawData = fs.readFileSync(settingPath, { encoding: "utf-8" })
	setting = JSON.parse(rawData)

	document.getElementById("home-header").innerHTML = _.get(setting, "header", "ชื่อหน่วยงาน")
	document.getElementById("home-caption").innerHTML = _.get(setting, "caption", "ศูนย์ฉีดวัคซีน")
	document.getElementById("btn-label").innerHTML = _.get(setting, "button_label", "รับบัตรคิว")
	document.getElementById("marquee").innerHTML = _.get(setting, "marquee", "")
	document.getElementById("home-datetime").innerHTML = moment().format("DD MMM YYYY")
	document.getElementById("btn-print").style.backgroundColor = _.get(setting, "button_color", "#f1c40f")
	var sources = []
	if (_.get(setting, "video")) {
		sources.push({
			src: _.get(setting, "video"),
			type: "video/mp4",
		})
		video.src(_.get(setting, "video"))
	}
}

ipcRenderer.on("reset", (event, arg) => {
	window.localStorage.clear()
	loadSetting()
	alert("Reset Completed!")
})
ipcRenderer.on("on-save-setting", (event, arg) => {
	loadSetting()
})
ipcRenderer.on("isPackaged", (event, arg) => {
	isPackaged = arg
	loadSetting()
})

var btn = document.getElementById("btn-print")

const printers = remote.getCurrentWindow().webContents.getPrinters()
const printer = printers.find((p) => p.isDefault === true)

btn.addEventListener("click", (event) => {
	const options = {
		silent: true,
		deviceName: _.get(setting, "printer", _.get(printer, "displayName", "")),
		color: false,
		collate: false,
		pageSize: "Letter",
		margins: {
			marginType: "custom",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
		},
		printBackground: false,
		printSelectionOnly: false,
	}

	if (_.get(setting, "limit_queue")) {
		let printCount = 1
		if (window.localStorage.getItem("printCount")) {
			printCount = parseInt(window.localStorage.getItem("printCount"))
		}
		if (printCount >= parseInt(_.get(setting, "limit_queue"))) {
			alert("ไม่สามารถพิมพ์บัตรคิวได้ เนื่องจากเกินจำนวนที่กำหนดไว้ ที่ " + _.get(setting, "limit_queue") + " รายการ")
			return
		}
	}
	let win = new BrowserWindow({
		width: 400,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true,
		},
		autoHideMenuBar: true,
		// show: false,
	})
	let printPath = path.resolve(".", "print.html")
	if (isPackaged) {
		printPath = path.join(process.resourcesPath, "app.asar", "print.html")
	}
	win.loadFile(printPath)
	if (!isPackaged) win.webContents.openDevTools()
	// win.loadURL(path.join(os.homedir(), "Desktop", "temp.pdf"))

	win.webContents.on("did-finish-load", function () {
		win.webContents.send("print", isPackaged)
		// const pdfPath = path.join(os.homedir(), "Desktop", "temp.pdf")
		// win.webContents
		//   .printToPDF({
		//     marginsType: 0,
		//     printBackground: false,
		//     printSelectionOnly: false,
		//     landscape: false,
		//     pageSize: "Letter",
		//     scaleFactor: 100,
		//   })
		//   .then((data) => {
		//     fs.writeFile(pdfPath, data, (error) => {
		//       if (error) throw error
		//       console.log(`Wrote PDF successfully to ${pdfPath}`)
		//     })
		//   })
		//   .catch((error) => {
		//     console.log(`Failed to write PDF to ${pdfPath}: `, error)
		//   })
		win.webContents.print(options, (success, failureReason) => {
			if (!success) console.log(failureReason)
			win.close()
			console.log("Print Initiated")
		})
	})
	// win.loadURL("http://202.80.234.74/app/kiosk/print?que_ids=631798")

	// setTimeout(() => {
	//   win.webContents.print(options, (success, failureReason) => {
	//     if (!success) console.log(failureReason)

	//     console.log("Print Initiated")
	//   })
	// }, 300)
})

window.addEventListener("DOMContentLoaded", () => {
	// loadSetting()

	var a = new Date()
	a.setDate(a.getDate()),
		setInterval(function () {
			var a = new Date().getSeconds()
			document.getElementById("time__sec").innerHTML = (a < 10 ? "0" : "") + a
			// $(".time__sec").html((a < 10 ? "0" : "") + a)
		}, 1e3),
		setInterval(function () {
			var a = new Date().getMinutes()
			document.getElementById("time__min").innerHTML = (a < 10 ? "0" : "") + a
			// $(".time__min").html((a < 10 ? "0" : "") + a)
		}, 1e3),
		setInterval(function () {
			var a = new Date().getHours()
			document.getElementById("time__hours").innerHTML = (a < 10 ? "0" : "") + a
			// $(".time__hours").html((a < 10 ? "0" : "") + a)
		}, 1e3)
})
