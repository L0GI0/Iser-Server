import express, { json } from "express"; // json cos we sending json back
import cors from "cors"; // for cors problems
import dotenv from "dotenv"; // for env variables
import cookieParser from "cookie-parser"; // cos we are using cookies
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import usersRouter from "./routes/users-routes.js";
import authRouter from "./routes/auth-routes.js";

dotenv.config(); // it will look for .env file pull any enviramental variables from that file

const __dirname = dirname(fileURLToPath(import.meta.url)); // need when using static files

const app = express();
const PORT = process.env.PORT || 5000; // gives the port in a env variable called PORT e.g at HEROKU
const corsOptions = { credentials: true, origin: process.env.URL || "*" }; // URL for origin
// star means that anything can access your API

app.use(cors(corsOptions));
app.use(json());
app.use(cookieParser());

app.use("/", express.static(join(__dirname, "public"))); // this is saying that we are going
// to put static files in a folder public

app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);

app.listen(PORT, () => console.log(`Server is listening on ${PORT}`));
