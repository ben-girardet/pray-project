import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { Auth, Controller, Delete, Get, Patch, Post, Restrict } from '../core/framework';
import { config } from '../core/config';
import multer from 'multer';
import path from 'path';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 24)

const storage = multer.diskStorage({
  destination: function (req: express.Request, file: Express.Multer.File, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req: express.Request, file: Express.Multer.File, cb) {

    let ext = '';
    if (file.mimetype === 'image/png') {
      ext = '.png';
    } else if (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
      ext = '.jpg';
    } else if (file.mimetype === 'image/gif') {
      ext = '.gif';
    }

    cb(null, nanoid() + ext) // appending extension
  }
})

const upload = multer({ storage })

@Controller('/image')
export class ImageController {

  @Post('/')
  async addImage(req: express.Request, res: express.Response, next: express.NextFunction) {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return next(err);
      }
      if (!req.file) {
        return next(new Error('Error while saving the image file'));
      }
      return res.status(StatusCodes.CREATED).send({id: req.file.filename});
    })
  }

  @Get('/:id')
  async getImage(req: express.Request, res: express.Response, next: express.NextFunction) {
    const { id } = req.params;
    res.status(StatusCodes.OK);
    const filepath = path.join(__dirname, `../../uploads/${id}`);
    res.download(filepath);
  }
}
