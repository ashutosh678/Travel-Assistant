## Description

The **Travel Assistant** is a Node.js-based application designed to help users find and book travel-related services such as flights, hotels, and restaurants. It leverages a combination of Express for server-side logic, Mongoose for database interactions, and various APIs to provide real-time data. The application is built with TypeScript for type safety and uses PM2 for process management in production environments. The goal is to offer a seamless and efficient way for users to plan their travel itineraries with ease.

## Technologies Used

- Node.js
- Express
- TypeScript
- Mongoose
- PM2
- Winston

## Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/ashutosh678/Travel-Assistant
   cd Travel-Assistant
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build the project**

   ```bash
   npm run build
   ```

4. **Run the application**
   - Development:
     ```bash
     npm run dev
     ```
   - Production:
     ```bash
     pm2 start ecosystem.config.js --env production
     ```

## .env Sample

```
MONGO_URI=your_mongodb_uri
NODE_ENV=development
PORT=8000
HOST=0.0.0.0
GOOGLE_API_KEY=your_google_api_key
```

## Sample Prompts

- "Find flights from Delhi to Mumbai."
- "Show me flights from Delhi."
- "May 25."
- "Mumbai."
- "List restaurants in Mumbai."
- "List hotels in Mumbai under 20000."

## Routes

- Development: `http://localhost:8000`
- Production: `http://13.232.107.178`

## Repository

- GitHub: [Travel Assistant Repository](https://github.com/ashutosh678/Travel-Assistant)
