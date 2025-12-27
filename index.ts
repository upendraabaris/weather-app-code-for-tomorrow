import express, { Request, Response } from "express";
import { Client } from "pg";
import axios, { AxiosResponse } from "axios";
import bodyParser from "body-parser";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* -------------------- DATABASE -------------------- */

const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "1234",
    database: "weather"
});

/* -------------------- TYPES -------------------- */

interface WeatherResponse {
    main: {
        temp: number;
        temp_min: number;
        temp_max: number;
    };
}

/* -------------------- UTILS -------------------- */

function fahrenheitToCelsius(fahrenheit: number): number {
    return (fahrenheit - 32) * 5 / 9;
}

async function weatherData(city: string): Promise<WeatherResponse> {
    try {
        const API_KEY = "a12740d982827be3885cc5890f667e0b";
        const response: AxiosResponse<WeatherResponse> =
            await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
            );

        return response.data;
    } catch (error) {
        throw new Error("Failed to fetch data");
    }
}

/* -------------------- ROUTES -------------------- */

app.get("/analytics/city/:name", async (req: Request, res: Response) => {
    const city: string = req.params.name;
    const API_KEY = "a12740d982827be3885cc5890f667e0b";

    try {
        const response: AxiosResponse<WeatherResponse> =
            await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
            );

        const temp_min = fahrenheitToCelsius(response.data.main.temp_min);
        const temp_max = fahrenheitToCelsius(response.data.main.temp_max);
        const temp = fahrenheitToCelsius(response.data.main.temp);

        if (temp > 35) {
            const message = `It's too hot in ${city}`;
            return res.json({ data: { temp_min, temp_max, message } });
        }

        res.json({ data: { temp_min, temp_max, temp } });
    } catch (error) {
        res.status(500).send({ error: "Failed to fetch data" });
    }
});

app.post("/city", async (req: Request, res: Response) => {
    try {
        const city: string = req.body.city;
        const result = await weatherData(city);
        res.json({ data: result });
    } catch (error) {
        res.status(500).send({ error: "Failed to fetch city weather" });
    }
});

app.post("/analytics/cities", async (req: Request, res: Response) => {
    try {
        const { cities }: { cities: string[] } = req.body;

        const temps: number[] = [];
        let highest: { city: string; temp: number } | null = null;
        let lowest: { city: string; temp: number } | null = null;
        const hotCities: string[] = [];

        for (const city of cities) {
            const weather = await weatherData(city);
            const temp = fahrenheitToCelsius(weather.main.temp);

            temps.push(temp);

            if (!highest || temp > highest.temp) {
                highest = { city, temp };
            }

            if (!lowest || temp < lowest.temp) {
                lowest = { city, temp };
            }

            if (temp > 35) {
                hotCities.push(city);
            }

            await client.query(
                "INSERT INTO city_weather(city, temprature) VALUES($1,$2)",
                [city, temp]
            );
        }

        res.json({
            hightestTemperature: highest,
            lowestTemperature: lowest,
            hotCities
        });
    } catch (error) {
        res.status(500).send({ error: "Failed to process cities" });
    }
});

app.get("/citystar", async (req: Request, res: Response) => {
    try {
        const result = await client.query("SELECT * FROM city_weather");
        res.json({ result: result.rows });
    } catch (error) {
        res.status(500).send({ error: "Failed to fetch data" });
    }
});

/* -------------------- SERVER -------------------- */

client
    .connect()
    .then(() => console.log("Connected to the database"))
    .catch((err) => console.error("Database connection error", err.stack));

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
