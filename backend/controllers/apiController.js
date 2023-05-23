const homeController = require("express").Router();
const axios = require('axios');
const { DateTime } = require('luxon');

const municipality = "Malolos";

homeController.get('/signal', async (req, res) => {
  try {
    const url = 'https://pagasa.chlod.net/api/v1/bulletin/list';
    const { data } = await axios.get(url);
    const bulletins = data.bulletins;

    let maxCount = 0;
    let maxIndex = 0;


    bulletins.forEach((bulletin, index) => {
      if (bulletin.count > maxCount) {
        maxCount = bulletin.count;
        maxIndex = index;
      }
    });

    /* test data */
 /*   maxIndex = 4; */


    const name = bulletins[maxIndex].name;
    const count = bulletins[maxIndex].count;
    const final = bulletins[maxIndex].final;
    const file = bulletins[maxIndex].file;
    const link = bulletins[maxIndex].link;

    const filename = link.substring(link.lastIndexOf('/') + 1);
    console.log(count);
    let counter = 0;
    let looping = true;

    do {
      const parseUrl = `https://pagasa.chlod.net/api/v1/bulletin/parse/${filename}`;
      const parseHeaders = await axios.head(parseUrl);
      /*   console.log(parseUrl); */
      /* console.log(parseHeaders); */

      if (parseHeaders.status !== 200) {
        console.log('Error: Unable to retrieve data from URL.');

        const downloadUrl = `https://pagasa.chlod.net/api/v1/bulletin/download/${filename}`;
        const { data: datas } = await axios.get(downloadUrl);

        counter++;

        if (counter > 1) {
          break;
        }
      } else {
        looping = false;

        const { data: parseData } = await axios.get(parseUrl);

        const dateString = '2023-06-12T12:00:00.000Z';
        const targetDate = DateTime.fromISO(dateString);
        const currentDate = DateTime.now();

        if (currentDate > targetDate) {
          return res.status(201).json({ signal: 0 });
        } else {
          let hasSignal = false; 

          for (const [signal, signalData] of Object.entries(parseData.bulletin.signals)) {
            if (signalData !== null) {
       
              const areas = Object.values(signalData.areas);
              for (const area of areas) {
 
                for (const location of area) {

                  if (
                    location.includes &&
                    location.includes.objects &&
                    location.includes.objects.includes(municipality)
                  ) {
              
                    return res.status(201).json({ signal: `${signal}`, track: `https://pubfiles.pagasa.dost.gov.ph/tamss/nwp/wrf/ccover/PH_ccover_d01_024h.gif` });
                  } else if (location.name === municipality) {
                    hasSignal = true;
                  }
                }
              }
            }
          }

          if (!hasSignal) {
            return res.status(201).json({  signal: 0 }); 
          }
        }
      }
    } while (looping);
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred' });
  }
});

module.exports = homeController;
