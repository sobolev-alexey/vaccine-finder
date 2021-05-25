const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const axios = require("axios");

const impfcenters = ['arena', 'messe', 'velodrom', 'tegel'];
const impfstoff_link = "https://api.impfstoff.link/?v=0.3&robot=1";
const doctolib_booking = "https://www.doctolib.de/institut/berlin/ciz-berlin-berlin?pid=practice-";
const mapping = {
  "arena": 158431,
  "messe": 158434,
  "velodrom": 158435,
  "tegel": 158436
};
const key = 'aa7e46cae0ayfq7b18';

exports.load = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const params = req.query;
    if (!params || !params.key || params.key !== key) {
      return res.status(400).json({ error: 'Wrong key' });
    }

    try {
      const response = await axios.get(impfstoff_link);
      if (response.data) {
        const stats = response.data.stats;
        const center = stats.find(center => center.open);
        const time = (new Date()).toLocaleTimeString();
        let result = 'none';

        if (center && impfcenters.includes(center.id)) {
          result = center.name;
          const booking_link = `${doctolib_booking}${mapping[center.id]}`;
          return res.json({ result, booking_link });
        }
        console.log(`Check at ${time}: ${result}`);
        return res.json({ result });
      }
      return res.json({});
    } catch (error) {
      console.error(error);
      return res.status(403).json({ error: error.message });
    }
  });
});
