import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { CancelError, download } from "electron-dl";
import fs, { readFileSync } from "fs";
import path from 'path'



export function saveWithDialog(){
  return ipcMain.handle('saveWithDialog', async (event, {fileContent,fileName}) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    const { filePath } = await dialog.showSaveDialog(window!, {
        title: 'Save File',
        defaultPath: fileName, // Suggest a default path and name
    });

    if (filePath) {
        try {
            fs.writeFileSync(filePath, fileContent);
            return filePath; // Return the path if successful
        } catch (err) {
            console.error('Failed to save file:', err);
            return null;
        }
    }
    return null; // Return null if save is cancelled
  });
}

export function saveWithoutDialog(){
    return ipcMain.handle("saveWithoutDialog", async (event, {fileContent,fileName,filePath})=>{
        if (filePath) {
            try {
            const fullFilePath =  filePath+path.sep+fileName
            fs.writeFileSync(fullFilePath, fileContent);
            return fullFilePath; // Return the path if successful
            } catch (err) {
                console.error('Failed to save file:', err);
                return null;
            }
        }
        return null; // Return null if save is cancelled
    })
}

export function readFileWithDialog(){
    return ipcMain.handle("readFileWithDialog", async (event)=>{
        const window = BrowserWindow.fromWebContents(event.sender);
        const {filePaths} = await dialog.showOpenDialog(window!,{
            properties:["openFile"],
            filters:[]
        })
        return {
            fileContent:readFileSync(filePaths[0],{encoding:"utf-8"}),
            filePath:filePaths[0]
        }
    })
}
