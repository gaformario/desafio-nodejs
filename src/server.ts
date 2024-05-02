import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import swaggerFile from "./swagger.json";

// Importando rotas
import userRoutes from "./routes/users";
import projectRoutes from "./routes/projects";
import taskRoutes from "./routes/tasks";
import tagRoutes from "./routes/tags";

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Rota para servir a documentação Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Rotas
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/tags", tagRoutes);

// Rota principal
app.get("/", (req, res) => {
  res.send("API do Task Manager");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
