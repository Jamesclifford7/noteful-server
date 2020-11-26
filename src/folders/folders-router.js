const express = require('express')
const FoldersService = require('./folders-service')

const foldersRouter = express.Router()
const jsonParser = express.json()

foldersRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        // FoldersService.getAllFolders(knexInstance, req.params.folder_id)
        FoldersService.getAllFolders(knexInstance)
            .then(folders => {
                if(!folders) {
                    return res.status(404).json({
                        error: { message: 'No folders found' }
                    })
                }
                res.json({
                    folders
                }) 
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const { name } = req.body
        const newFolder =  { name }

        if (!newFolder) {
            return res.status(400).json({
                error: { message: `Must include 'name' of folder` }
            })
        }
        FoldersService.insertFolder(knexInstance, newFolder)
            .then(folder => {
                res 
                    .status(201)
                    .location(`/folders/${folder.id}`)
                    .json(folder)
            }) 
            .catch(next) 
    })

foldersRouter
    .route('/:id')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        // const { id } = req.params
        const folderId = req.params.id
        
        FoldersService.getById(knexInstance, folderId)
            .then(folder => {
                if (!folder) {
                    return res.status(404).json({
                        error: { message: `Folder doesn't exist` }
                    })
                }
                res.json({folder})
            })
            .catch(next) 
    })
    .delete((req, res, next) => {
        const knexInstance = req.app.get('db')
        const folderId = req.params.id

        FoldersService.deleteFolder(knexInstance, folderId)
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const folderId = req.params.id
        const { name } = req.body
        const updatedFolder = { name }
        if (!updatedFolder) {
            return res.status(400).json({
                message: `Request body must contain a 'name'`
            })
        }
        FoldersService.updateFolder(knexInstance, folderId, updatedFolder)
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    

module.exports = foldersRouter