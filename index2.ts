// const {Client} = require("pg");
// const express = require("express");

// const app = express();
// const axios = require("axios");
// const bodyParser = require("body-parser");
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(bodyParser.json());


// const client = new Client({
//     host: "localhost",
//     user: "postgres",
//     port: 5432,
//     password: "1234",
//     database: "weather"
// });

// interface WeatherResponse{
//     temp_min: number;
//     temp_max: number;
//     temp: number;
//     message?: string;
// }



// app.get("/analytics/city/:name", async (req, res) => {
//     const city = req.params.name;
//     const API_KEY = "a12740d982827be3885cc5890f667e0b"
//     try{
//         const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`);
//         // res.send(response.data);
//         let temp_min = fahrenheitToCelsius(response.data.main.temp_min);
//         let temp_max = fahrenheitToCelsius(response.data.main.temp_max);
//         let temp = fahrenheitToCelsius(response.data.main.temp);
//         if(temp>35){
//             let message = "It's too hot in "+city;
//             res.json({data:{temp_min,temp_max,message}});
//         }
//         res.json({data:{temp_min,temp_max,temp}});

//     }catch(error){
//         res.status(500).send({error: "Failed to fetch data"});
//     }
// })


// async function weatherData(city){
//     try{
//         const API_KEY = "a12740d982827be3885cc5890f667e0b"
//         const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`);
//         return response.data;
//     }catch(error)
//     {
//         throw new Error("Failed to fetch data");
//     }
// }

// app.post("/city",async (req,res)=>{
//     const result = await weatherData(req.body.city);
//     res.json({data:result});
// })

// app.post("/analytics/cities", async (req, res) => {
//     try{
//         const { cities } = req.body;
//         let temps = [];
//         let highest = null;
//         let lowest = null;
//         let hotCities = [];
//         for (let city of cities) {
//             const weather = await weatherData(city);
//             const temp = fahrenheitToCelsius(weather.main.temp);

//             temps.push(temp);

//             if(!highest || temp > highest.temp)
//                 highest = {city, temp};
//             if(!lowest || temp < lowest.temp)
//                 lowest = {city, temp};

//             if(temp > 35)
//                 hotCities.push(city);

//             // const averageTemperature = temps.reduce((a, b) => a + b, 0) / temps.length;


//             await client.query('INSERT INTO city_weather(city, temprature) VALUES($1,$2)', [city, temp]);
//             console.log(weather)
//         }
//         res.json({
//             hightestTemperature: highest,
//             lowestTemperature: lowest,
//             // averageTemperature: averageTemperature,
//             hotCities: hotCities
//         });
//     }catch(error){
//         res.status(500).send({error: "Failed to process cities"});
//     }
// });

// app.get("/citystar",async(req,res)=>{
//     const result = await client.query('SELECT * FROM city_weather');
//     res.json({result:result.rows});
//     }
// )


// function fahrenheitToCelsius(fahrenheit) {
//     return (fahrenheit - 32) * 5 / 9;
// }

// client.connect().then(() => {
//     console.log("Connected to the database");
// }).catch((err) => {
//     console.error("Database connection error", err.stack);
// })

// app.listen(3000, () => {
//   console.log("Server is running on port 3000");
// })