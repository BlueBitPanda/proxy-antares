const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// PENTING: Gunakan konstanta untuk Access Key yang sudah dikoreksi
const ANTARES_ACCESS_KEY = '36ff4748b33266de:d965e2cba023782f'; 

const ANTARES_CONFIG = {
  url: 'http://platform.antares.id:8080/~/antares-cse/antares-id/Senssuhu/esp32',
  // Hapus accessKey di sini, gunakan ANTARES_ACCESS_KEY di bawah
};

app.get('/', (req, res) => {
  res.send('<h1>✅ Server Proxy Aktif!</h1><p>Endpoint: POST /forward</p>');
});

app.post('/forward', async (req, res) => {
  try {
    console.log('📥 Data diterima:', JSON.stringify(req.body));

    // Payload yang diterima dari Wokwi (misalnya: {"status": 0})
    const receivedData = req.body; 

    // Membangun payload Antares: membungkus data menjadi string di properti "con"
    const antaresPayload = {
      "m2m:cin": {
        "con": JSON.stringify(receivedData) // Output: "con": "{\"status\":0}"
      }
    };

    console.log('📤 Mengirim ke Antares dengan payload:', JSON.stringify(antaresPayload));

    const response = await axios.post(
      ANTARES_CONFIG.url,
      antaresPayload,
      {
        headers: {
          // *** PERBAIKAN KRITIS 1: TAMBAH TANDA KUTIP ***
          'X-M2M-Origin': ANTARES_ACCESS_KEY, 
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
      // Tampilkan respons Antares yang sukses
      antaresResponse: response.data 
    });

  } catch (error) {
    // Tangani error Axios
    const antaresStatus = error.response ? error.response.status : 500;
    const antaresData = error.response ? error.response.data : { message: error.message };
    
    console.error('❌ Error! Status Antares:', antaresStatus);
    console.error('❌ Respons Gagal Antares:', JSON.stringify(antaresData));

    res.status(antaresStatus).json({
      success: false,
      message: 'Gagal mengirim ke Antares',
      status: antaresStatus,
      antaresError: antaresData
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Proxy Server AKTIF di port', PORT);
});

module.exports = app;
