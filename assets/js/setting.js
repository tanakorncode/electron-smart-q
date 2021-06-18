const { ipcRenderer, remote } = require("electron")
const { dialog } = remote
const fs = require("fs")
const _ = require("lodash")
const path = require("path")
// const $ = require("jquery")
const moment = require("moment")
moment.locale("th")

let isPackaged = false

var editor

$(document).ready(function () {
	// loadSetting()
	$("#form-setting").submit(function (e) {
		e.preventDefault()

		// var data = JSON.stringify(getFormData($(this).serializeArray()))
		var data = {}
		$(this)
			.serializeArray()
			.map(function (x) {
				data[x.name] = x.value
			})

		ipcRenderer.send("save-setting", JSON.stringify(data))
		ipcRenderer.send("save-ticket", editor.getData())

		alert("Success!")
		remote.getCurrentWindow().close()

		return false
	})
	document.getElementById("select-file").addEventListener(
		"click",
		function () {
			dialog
				.showOpenDialog({
					properties: ["openFile"], // openDirectory
					filters: [{ name: "Movies", extensions: ["mp4"] }],
				})
				.then((result) => {
					console.log(result.canceled)
					console.log(result.filePaths)
					if (result.canceled === false) {
						watchFileName = result.filePaths[0]
						document.getElementById("video").value = watchFileName
					}
				})
				.catch((err) => {
					console.log(err)
				})
		},
		false
	)
})

function getFormData(formArray) {
	//serialize data function
	var returnArray = {}
	for (var i = 0; i < formArray.length; i++) {
		returnArray[formArray[i]["name"]] = formArray[i]["value"]
	}
	return returnArray
}

