import fs from 'fs';
import sharp from 'sharp';
import { ErrorException, FILE_TYPE } from '@azteam/error';

class SharpImage {
    static getImageInfo(imgPath) {
        return sharp(imgPath).metadata()
            .then(metadata => {
                return metadata;
            })
            .catch(err => {
                throw new ErrorException(FILE_TYPE, {
                    mime: 'undefined',
                });
            });
    }

    static async resize(imgPath, format, width = null, height = null) {
        const imgInfo = await this.getImageInfo(imgPath);

        const readStream = fs.createReadStream(imgPath);
        let transform = sharp(null,{failOnError: false});

        if (format) {
            transform = transform.toFormat(format);
        }
        if (width || height) {
            if (width && height) {

                transform = transform.resize(width, height, {
                    // kernel: sharp.kernel.nearest,
                    fit: 'contain',
                    background: {r: 255, g: 255, b: 255}
                });
            } else {
                transform = transform.resize(width, height);
            }
        }
        try {
            transform = transform.sharpen();
            return readStream.pipe(transform);
        } catch (e) {
            throw new ErrorException(FILE_TYPE, {
                mime: 'undefined',
            });
        }
    }

    async addWatermark(imgPath, watermarkPath) {
        const imgInfo = await this.getImageInfo(imgPath);

        const watermarks = fs.readdirSync(watermarkPath);

        const watermark_size = Math.floor(info.width / 5);
        const top = Math.floor(info.height - watermark_size - watermark_size / 6);
        const left = Math.floor(info.width - watermark_size - watermark_size / 6);

        const input = await sharp(watermarkPath, {failOnError: false})
            .resize(watermark_size, watermark_size)
            .toBuffer();

        return sharp(imgPath)
            .composite([{
                input, top, left, blend: 'overlay'
            }])
            .toBuffer();
    }
}

export default SharpImage;