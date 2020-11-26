const express = require('express')
const NotesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()

notesRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')

        NotesService.getAllNotes(knexInstance)
            .then(notes => {
                if(!notes) {
                    return res.status(404).json({
                        error: { message: 'No notes found'}
                    })
                }
                res.json({notes})
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const { title, content, folderid } = req.body
        if (!title) {
            return res.status(400).json({
                error: { message: `must include 'title' of note` }
            })
        }
        if (!content) {
            return res.status(400).json({
                error: { message: `must include 'content' of note` }
            })
        }
        if (!folderid) {
            return res.status(400).json({
                error: { message: `must include 'folderid' of note` }
            })
        }
        const newNote = {
            title, 
            content, 
            folderid
        }

        NotesService.insertNote(knexInstance, newNote)
            .then(note => {
                res
                    .status(201)
                    .location(`/notes/${note.id}`)
                    .json(note)
            })
            .catch(next)
    })

notesRouter
    .route('/:id')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        // const  { id }  = req.params
        const noteId = req.params.id 
        console.log(noteId)
        NotesService.getById(knexInstance, noteId)
            .then(note => {
                if (!note) {
                    return res.status(404).json({
                        error: { message: `Note doesn't exist` }
                    })
                }
                res.json({ note })
            })
        .catch(next)
    })
    .delete((req, res, next) => {
        const knexInstance = req.app.get('db')
        const noteId = req.params.id 
        console.log(noteId)
        NotesService.deleteNote(knexInstance, Number(noteId))
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const noteId = req.params.id
        const { title, content, date_modifed, folderid } = req.body
        const updatedNote = { title, content, date_modifed, folderid }

        const numberOfValues = Object.values(updatedNote).filter(Boolean).length
        if (numberOfValues === 0 ) {
            return res.status(400).json({
                error: { message: `Request body must contain either 'title', 'content', 'date modified, or folder id'` }
            })
        }
        NotesService.updateNote(knexInstance, noteId, updatedNote)
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = notesRouter