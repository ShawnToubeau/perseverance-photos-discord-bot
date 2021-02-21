import { By, Builder } from 'selenium-webdriver';
import { config } from "dotenv";
config();

const url = process.env.MARS_URL;

const driver = new Builder()
    .forBrowser('chrome')
    .build();

driver.get(url).then();

export const GetRawImages = (): Promise<string[]> => {
    return new Promise(async (resolve) => {
        let sources: string[] = []

        await driver.findElement(By.className("raw_images_list")).then( async (imgList) => {
            await imgList.findElements(By.css("img")).then( async (images) => {
                for (const img of images) {
                    await img.getAttribute("src")
                        .then(src => {
                            sources.push(src);
                        });
                }
            })
        })

        resolve(sources)
    })
}
