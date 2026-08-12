import { createApp } from "./app.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

createApp().listen(PORT, () => {
  console.log(`Seven Wonders server listening on http://localhost:${PORT}`);
});
