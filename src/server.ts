import httpServer from './app';
import dotenv from 'dotenv';

dotenv.config();



// Keep this for production/non-Vite environments

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  //console.log(`HOME:${process.env.HOME}`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