async function loadSetting() {
	let settingPath = path.join(__dirname, "setting.json")
	let ticketPath = path.join(__dirname, "ticket.html")
	let defaultTicketPath = path.join(__dirname, "default-ticket.html")
	if (isPackaged) {
		settingPath = path.join(process.resourcesPath, "setting.json")
		ticketPath = path.join(process.resourcesPath, "ticket.html")
		defaultTicketPath = path.join(process.resourcesPath, "app.asar", "default-ticket.html")
	}
	let rawdata = fs.readFileSync(settingPath, { encoding: "utf-8" })
	let rawTicket = fs.readFileSync(ticketPath, { encoding: "utf-8" })
	if (!rawTicket) {
		rawTicket = fs.readFileSync(defaultTicketPath, { encoding: "utf-8" })
	}
	let setting = JSON.parse(rawdata)
	const printers = remote.getCurrentWindow().webContents.getPrinters()
	setPrinttingOptions(printers)
	document.getElementById("ticket-template").innerHTML = rawTicket

	document.getElementById("printers").value = _.get(setting, "printer", "")
	document.getElementById("limit-queue").value = _.get(setting, "limit_queue", "")
	document.getElementById("prefix").value = _.get(setting, "prefix", "A")
	document.getElementById("num-digit").value = _.get(setting, "num_digit", "3")
	document.getElementById("header").value = _.get(setting, "header", "ชื่อหน่วยงาน")
	document.getElementById("caption").value = _.get(setting, "caption", "ศูนย์ฉีดวัคซีน")
	document.getElementById("btn-print-label").value = _.get(setting, "button_label", "รับบัตรคิว")
	document.getElementById("marquee").innerHTML = _.get(setting, "marquee", "")
	document.getElementById("color-btn-print").value = _.get(setting, "button_color", "#f1c40f")
	document.getElementById("video").value = _.get(setting, "video", "")
	$("#color-btn-print").spectrum({
		color: _.get(setting, "button_color", "#f1c40f"),
		allowEmpty: true,
		showInput: true,
		containerClassName: "full-spectrum",
		showInitial: true,
		showPalette: true,
		showSelectionPalette: true,
		showAlpha: true,
		maxPaletteSize: 10,
		preferredFormat: "hex",
		localStorageKey: "spectrum.demo",
		show: function () {},
		beforeShow: function () {},
		palette: [
			[
				"rgb(0, 0, 0)",
				"rgb(67, 67, 67)",
				"rgb(102, 102, 102)" /*"rgb(153, 153, 153)","rgb(183, 183, 183)",*/,
				"rgb(204, 204, 204)",
				"rgb(217, 217, 217)",
				/*"rgb(239, 239, 239)", "rgb(243, 243, 243)",*/ "rgb(255, 255, 255)",
			],
			[
				"rgb(152, 0, 0)",
				"rgb(255, 0, 0)",
				"rgb(255, 153, 0)",
				"rgb(255, 255, 0)",
				"rgb(0, 255, 0)",
				"rgb(0, 255, 255)",
				"rgb(74, 134, 232)",
				"rgb(0, 0, 255)",
				"rgb(153, 0, 255)",
				"rgb(255, 0, 255)",
			],
			[
				"rgb(230, 184, 175)",
				"rgb(244, 204, 204)",
				"rgb(252, 229, 205)",
				"rgb(255, 242, 204)",
				"rgb(217, 234, 211)",
				"rgb(208, 224, 227)",
				"rgb(201, 218, 248)",
				"rgb(207, 226, 243)",
				"rgb(217, 210, 233)",
				"rgb(234, 209, 220)",
				"rgb(221, 126, 107)",
				"rgb(234, 153, 153)",
				"rgb(249, 203, 156)",
				"rgb(255, 229, 153)",
				"rgb(182, 215, 168)",
				"rgb(162, 196, 201)",
				"rgb(164, 194, 244)",
				"rgb(159, 197, 232)",
				"rgb(180, 167, 214)",
				"rgb(213, 166, 189)",
				"rgb(204, 65, 37)",
				"rgb(224, 102, 102)",
				"rgb(246, 178, 107)",
				"rgb(255, 217, 102)",
				"rgb(147, 196, 125)",
				"rgb(118, 165, 175)",
				"rgb(109, 158, 235)",
				"rgb(111, 168, 220)",
				"rgb(142, 124, 195)",
				"rgb(194, 123, 160)",
				"rgb(166, 28, 0)",
				"rgb(204, 0, 0)",
				"rgb(230, 145, 56)",
				"rgb(241, 194, 50)",
				"rgb(106, 168, 79)",
				"rgb(69, 129, 142)",
				"rgb(60, 120, 216)",
				"rgb(61, 133, 198)",
				"rgb(103, 78, 167)",
				"rgb(166, 77, 121)",
				/*"rgb(133, 32, 12)", "rgb(153, 0, 0)", "rgb(180, 95, 6)", "rgb(191, 144, 0)", "rgb(56, 118, 29)",
        "rgb(19, 79, 92)", "rgb(17, 85, 204)", "rgb(11, 83, 148)", "rgb(53, 28, 117)", "rgb(116, 27, 71)",*/
				"rgb(91, 15, 0)",
				"rgb(102, 0, 0)",
				"rgb(120, 63, 4)",
				"rgb(127, 96, 0)",
				"rgb(39, 78, 19)",
				"rgb(12, 52, 61)",
				"rgb(28, 69, 135)",
				"rgb(7, 55, 99)",
				"rgb(32, 18, 77)",
				"rgb(76, 17, 48)",
			],
		],
	})
	$("#color-btn-print").show()
	initEditor()
}

function setPrinttingOptions(printings) {
	// get reference to select element
	var sel = document.getElementById("printers")

	for (const i in printings) {
		// create new option element
		var opt = document.createElement("option")

		// create text node to add to option element (opt)
		opt.appendChild(document.createTextNode(printings[i].name))

		// set value property of opt
		opt.value = printings[i].name

		// add opt to end of select box (sel)
		sel.appendChild(opt)
	}
}

function initEditor() {
	editor = CKEDITOR.inline("ticket-template", {
		contenteditable: true,
		language: "th",
		extraPlugins: "sourcedialog",
		uiColor: "#f1f3f6",
	})
	editor.on("change", function () {
		var data = replaceTemplate(editor.getData())

		$("#editor-preview").html(data)
		editor.updateElement()
	})
	var data = replaceTemplate(editor.getData())
	$("#editor-preview").html(data)
}

function replaceTemplate(raw) {
	var d = new Date()
	var y = d.getFullYear() + 543
	return raw
		.replace("{hospitalname}", "โรงพยาบาลทดสอบ")
		.replace("{queue}", "A0001")
		.replace("{service}", "ศูนย์ฉีดวัคซีน")
		.replace("{printdate}", moment().format("DD MMM ") + y.toString().substr(2) + moment().format(" HH:mm น."))
}

ipcRenderer.on("isPackaged", (event, arg) => {
	isPackaged = arg
	loadSetting()
})
