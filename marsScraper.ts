import { By, Builder, Key } from 'selenium-webdriver';
import { config } from "dotenv";
config();

const url = process.env.MARS_URL;

const driver = new Builder()
    .forBrowser('chrome')
    .build();

driver.get(url).then();

export const GetRawImages = (): Promise<string[]> => {
    return new Promise(async (resolve, reject) => {
        let sources: string[] = []

        await driver.findElement(By.id("header_pagination"))
            .then( async (input) => {
                await input.getAttribute("max")
                    .then( async (pageMax) => {
                        // loop through all the pages
                        for (let i = 0; i < +pageMax; i++) {
                            // get images on page
                            await driver.findElement(By.className("raw_images_list")).then( async (imgList) => {
                                await imgList.findElements(By.css("img")).then( async (images) => {
                                    for (const img of images) {
                                        await img.getAttribute("src")
                                            .then(src => {
                                                sources.push(src);
                                            });
                                    }

                                    // change to next page
                                    // await input.sendKeys(Key.ARROW_UP)
                                })
                            })
                        }
                    })
                    .catch(err => {
                        reject(`error getting pagination input max: ${err}`)
                    })

            })
            .catch(err => reject(`error getting pagination input: ${err}`))

        console.log("Num sources: ", sources.length)

        resolve(sources)
    })
}
