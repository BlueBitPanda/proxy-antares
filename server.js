const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// GANTI dengan kredensial Antares Anda!
const ANTARES_CONFIG = {
  url: 'http://platform.antares.id:8080/~/antares-cse/antares-id/Senssuhu/esp32',
  accessKey: '36ff4748b33266de:d965e2cba023782f', // GANTI!
  appName: 'Senssuhu',
  deviceName: 'esp32'
};

app.get('/', (req, res) => {
  res.send('<h1>✅ Server Proxy Aktif!</h1><p>Endpoint: POST /forward</p>');
});

app.post('/forward', async (req, res) => {
  try {
    console.log('📥 Data diterima:', JSON.stringify(req.body));

    const antaresPayload = {
      "m2m:cin": {
        "con": JSON.stringify(req.body)
      }
    };

    console.log('📤 Mengirim ke Antares...');

    const response = await axios.post(
      ANTARES_CONFIG.url,
      antaresPayload,
      {
        headers: {
          'X-M2M-Origin': 36ff4748b33266de:d965e2cba023782f,
          'Content-Type': 'application/json;ty=4',
          'Accept': 'application/json'
        },
        timeout: 15000
      }
    );

    console.log('✅ Sukses! Status:', response.status);

    res.json({
      success: true,
      message: 'Data berhasil dikirim ke Antares',
      status: response.status,
      data: req.body
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Gagal mengirim ke Antares',
      error: error.message
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Proxy Server AKTIF di port', PORT);
});

module.exports = app;
