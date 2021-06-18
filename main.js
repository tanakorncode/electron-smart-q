// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, ipcMain } = require("electron")
const path = require("path")
const url = require("url")
const fs = require("fs")

function createWindow() {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			preload: path.join(__dirname, "preload.js"),
			// contextIsolation: false,
			contextIsolation: false,
			enableRemoteModule: true,
		},
	})

	mainWindow.maximize()

	const isMac = process.platform === "darwin"

	const template = [
		// { role: 'appMenu' }
		...(isMac
			? [
					{
						label: app.name,
						submenu: [
							{ role: "about" },
							{ type: "separator" },
							{ role: "services" },
							{ type: "separator" },
							{ role: "hide" },
							{ role: "hideothers" },
							{ role: "unhide" },
							{ type: "separator" },
							{ role: "quit" },
						],
					},
			  ]
			: []),
		// { role: 'fileMenu' }
		{
			label: "File",
			submenu: [isMac ? { role: "close" } : { role: "quit" }],
		},
		// { role: 'editMenu' }
		/* {
			label: "Edit",
			submenu: [
				{ role: "undo" },
				{ role: "redo" },
				{ type: "separator" },
				{ role: "cut" },
				{ role: "copy" },
				{ role: "paste" },
				...(isMac
					? [
							{ role: "pasteAndMatchStyle" },
							{ role: "delete" },
							{ role: "selectAll" },
							{ type: "separator" },
							{
								label: "Speech",
								submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
							},
					  ]
					: [{ role: "delete" }, { type: "separator" }, { role: "selectAll" }]),
			],
		}, */
		// { role: 'viewMenu' }
		{
			label: "View",
			submenu: [
				{ role: "reload" },
				{ role: "forceReload" },
				{ role: "toggleDevTools" },
				{ type: "separator" },
				{ role: "resetZoom" },
				{ role: "zoomIn" },
				{ role: "zoomOut" },
				{ type: "separator" },
				{ role: "togglefullscreen" },
			],
		},
		// { role: 'windowMenu' }
		/* {
			label: "Window",
			submenu: [
				{ role: "minimize" },
				{ role: "zoom" },
				...(isMac
					? [{ type: "separator" }, { role: "front" }, { type: "separator" }, { role: "window" }]
					: [{ role: "close" }]),
			],
		}, */
		/* {
			role: "help",
			submenu: [
				{
					label: "Learn More",
					click: async () => {},
				},
			],
		}, */
		{
			label: "ตั้งค่า",
			click: async () => {
				let win = new BrowserWindow({
					width: 1000,
					height: 900,
					webPreferences: {
						nodeIntegration: true,
						contextIsolation: false,
						enableRemoteModule: true,
					},
					autoHideMenuBar: true,
				})

				let formSettingPath = path.join(__dirname, "form_setting.html")
				if (app.isPackaged) {
					formSettingPath = path.join(process.resourcesPath, "app.asar", "form_setting.html")
				}

				win.loadFile(formSettingPath)

				if (!app.isPackaged) win.webContents.openDevTools()

				win.webContents.on("did-finish-load", function () {
					win.webContents.send("isPackaged", app.isPackaged)
				})
			},
		},
		{
			label: "รีเซ็ตคิว",
			click: async () => {
				mainWindow.webContents.send("reset", "")
			},
		},
	]

	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)

	// and load the index.html of the app.
	// mainWindow.loadFile("index.html")
	mainWindow.loadURL(
		url.format({
			pathname: path.join(__dirname, "index.html"),
			protocol: "file:",
			slashes: true,
		})
	)

	// Open the DevTools.
	if (!app.isPackaged) mainWindow.webContents.openDevTools()

	let settingPath = path.join(__dirname, "setting.json")
	let ticketPath = path.join(__dirname, "ticket.html")
	if (app.isPackaged) {
		settingPath = path.join(process.resourcesPath, "setting.json")
		ticketPath = path.join(process.resourcesPath, "ticket.html")
	}

	ipcMain.on("save-setting", async (event, arg) => {
		fs.writeFileSync(settingPath, arg)
		mainWindow.webContents.send("on-save-setting", arg)
		event.reply("asynchronous-reply", "pong")
	})

	ipcMain.on("save-ticket", async (event, content) => {
		fs.writeFileSync(ticketPath, content, { encoding: "utf-8" })
		mainWindow.webContents.send("on-save-ticket", content)
		event.reply("asynchronous-reply", "pong")
	})

	mainWindow.webContents.on("did-finish-load", function () {
		mainWindow.webContents.send("isPackaged", app.isPackaged)
	})
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createWindow()

	app.on("activate", function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
	if (process.platform !== "darwin") app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
